# ShopSweet Enterprise CRM + Ecommerce Platform

This project is a full-stack SaaS solution for a premium Sweet Shop business, combining ecommerce, food-ordering, CRM, and admin dashboard functionality.

## Project structure

- `backend/` - Node.js + Express backend with JWT auth, RBAC, MySQL schema, file uploads, and advanced API modules.
- `frontend/` - React + Vite dashboard with Tailwind CSS, Framer Motion, Axios, and React Router.
- `backend/sql/schema.sql` - MySQL schema with 70+ tables for users, products, orders, CRM, analytics, inventory, notifications, media, and settings.

## Getting started

### Backend

1. Copy `.env.example` to `.env` and update database credentials.
2. Run `npm install` inside `backend/`.
3. Create the MySQL database and run `backend/sql/schema.sql`.
4. Start the backend server:

```bash
cd backend
npm run dev
```

### Frontend

1. Run `npm install` inside `frontend/`.
2. Start the frontend app:

```bash
cd frontend
npm run dev
```

## API coverage

The backend includes modules for:

- Auth + user management
- Products + variants + inventory
- Orders + cart + checkout
- CRM customer profiles and segmentation
- Analytics and dashboard KPIs
- Coupons, reviews, notifications, and media management
- Staff roles, permissions, activity logs, and settings

## Notes

This scaffold is designed as an enterprise-grade SaaS foundation. You can expand it with real data visualizations, payment integration, and a fully connected React dashboard.
