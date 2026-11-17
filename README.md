# StockFlow – SQL Inventory MVP

A multi-tenant inventory management MVP built with React + Vite, Node.js + Express, and MySQL.

## Requirements
- Node.js 20+
- MySQL 8+
- npm

## 1. Database setup
Create a database and tables by running `database/schema.sql` in MySQL Workbench or the MySQL CLI.

```sql
SOURCE /absolute/path/to/stockflow/database/schema.sql;
```

## 2. Backend setup
```bash
cd backend
cp .env.example .env
# Update DB credentials and JWT_SECRET in .env
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

## 3. Frontend setup
In another terminal:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5173`.

## Demo flow
1. Sign up with email, password, and organization name.
2. Add products with SKU, quantity, prices, and low-stock threshold.
3. Dashboard shows product count, total units, and low-stock products.
4. Update or delete products and change the organization default threshold in Settings.

## API
All protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create organization + owner |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/dashboard` | Dashboard summary |
| GET | `/api/settings` | Get settings |
| PUT | `/api/settings` | Update default threshold |

## Security / tenancy notes
- Passwords are hashed with bcrypt.
- JWT middleware authenticates protected API calls.
- Every product/settings query is scoped to the authenticated user's `organization_id`.
- SKU uniqueness is enforced per organization by a composite unique index.
- This MVP assumes one owner account per organization. It does not include invitations, roles, billing, or password reset.
- For production, add HTTPS, refresh-token/session strategy, rate limiting, request validation, backups, and security monitoring.
