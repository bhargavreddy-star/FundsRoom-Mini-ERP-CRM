import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth.middleware';

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const customerType = req.query.customerType as string;

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { mobile: { contains: search } }
      ];
    }
    
    if (status) where.status = status;
    if (customerType) where.customerType = customerType;

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      data: customers,
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

export const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { followUps: true }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const customer = await prisma.customer.create({
      data
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const addFollowUp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { note } = req.body;
    if (!note) {
      return res.status(400).json({ message: 'Note is required' });
    }

    const followUp = await prisma.followUp.create({
      data: {
        customerId: req.params.id,
        note,
        createdBy: req.user.id
      }
    });

    res.status(201).json(followUp);
  } catch (error) {
    next(error);
  }
};

export const getFollowUps = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followUps = await prisma.followUp.findMany({
      where: { customerId: req.params.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(followUps);
  } catch (error) {
    next(error);
  }
};
