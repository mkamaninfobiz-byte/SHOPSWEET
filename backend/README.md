# ShopSweet Backend

Backend API for the ShopSweet SaaS platform.

## Setup

1. Copy `.env.example` to `.env` and update your MySQL credentials.
2. Configure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, and `JWT_SECRET`.
4. Configure SMTP settings to send real contact emails using Gmail:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=465`
   - `SMTP_SECURE=true`
   - `SMTP_USER=your-gmail-address@gmail.com`
   - `SMTP_PASS=your-gmail-app-password`
   - `SMTP_FROM=ShopSweet <your-gmail-address@gmail.com>`
   - `SMTP_REPLY_TO=your-gmail-address@gmail.com`
   - `SMTP_ADMIN_EMAIL=your-gmail-address@gmail.com`
5. Install dependencies:

```bash
cd backend
npm install
```

4. The app now creates the database and tables automatically on startup using `backend/sql/schema.sql`.
   If you prefer manual setup, run:

```bash
mysql -u dev -p1234 -P3307 < sql/schema.sql
```

   If the `dev` user does not exist or the password is invalid, create it in MySQL first:

```sql
CREATE DATABASE IF NOT EXISTS shopsweet;
CREATE USER IF NOT EXISTS 'dev'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON shopsweet.* TO 'dev'@'localhost';
FLUSH PRIVILEGES;
```

5. Start the server:

```bash
npm run dev
```

## Routes

The API exposes modules under `/api`:

- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/categories`
- `/api/orders`
- `/api/carts`
- `/api/customers`
- `/api/coupons`
- `/api/reviews`
- `/api/analytics`
- `/api/uploads`
- `/api/notifications`
- `/api/inventory`
- `/api/settings`
- `/api/activity`
- `/api/staff`

## Features

- JWT authentication with token persistence
- Role-based access control (RBAC)
- Product variants, categories, inventory, and purchase orders
- Order lifecycle, refunds, tracking, and checkout
- CRM customer profiles and segmentation data
- Analytics endpoints for dashboards and reports
- File uploads and gallery media management
- Notifications, reviews, and settings management
- Activity logging and audit trails
