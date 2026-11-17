# StockFlow -- SQL Inventory Management MVP

StockFlow is a multi-tenant inventory management application built with
**React + Vite**, **Node.js + Express**, and **MySQL**. It helps
organizations manage products, track quantities and prices, monitor
low-stock items, and configure inventory settings from a centralized
dashboard.

## Table of Contents

-   [Overview](#overview)
-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Architecture](#architecture)
-   [Project Structure](#project-structure)
-   [Database Design](#database-design)
-   [Installation and Setup](#installation-and-setup)
-   [Environment Variables](#environment-variables)
-   [Run the Application](#run-the-application)
-   [Demo Workflow](#demo-workflow)
-   [REST API](#rest-api)
-   [Security and Multi-Tenancy](#security-and-multi-tenancy)
-   [Deployment](#deployment)
-   [MVP Scope and Future
    Improvements](#mvp-scope-and-future-improvements)
-   [Troubleshooting](#troubleshooting)

## Overview

Businesses often rely on spreadsheets or manual records to manage
inventory. This can make it difficult to maintain accurate stock
quantities, identify products that need replenishment, and control
access to business data.

StockFlow provides a centralized inventory application with
organization-level data isolation. Each organization manages its own
products and settings.

## Features

### Authentication and organization registration

-   Register with an organization name, email address, and password.
-   Create an organization and its owner account during registration.
-   Hash passwords using bcrypt before storing them.
-   Authenticate users with JSON Web Tokens (JWT).
-   Protect private API endpoints with authentication middleware.

### Dashboard

-   View total product count.
-   View total units across products.
-   View the number of low-stock products.
-   Review an overview of current inventory.

### Product management

Users can create, view, update, and delete products. Product information
includes: - Product name. - SKU (Stock Keeping Unit). - Available
quantity. - Purchase price. - Selling price. - Low-stock threshold.

### Low-stock monitoring

A product is considered low stock when:

``` text
quantity <= low_stock_threshold
```

For example, if a product has 3 units remaining and its threshold is 5,
it is identified as low stock.

### Organization settings

-   View and update the organization's default low-stock threshold.
-   Associate settings with the correct organization.
-   Use the configured default when creating products, where supported
    by the application.

## Technology Stack

  Layer                 Technology                     Purpose
  --------------------- ------------------------------ ---------------------------------
  Frontend              React, Vite, JavaScript, CSS   User interface
  Backend               Node.js, Express.js            REST API and business logic
  Database              MySQL 8+ / TiDB Cloud          Relational data storage
  Database driver       mysql2                         SQL connectivity
  Authentication        jsonwebtoken                   JWT generation and verification
  Password security     bcryptjs                       Password hashing
  Security headers      Helmet                         HTTP security headers
  Cross-origin access   CORS                           Frontend/backend communication
  Configuration         dotenv                         Environment variables

## Architecture

StockFlow uses a three-layer architecture:

``` text
              USER / WEB BROWSER
                      |
                      v
             REACT + VITE FRONTEND
       Login | Dashboard | Products | Settings
                      |
                HTTP / JSON API
                      |
                      v
             NODE.JS + EXPRESS API
       Routes | Middleware | Business Logic
          JWT Authentication | Validation
                      |
                    mysql2
                      |
                      v
               MYSQL / TIDB CLOUD
      Organizations | Users | Products | Settings
```

### Request flow

1.  The user interacts with the React frontend.
2.  The frontend sends an HTTP request to the Express API.
3.  Protected requests include a JWT in the `Authorization` header.
4.  Authentication middleware verifies the token.
5.  The backend identifies the authenticated user's organization.
6.  SQL queries are executed through `mysql2`.
7.  The API returns a JSON response to the frontend.

## Project Structure

``` text
stockflow/
|
+-- backend/
|   +-- config/
|   |   +-- db.js
|   +-- middleware/
|   |   +-- authMiddleware.js
|   +-- routes/
|   |   +-- authRoutes.js
|   |   +-- productRoutes.js
|   |   +-- dashboardRoutes.js
|   |   +-- settingsRoutes.js
|   +-- .env.example
|   +-- package.json
|   +-- server.js
|
+-- frontend/
|   +-- public/
|   +-- src/
|   |   +-- components/
|   |   +-- context/
|   |   +-- pages/
|   |   |   +-- Dashboard
|   |   |   +-- Products
|   |   |   +-- Settings
|   |   |   +-- AuthPage
|   |   +-- services/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   |   +-- index.css
|   +-- .env.example
|   +-- package.json
|   +-- vite.config.js
|
+-- database/
|   +-- schema.sql
|
+-- README.md
```

The exact filenames or subfolders may vary slightly with the repository
version. Refer to the source tree for the authoritative structure.

## Database Design

The schema contains four main tables:

### organizations

Stores organization information.

  Column       Purpose
  ------------ --------------------
  id           Primary key
  name         Organization name
  created_at   Creation timestamp

### users

Stores user account information.

  Column            Purpose
  ----------------- ----------------------------
  id                Primary key
  organization_id   Organization reference
  email             User email
  password_hash     Hashed password
  created_at        Account creation timestamp

### products

Stores inventory records.

  Column                Purpose
  --------------------- ----------------------------
  id                    Primary key
  organization_id       Organization reference
  name                  Product name
  sku                   Stock Keeping Unit
  quantity              Available quantity
  purchase_price        Purchase price
  selling_price         Selling price
  low_stock_threshold   Product-specific threshold
  created_at            Creation timestamp
  updated_at            Last update timestamp

### settings

Stores organization-level settings, including the default low-stock
threshold.

### Relationships

``` text
organizations
    +---- users
    +---- products
    +---- settings
```

An organization can have multiple products and settings associated with
it. The current MVP workflow assumes one owner account per organization.
Product SKU uniqueness is enforced per organization using a composite
unique constraint on `(organization_id, sku)`.

For exact column definitions, foreign keys, and indexes, refer to
`database/schema.sql`.

## Installation and Setup

### Prerequisites

-   Node.js 20+
-   npm
-   MySQL 8+ or a compatible TiDB Cloud database
-   Git (optional)

Check versions:

``` bash
node --version
npm --version
```

### 1. Clone the repository

``` bash
git clone https://github.com/boorlaraju/skockflow-assessment.git
cd skockflow-assessment
```

### 2. Set up the database

Run `database/schema.sql` using MySQL Workbench, or from the command
line:

``` bash
mysql -u root -p < database/schema.sql
```

If the SQL script does not create the database, create it first and
select it before running the schema. For TiDB Cloud, use the connection
details supplied by your cluster and enable the required TLS
configuration.

### 3. Configure and install the backend

``` bash
cd backend
```

Copy the example environment file:

``` bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Edit `.env` with your database credentials and a secure JWT secret. Then
install dependencies:

``` bash
npm install
```

### 4. Configure and install the frontend

Open another terminal:

``` bash
cd frontend
```

Copy the example environment file:

``` bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

Set the API base URL:

``` env
VITE_API_URL=http://localhost:5000/api
```

Install dependencies:

``` bash
npm install
```

## Environment Variables

### Backend `.env`

Use the variable names expected by the backend configuration. A typical
local setup is:

``` env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_database_password
DB_NAME=stockflow

JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

For TiDB Cloud, replace the database host, port, username, password, and
database name with the values supplied by TiDB. Enable the TLS settings
required by the provider.

### Frontend `.env`

``` env
VITE_API_URL=http://localhost:5000/api
```

**Important:** Never commit `.env` files or secrets to GitHub. Keep
`.env.example` free of real credentials. Variables prefixed with `VITE_`
are exposed in the frontend build; never place database credentials or
JWT signing secrets there. Configure production secrets in the hosting
provider's environment settings.

## Run the Application

Start the backend in one terminal:

``` bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

Start the frontend in another terminal:

``` bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

If the backend package does not define a `dev` script, check
`backend/package.json` and use the script provided there.

## Demo Workflow

1.  Open the StockFlow frontend.
2.  Register with an email, password, and organization name.
3.  Log in using the registered credentials.
4.  Review the dashboard inventory summary.
5.  Open Products and add a product.
6.  Enter its SKU, quantity, purchase price, selling price, and
    low-stock threshold.
7.  Update product details or quantity.
8.  Change the organization's default threshold in Settings.
9.  Return to the dashboard and review low-stock information.
10. Delete a product to demonstrate the delete operation.

To demonstrate tenant isolation, register a second organization and
verify that its user cannot access the first organization's products.

## REST API

Local API base URL:

``` text
http://localhost:5000/api
```

All protected endpoints require:

``` http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

  ------------------------------------------------------------------------
  Method            Endpoint           Description       Access
  ----------------- ------------------ ----------------- -----------------
  POST              `/auth/register`   Create            Public
                                       organization and  
                                       owner account     

  POST              `/auth/login`      Authenticate a    Public
                                       user              

  GET               `/auth/me`         Get current       Protected
                                       authenticated     
                                       user              
  ------------------------------------------------------------------------

### Products

  Method   Endpoint          Description                  Access
  -------- ----------------- ---------------------------- -----------
  GET      `/products`       List organization products   Protected
  POST     `/products`       Create a product             Protected
  GET      `/products/:id`   Get a product by ID          Protected
  PUT      `/products/:id`   Update a product             Protected
  DELETE   `/products/:id`   Delete a product             Protected

### Dashboard and settings

  Method   Endpoint       Description                       Access
  -------- -------------- --------------------------------- -----------
  GET      `/dashboard`   Get inventory dashboard summary   Protected
  GET      `/settings`    Get organization settings         Protected
  PUT      `/settings`    Update organization settings      Protected

If enabled by the backend, `GET /api/health` can be used as a health
check.

## Security and Multi-Tenancy

### Password hashing

Passwords are hashed with `bcryptjs` before being stored. Plain-text
passwords should never be stored.

### JWT authentication

After successful registration or login, the backend issues a JWT. The
frontend sends it with protected requests:

``` http
Authorization: Bearer <JWT_TOKEN>
```

The backend middleware verifies the token before allowing access to
protected routes.

### Organization-level data isolation

StockFlow uses a shared-database, shared-schema multi-tenant approach.
Each organization's records are associated with an `organization_id`.

``` text
Organization A                 Organization B
    |                               |
    +-- User A                      +-- User B
    +-- Product A1                  +-- Product B1
    +-- Product A2                  +-- Product B2
    +-- Settings A                  +-- Settings B
```

A product query should be scoped using the organization ID from the
authenticated server-side user context:

``` sql
SELECT *
FROM products
WHERE organization_id = ?;
```

The organization ID must not be trusted from an arbitrary value supplied
by the browser. Product and settings operations must enforce the
authenticated user's organization scope.

### Other security controls

-   CORS restricts which frontend origins can call the API.
-   Helmet adds security-related HTTP headers.
-   Environment variables keep secrets out of source code.
-   Database foreign keys and unique constraints help maintain data
    integrity.

## Deployment

The project deployment setup uses:

  Component   Hosting
  ----------- ------------
  Frontend    Vercel
  Backend     Render
  Database    TiDB Cloud

### Production deployment checklist

1.  Create the production database and execute `database/schema.sql`.
2.  Add database credentials and JWT configuration to the Render backend
    environment.
3.  Set `NODE_ENV=production`.
4.  Set `CLIENT_URL` to the exact deployed frontend origin.
5.  Set the Vercel `VITE_API_URL` to the deployed backend API base URL
    ending in `/api`.
6.  Deploy the backend and frontend.
7.  Test registration, login, product CRUD, dashboard data, and
    settings.

Example frontend variable:

``` env
VITE_API_URL=https://your-backend-domain.example/api
```

Example backend CORS origin:

``` env
CLIENT_URL=https://your-frontend-domain.example
```

Replace these examples with the actual deployment domains. The CORS
origin must match the frontend origin exactly, including protocol and
hostname. Redeploy the relevant service after changing environment
variables.

## MVP Scope and Future Improvements

### Included

-   Organization registration and owner login.
-   JWT-based authentication.
-   Product CRUD operations.
-   Dashboard inventory summary.
-   Low-stock identification.
-   Organization-level default threshold.
-   Organization-scoped product and settings access.

### Not included in the current MVP

-   Multiple user roles and invitations.
-   Billing and subscription management.
-   Password reset and email verification.
-   Supplier and purchase-order management.
-   Stock movement history and audit logs.
-   Barcode scanning.
-   Automated email or SMS alerts.
-   Advanced reporting and exports.

### Possible future improvements

-   Role-based access control and team invitations.
-   Refresh-token rotation or secure session management.
-   Request validation and API rate limiting.
-   Password reset and email verification.
-   Inventory transaction history and audit logs.
-   Supplier and purchase-order workflows.
-   Automated low-stock notifications.
-   Database backups and monitoring.
-   Automated tests and CI/CD checks.

## Troubleshooting

### Database connection failed

-   Verify database host, port, username, and password.
-   Confirm the database exists.
-   Check whether the database accepts connections from the backend
    host.
-   For TiDB Cloud, verify TLS configuration and connection details.

### CORS error

-   Confirm `CLIENT_URL` is the exact frontend origin.
-   Do not include an API path in the CORS origin.
-   Register CORS middleware before API routes.
-   Redeploy the backend after changing CORS configuration.

### Frontend cannot reach the backend

-   Verify `VITE_API_URL`.
-   Confirm the backend is running.
-   Check the browser Network tab for the failed request URL and
    response.
-   Redeploy the frontend after changing Vite environment variables.

### Unauthorized API response

-   Log in again to obtain a valid token.
-   Confirm the request includes `Authorization: Bearer <token>`.
-   Check the backend JWT secret and token expiry configuration.

### Product is not visible

-   Confirm the user is logged in to the expected organization.
-   Verify that the product was saved successfully.
-   Confirm backend queries use the authenticated user's
    `organization_id`.

## Author

**Boorla Raju**

**Project:** StockFlow -- SQL Inventory Management MVP

-   **GitHub:** https://github.com/boorlaraju/skockflow-assessment.git
-   **Live Application:**
    https://skockflow-assessment-git-master-boorlaraju.vercel.app/
