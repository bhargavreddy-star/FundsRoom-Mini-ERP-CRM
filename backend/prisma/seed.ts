import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.challanItem.deleteMany();
  await prisma.challan.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@fundsroom.com', name: 'Admin User', role: 'ADMIN', password: hashedPassword }
  });
  const sales = await prisma.user.create({
    data: { email: 'sales@fundsroom.com', name: 'Sales Executive', role: 'SALES', password: hashedPassword }
  });
  const warehouse = await prisma.user.create({
    data: { email: 'warehouse@fundsroom.com', name: 'Warehouse Manager', role: 'WAREHOUSE', password: hashedPassword }
  });
  const accounts = await prisma.user.create({
    data: { email: 'accounts@fundsroom.com', name: 'Accounts Manager', role: 'ACCOUNTS', password: hashedPassword }
  });

  const customersData = Array.from({ length: 10 }).map((_, i) => ({
    name: `Customer ${i + 1}`,
    mobile: `987654321${i}`,
    email: `customer${i + 1}@example.com`,
    businessName: `Business ${i + 1}`,
    customerType: i % 3 === 0 ? 'RETAIL' : (i % 3 === 1 ? 'WHOLESALE' : 'DISTRIBUTOR') as any,
    address: `Address ${i + 1}`,
    status: i % 2 === 0 ? 'ACTIVE' : 'LEAD' as any
  }));

  await prisma.customer.createMany({ data: customersData });
  const customers = await prisma.customer.findMany();

  const productsData = Array.from({ length: 15 }).map((_, i) => ({
    name: `Product ${i + 1}`,
    sku: `SKU-${i + 100}`,
    category: ['Electronics', 'Furniture', 'Stationery'][i % 3],
    unitPrice: (i + 1) * 100,
    currentStock: 100 + i * 10,
    minStockAlert: 20,
    warehouse: 'Main Warehouse'
  }));

  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany();

  // Create Draft Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-' + Date.now() + '1',
      customerId: customers[0].id,
      createdBy: admin.id,
      totalQuantity: 5,
      status: 'DRAFT',
      items: {
        create: [
          { productId: products[0].id, quantity: 2, productName: products[0].name, productSku: products[0].sku, productUnitPrice: products[0].unitPrice },
          { productId: products[1].id, quantity: 3, productName: products[1].name, productSku: products[1].sku, productUnitPrice: products[1].unitPrice }
        ]
      }
    }
  });

  // Create Confirmed Challan (don't subtract stock manually in seed, just set it)
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-' + Date.now() + '2',
      customerId: customers[1].id,
      createdBy: admin.id,
      totalQuantity: 10,
      status: 'CONFIRMED',
      items: {
        create: [
          { productId: products[2].id, quantity: 10, productName: products[2].name, productSku: products[2].sku, productUnitPrice: products[2].unitPrice }
        ]
      }
    }
  });

  // Create Cancelled Challan
  await prisma.challan.create({
    data: {
      challanNumber: 'CH-' + Date.now() + '3',
      customerId: customers[2].id,
      createdBy: admin.id,
      totalQuantity: 1,
      status: 'CANCELLED',
      items: {
        create: [
          { productId: products[3].id, quantity: 1, productName: products[3].name, productSku: products[3].sku, productUnitPrice: products[3].unitPrice }
        ]
      }
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
