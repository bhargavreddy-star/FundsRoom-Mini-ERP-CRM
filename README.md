# FundsRoom Mini ERP + CRM Operations Portal

A full-stack Mini ERP & CRM system built for wholesale and distribution businesses. Enables internal teams (Sales, Warehouse, Accounts, Admin) to manage customer leads, track product inventory with real-time stock movements, generate delivery challans with strict stock protection, and monitor operational performance.

---

## 🏗️ Architecture & Tech Stack

### **Backend**
- **Runtime & Language**: Node.js & TypeScript
- **Framework**: Express.js REST API
- **Database & ORM**: SQLite + Prisma ORM (Prisma Schema, Client & Seeder)
- **Security**: JWT Authentication & Bcrypt password hashing
- **Validation & Error Handling**: Express middleware with standard HTTP response status codes

### **Frontend**
- **Framework**: React 18 + TypeScript (Vite bundler)
- **Icons**: Lucide React
- **HTTP Client**: Axios with request/response interceptors for automatic JWT handling
- **Design System**: Vanilla CSS with CSS custom variables, dark mode glassmorphic UI, responsive layouts, micro-animations, and Inter typography.

---

## 👥 Role-Based Authentication & Test Credentials

The system provides role-based authorization for **Admin**, **Sales**, **Warehouse**, and **Accounts** roles.

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Admin** | `admin@fundsroom.com` | `password123` | Full access across all modules |
| **Sales** | `sales@fundsroom.com` | `password123` | Customer CRM & Delivery Challan creation |
| **Warehouse** | `warehouse@fundsroom.com` | `password123` | Product stock management & Stock Movement logging |
| **Accounts** | `accounts@fundsroom.com` | `password123` | View sales records & challan details |

---

## 📦 Core Modules Implemented

### 1. **Authentication & User Management**
- `POST /api/auth/login` - Authenticates user and returns JWT token.
- `GET /api/auth/me` - Validates token and returns user profile.

### 2. **Customer CRM Module**
- Fields: Name, Mobile, Email, Business Name, GST Number (optional), Type (Retail / Wholesale / Distributor), Address, Status (Lead / Active / Inactive), Follow-up Date, Notes.
- Features: Add, edit, list with pagination/search/filtering, detailed view, and interaction follow-up history logging.

### 3. **Product & Inventory Module**
- Fields: Name, SKU, Category, Unit Price, Current Stock, Min Stock Alert, Warehouse Location.
- Features: Product management, stock status highlighting (low stock alerts), and audit log of Stock Movements (`IN` / `OUT` with reason and user signature).

### 4. **Sales Delivery Challan Module**
- Features: Select customer, pick multiple products with quantity, auto-generate unique Challan number (`CH-YYYYMMDD-XXXX`).
- **Strict Business Logic**:
  - Validates available inventory before saving/confirming. Stock cannot go negative.
  - Snapshotting: Saves product name, SKU, and unit price in challan items at creation time.
  - Status lifecycle: `DRAFT` ➔ `CONFIRMED` (automatically deducts stock) ➔ `CANCELLED` (restores stock if cancelled).

---

## 🚀 How to Run Locally

### **Prerequisites**
- Node.js (v18 or higher)
- npm / npx

### **1. Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client & Push Database Schema
npx prisma generate
npx prisma db push

# Seed initial database records
npx tsx prisma/seed.ts

# Start backend server (runs on port 3001)
npm run dev
```

### **2. Frontend Setup**
```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Running with Docker (Bonus)

```bash
# Build and run containers for backend and frontend
docker-compose up --build
```

---

## 🌐 Environment Variables Management

- **Backend (`backend/.env`)**:
  - `PORT=3001`
  - `DATABASE_URL="file:./dev.db"`
  - `JWT_SECRET="fundsroom-erp-secret-key-2024"`

---

## ☁️ Deployment Instructions

### **Backend (Render / Railway / Fly.io)**
1. Connect GitHub repository to Render/Railway.
2. Build Command: `npm install && npx prisma generate && npm run build`
3. Start Command: `node dist/index.js`
4. Set Environment Variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`.

### **Frontend (Vercel / Netlify)**
1. Build Command: `npm run build`
2. Output Directory: `dist`
3. Configure environment variable for production API endpoint: `VITE_API_URL`.

---

## 📑 Postman Collection & API Documentation

A Postman collection JSON file (`postman_collection.json`) is included in the project root.
Import `postman_collection.json` into Postman to test all endpoints.

---

## 💡 Assumptions & Design Decisions

1. **SQLite Database**: Used SQLite for ease of single-command local setup without requiring a external DBMS service setup. Prisma schema can be pointed to PostgreSQL/MySQL in `.env` by changing the provider.
2. **Product Snapshots**: Product details (Name, SKU, Unit Price) are captured directly in Challan Items to preserve historical accuracy even if master product data changes later.
3. **Vanilla CSS Design System**: Custom HSL dark theme with glassmorphism and subtle micro-animations was chosen over utility frameworks for maximum visual polish and customization.
