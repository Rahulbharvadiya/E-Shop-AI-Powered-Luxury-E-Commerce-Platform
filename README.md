# 🛍️ E-Shop — Next-Gen AI-Powered Luxury E-Commerce

<div align="center">

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-eshop--9kqz.onrender.com-FF9E00?style=for-the-badge&logo=render&logoColor=white)](https://eshop-9kqz.onrender.com/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Rahulbharvadiya/Eshop)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)
[![Status: Live in Production](https://img.shields.io/badge/Status-Live%20in%20Production-success?style=for-the-badge&logo=render)](https://eshop-9kqz.onrender.com/)

<p align="center">
  <strong>A high-performance full-stack luxury e-commerce ecosystem featuring an interactive AI Shopping Concierge, real-time WebSocket deal broadcasts, dynamic percentage coupon intelligence, and automated PDF invoicing.</strong>
</p>

[**Explore Live Deployment 🌐**](https://eshop-9kqz.onrender.com/) • [**Key Features ✨**](#-key-features) • [**Tech Stack 🛠️**](#-tech-stack--tools) • [**Quickstart 🚀**](#-quickstart-guide) • [**Admin Console 👑**](#-test-credentials)

</div>

---

## 🚀 Live Production Deployment

The complete full-stack application is deployed and live on **Render** paired with a **MongoDB Atlas Cloud Database**:

<div align="center">

### 🔗 **Live Web Application URL**
### 👉 [**https://eshop-9kqz.onrender.com/**](https://eshop-9kqz.onrender.com/) 👈

| Cloud Component | Provider | Tier | Status |
| :--- | :--- | :--- | :--- |
| **Unified Web Service** (React + Express + Socket.IO) | **Render** | Free Native Cloud Service | ![Active](https://img.shields.io/badge/Status-Online%20%26%20Active-brightgreen) |
| **Database Cluster** | **MongoDB Atlas** | M0 Shared Free Tier | ![Connected](https://img.shields.io/badge/Database-Connected-brightgreen) |
| **Version Control & CI/CD** | **GitHub** | Monorepo Auto-Deploy | ![Synced](https://img.shields.io/badge/CI%2FCD-Auto--Deploy%20on%20Push-blue) |

> 💡 *Note: On Render's free tier, inactive instances spin down after 15 minutes of idle time. The very first request may take ~30 seconds to wake up, after which it runs at high speed.*

</div>

---

## 🛠️ Tech Stack & Tools

This application is built with a modern, high-performance tech stack combining real-time communication, robust backend services, and a sleek dark-mode glassmorphic frontend.

<div align="center">

### 🎨 Frontend Architecture
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand_State-433E38?style=for-the-badge&logo=react&logoColor=white)
![Socket.io Client](https://img.shields.io/badge/Socket.io_Client-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### ⚙️ Backend & APIs
![Node.js](https://img.shields.io/badge/Node.js_v24-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js_v4-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io_Server-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Bcrypt](https://img.shields.io/badge/Bcrypt.js-4B0082?style=for-the-badge&logo=letsencrypt&logoColor=white)
![PDFKit](https://img.shields.io/badge/PDFKit_Invoices-FF0000?style=for-the-badge&logo=adobeacrobatreader&logoColor=white)

### 🗄️ Database & Cloud Persistence
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose_ODM-880000?style=for-the-badge&logo=mongodb&logoColor=white)

### 🚢 Cloud Hosting & DevOps
![Render](https://img.shields.io/badge/Render_Web_Service-46E3B7?style=for-the-badge&logo=render&logoColor=black)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub_Actions-181717?style=for-the-badge&logo=github&logoColor=white)
![NPM](https://img.shields.io/badge/NPM_Workspaces-CB3837?style=for-the-badge&logo=npm&logoColor=white)

</div>

---

## ✨ Key Features

### 🤖 1. Interactive AI Shopping Concierge
- **Context-Aware Assistance**: Answers questions, recommends products matching user intent with highlighted `[Recommended]` badges.
- **Clarification Logic**: Proactively asks clarifying questions when requests are vague (e.g. asking for preferred budget, color, or use-case).
- **Direct Catalog Integration**: Live click-to-view modal with instantaneous cart additions.

### 🎟️ 2. Dynamic Percentage Discount Engine
- **Universal Percentage Deductions**: Accurately computes discounts across the entire cart total (e.g., `89%` off deducts exactly 89% from the applicable item subtotal).
- **Active Promotional Coupons**:
  - `SAVE10` — 10% Off Orders
  - `MEGA30` — 30% Off Luxury Watches & Tech
  - `WELCOME50` — 50% Welcome Discount
  - `LUXE20` — 20% Off Premium Apparel & Fragrances

### ⚡ 3. Real-Time WebSocket Deal Broadcasts
- Powered by persistent **Socket.IO** connections.
- Admin broadcasts instant flash deal alerts to all active users without page refreshes.
- Live animated notification badge with unread counters and swipe-to-dismiss drawer.

### 🛡️ 4. Multi-Identifier Authentication
- Real direct user registration with **Full Name**, **Username**, **Phone**, **Email**, and **Password**.
- Multi-identifier login: sign in with either your **Username**, **Email**, or **Phone Number**.
- Live password strength gauge and avatar selection.
- Protected Role-Based Access Control (RBAC) separating Customers and Store Administrators.

### 👑 5. Full Operations Admin Console
- **Product Management**: Create, edit, and delete products across 6 curated categories.
- **Live Deal Broadcasting**: Dispatch real-time flash sales to connected customers via WebSockets.
- **Order Tracking**: Visual status management from *Placed* → *Confirmed* → *Shipped* → *Delivered*.
- **Store Settings**: Real-time control of warehouse pincodes, delivery fees, and free-shipping thresholds.

### 🧾 6. Automated PDF Invoice Generation
- Generates downloadable tax-compliant PDF invoices on checkout.
- Itemized pricing, dynamic coupon breakdowns, delivery fees, and shipping details.

### 🚚 7. Smart Pincode Delivery Intelligence
- Calculates delivery ETAs and fees based on warehouse proximity and customer pincodes.

---

## 🔑 Test Credentials

You can use these pre-seeded accounts to test the live platform immediately:

| Role | Login Identifier | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `admin` | `Password` | Full Admin Operations Console, Product CRUD, Live Deal Dispatcher, Store Settings |
| **Customer** | `customer` | `Customerpassword` | Retail Shopping, AI Concierge, Cart & Checkout, Order Tracking, PDF Invoices |

*(Or click **"Register New Account"** on the live site to create your own personal account!)*

---

## 🚀 Quickstart Guide (Local Setup)

To run the full-stack project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/Rahulbharvadiya/Eshop.git
cd Eshop
```

### 2. Install Dependencies
```bash
# Installs both root, server, and client dependencies
npm run install:all
```

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@eshop.buedvll.mongodb.net/eshop?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
ADMIN_EMAIL=admin
ADMIN_PASSWORD=Password
```

### 4. Seed Cloud Database (Optional)
```bash
npm run seed
```

### 5. Launch the Application
```bash
# Starts both frontend and backend concurrently
npm run dev
```
- **Client**: `http://localhost:5173`
- **API Server**: `http://localhost:5000`

---

## 📁 Monorepo Structure

```text
E_Shop/
├── client/                     # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static SVG icons and favicon
│   ├── src/
│   │   ├── components/         # Modular UI (Navbar, AI Assistant, Cart, Admin)
│   │   ├── stores/             # Zustand Global State (Auth, Cart, Wishlist, Notifications)
│   │   ├── App.jsx             # Main Application Shell
│   │   └── index.css           # Custom Glassmorphic Theme & Design System
│   └── vite.config.js          # Vite Build & Proxy Configuration
│
├── server/                     # Backend API & WebSocket Service (Node + Express)
│   ├── src/
│   │   ├── config/             # MongoDB Atlas Connection
│   │   ├── controllers/        # Business Logic (Auth, Products, Cart, AI, Orders)
│   │   ├── middleware/         # JWT Authentication & RBAC Middleware
│   │   ├── models/             # Mongoose Schemas (User, Product, Order, Coupon, Banner)
│   │   ├── routes/             # RESTful Express Routes
│   │   ├── seeds/              # Database Seeder (24 Products, 6 Categories, Coupons)
│   │   ├── services/           # AI Concierge, PDF Invoicing, Pincode Estimator
│   │   └── server.js           # Express App + Static Client + Socket.IO Server
│   └── package.json
│
├── ARCHITECTURE.md             # Technical Architecture Specifications
├── EShop_Project_Planning_Document.md # Master Planning & Granular Roadmap
└── package.json                # Root Monorepo Scripts
```

---

## 🌐 Live Deployment & Demo Links

<div align="center">

### 🌟 **Ready to experience E-Shop live?**

[![Open Live App](https://img.shields.io/badge/Open_Live_Store-https%3A%2F%2Feshop--9kqz.onrender.com-FF9E00?style=for-the-badge&logo=render&logoColor=white)](https://eshop-9kqz.onrender.com/)

**Direct Production Link:**  
👉 **[https://eshop-9kqz.onrender.com/](https://eshop-9kqz.onrender.com/)** 👈

---

Made with ❤️ by [Rahul Bharvadiya](https://github.com/Rahulbharvadiya) • Star ⭐ the repository if you found this project inspiring!

</div>
