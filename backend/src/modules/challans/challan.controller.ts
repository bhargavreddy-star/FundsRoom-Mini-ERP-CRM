import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getChallans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [challans, total] = await Promise.all([
      prisma.challan.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { name: true }
          }
        }
      }),
      prisma.challan.count()
    ]);

    res.json({
      data: challans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getChallanById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const challan = await prisma.challan.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: true
      }
    });

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    res.json(challan);
  } catch (error) {
    next(error);
  }
};

export const createChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { customerId, items, status } = req.body;

    if (!customerId || !items || !items.length) {
      return res.status(400).json({ message: 'customerId and items are required' });
    }

    const challanNumber = 'CH-' + Date.now();
    let totalQuantity = 0;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Snapshot product data
      const challanItemsData = [];
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        
        if (status === 'CONFIRMED' && product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }

        totalQuantity += item.quantity;
        
        challanItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          productName: product.name,
          productSku: product.sku,
          productUnitPrice: product.unitPrice
        });

        // 2. Reduce stock if confirmed
        if (status === 'CONFIRMED') {
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity }
          });

          await tx.stockMovement.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              type: 'OUT',
              reason: `Challan ${challanNumber}`,
              createdBy: req.user.id
            }
          });
        }
      }

      // 3. Create challan
      const challan = await tx.challan.create({
        data: {
          challanNumber,
          customerId,
          createdBy: req.user.id,
          totalQuantity,
          status: status || 'DRAFT',
          items: {
            create: challanItemsData
          }
        },
        include: {
          items: true
        }
      });

      return challan;
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const confirmChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challanId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      });

      if (!challan) throw new Error('Challan not found');
      if (challan.status !== 'DRAFT') throw new Error('Only draft challans can be confirmed');

      for (const item of challan.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        
        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }

        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: product.currentStock - item.quantity }
        });

        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            type: 'OUT',
            reason: `Challan ${challan.challanNumber}`,
            createdBy: req.user.id
          }
        });
      }

      return await tx.challan.update({
        where: { id: challanId },
        data: { status: 'CONFIRMED' }
      });
    });

    res.json(result);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock') || error.message.includes('Only draft')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

export const cancelChallan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const challanId = req.params.id;

    const result = await prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id: challanId },
        include: { items: true }
      });

      if (!challan) throw new Error('Challan not found');
      if (challan.status === 'CANCELLED') throw new Error('Challan is already cancelled');

      if (challan.status === 'CONFIRMED') {
        // Restore stock
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: product.currentStock + item.quantity }
            });

            await tx.stockMovement.create({
              data: {
                productId: product.id,
                quantity: item.quantity,
                type: 'IN',
                reason: `Cancelled Challan ${challan.challanNumber}`,
                createdBy: req.user.id
              }
            });
          }
        }
      }

      return await tx.challan.update({
        where: { id: challanId },
        data: { status: 'CANCELLED' }
      });
    });

    res.json(result);
  } catch (error: any) {
    if (error.message.includes('already cancelled')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
