import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';


export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } }
      ];
    }
    
    if (category) where.category = category;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      data: products,
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

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const product = await prisma.product.create({
      data
    });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    // Don't allow manual stock updates through this endpoint, must use stock movements
    delete data.currentStock;
    
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const getStockMovements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(movements);
  } catch (error) {
    next(error);
  }
};

export const createStockMovement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { quantity, type, reason } = req.body;
    const productId = req.params.id;

    if (!quantity || !type || !reason) {
      return res.status(400).json({ message: 'Quantity, type (IN/OUT), and reason are required' });
    }

    const parsedQty = parseInt(quantity);
    if (parsedQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be positive' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (type === 'OUT' && product.currentStock < parsedQty) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Requested: ${parsedQty}`);
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: parsedQty,
          type,
          reason,
          createdBy: req.user.id
        }
      });

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: type === 'IN' ? product.currentStock + parsedQty : product.currentStock - parsedQty
        }
      });

      return { movement, product: updatedProduct };
    });

    res.status(201).json(result);
  } catch (error: any) {
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};
