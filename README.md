# SubShare – Subscription Sharing Web Application

Live Frontend: [https://subshare-frontend.vercel.app/](https://subshare-frontend.vercel.app/)

Live Backend API: [https://subshare-backend.abusaiyedjoy1.workers.dev](https://subshare-backend.abusaiyedjoy1.workers.dev)

---

## 📌 Overview

**SubShare** is a subscription sharing web platform that allows users to share and access popular subscription services (such as Netflix, Spotify, etc.) by paying from an in-app wallet. Users can earn money by sharing subscriptions, while admins manage verification, wallet top-ups, reports, and earn commission from every transaction.

The platform is designed with scalability, security, and modern web standards in mind, using **Next.js** for the frontend and **Cloudflare Workers** for the backend.

---

## 🚀 Features

### User Features

* User registration & login (JWT-based authentication)
* Wallet system with balance tracking
* Request wallet top-ups (manual admin approval)
* Browse verified shared subscriptions
* Purchase subscription access using wallet balance
* View credentials for active subscriptions
* Share own subscriptions and earn money
* Track earnings and transactions
* Report invalid or problematic subscriptions

### Admin Features

* Admin dashboard with statistics
* Verify subscription platforms
* Verify shared subscriptions
* Approve or reject wallet top-up requests
* Manage users and adjust balances
* View and manage transactions
* Handle user reports
* Configure platform-wide settings (commission, etc.)

---

## 🧱 Tech Stack

### Frontend

* **Next.js** (App Router)
* **TanStack Query** – Server state management
* **TanStack Form** – Form handling & validation
* **Zustand** – Client-side state management
* **Tailwind CSS** – Styling

### Backend

* **Hono.js** – Lightweight backend framework
* **Cloudflare Workers** – Serverless deployment
* **SQLite (Cloudflare D1)** – Database
* **Drizzle ORM** – Type-safe database access

### Authentication & Security

* JWT-based authentication
* Role-based access control (User / Admin)
* Encrypted credentials storage
* Input validation on all endpoints
* Rate limiting on APIs

---

## 🗄️ Database Schema

Main tables used in the application:

* `users`
* `subscription_platforms`
* `shared_subscriptions`
* `subscription_access`
* `transactions`
* `topup_requests`
* `reports`
* `platform_settings`

Each table is designed to support auditing, admin control, and scalable business logic.

---

## 🔗 API Routes

### Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`

### User

* `GET /api/users/profile`
* `PUT /api/users/profile`
* `GET /api/users/wallet-balance`
* `GET /api/users/wallet-transactions`
* `GET /api/users/my-subscriptions`
* `GET /api/users/shared-subscriptions`

### Subscription Platforms

* `GET /api/platforms`
* `POST /api/platforms` (admin)
* `PUT /api/platforms/:id` (admin)

### Shared Subscriptions

* `GET /api/subscriptions`
* `GET /api/subscriptions/:id`
* `POST /api/subscriptions`
* `PUT /api/subscriptions/:id`
* `DELETE /api/subscriptions/:id`
* `POST /api/subscriptions/:id/unlock`
* `GET /api/subscriptions/:id/credentials`
* `POST /api/subscriptions/:id/report`

### Wallet & Top-up

* `POST /api/wallet/topup-request`
* `GET /api/wallet/topup-requests`

### Admin

* `GET /api/admin/topup-requests`
* `PUT /api/admin/topup-requests/:id/approve`
* `PUT /api/admin/topup-requests/:id/reject`
* `GET /api/admin/pending-verifications`
* `POST /api/admin/subscriptions/:id/verify`
* `GET /api/admin/reports`
* `PUT /api/admin/reports/:id/resolve`
* `GET /api/admin/transactions`
* `GET /api/admin/users`
* `PUT /api/admin/users/:id/balance`
* `GET /api/admin/settings`
* `PUT /api/admin/settings`
* `GET /api/admin/dashboard-stats`

---

## 📦 Deployment

### Frontend

* **Vercel**
* URL: [https://subshare-frontend.vercel.app/](https://subshare-frontend.vercel.app/)

### Backend

* **Cloudflare Workers**
* Database: Cloudflare D1 (SQLite)
* URL: [https://subshare-backend.abusaiyedjoy1.workers.dev](https://subshare-backend.abusaiyedjoy1.workers.dev)

---

## 👨‍💻 Author

**Abu Saiyed Joy**
MERN & Full Stack Web Developer

---

⭐ If you like this project, feel free to star the repository and contribute!
