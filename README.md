<div align="center">

# 🎉 Party Management System - Backend API

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io/)

**A comprehensive, enterprise-grade backend system for event management with real-time features, secure payment processing, and role-based access control.**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation)

</div>

---

## 📖 Overview

The Party Management System is a robust, scalable backend API designed for modern event management applications. Built with industry best practices, it provides a complete solution for managing events, users, payments, and real-time communications.

### 🎯 Project Highlights

- **🔒 Enterprise Security**: JWT authentication, role-based access control (RBAC), and secure payment processing
- **⚡ Real-Time Features**: WebSocket-based chat system with Socket.IO for instant communication
- **💳 Payment Integration**: Seamless PayPal integration with automated revenue distribution
- **📧 Automated Notifications**: Email notification system for all critical user actions
- **🏗️ Scalable Architecture**: Modular design pattern following SOLID principles
- **📝 Type Safety**: Fully typed with TypeScript for robust code quality
- **🧪 Production Ready**: Comprehensive error handling, logging, and monitoring

---

## ✨ Key Features

### 🔐 Role-Based Access Control

<details>
<summary><b>👤 User Role</b></summary>

- ✅ Browse and join parties with secure PayPal payments
- 🎟️ Purchase multiple tickets in a single transaction
- 💬 Auto-enrollment in party-specific chat rooms
- 💰 Smart cashback system (eligible if leaving ≥3 days before event)
- 📧 Real-time email notifications for all transactions
- 📊 View booking history and upcoming events

</details>

<details>
<summary><b>🎉 Host Role</b></summary>

- 🎪 Create, update, and reschedule events
- 💵 Automatic payout system (85% revenue share, 24hrs before event)
- 📄 Document verification system (passport, residency proof)
- ✉️ Status notifications for document approval/rejection
- 📈 Revenue tracking and analytics dashboard
- 👥 Manage attendee lists and chat moderation

</details>

<details>
<summary><b>🛡️ Admin Role</b></summary>

- 🎛️ Complete system oversight and management
- ✅ Host verification and approval workflow
- 💼 Automated revenue collection (15% platform fee)
- 📊 System-wide analytics and reporting
- 🔧 User and content moderation tools
- 🚨 Security monitoring and audit logs

</details>

---

## 🛠️ Tech Stack

### Core Technologies

```
Backend Framework    → Express.js with TypeScript
Database            → MongoDB with Mongoose ODM
Real-Time           → Socket.IO for WebSocket communications
Authentication      → JWT (JSON Web Tokens)
Payment Gateway     → PayPal REST API
Email Service       → NodeMailer / SendGrid
```

### Dependencies & Tools

| Technology     | Purpose                               | Version |
| -------------- | ------------------------------------- | ------- |
| **Node.js**    | JavaScript runtime environment        | 18+     |
| **Express.js** | Web application framework             | 4.x     |
| **TypeScript** | Static type checking                  | 5.x     |
| **MongoDB**    | NoSQL database                        | 6.x     |
| **Mongoose**   | MongoDB object modeling               | 8.x     |
| **Socket.IO**  | Real-time bidirectional communication | 4.x     |
| **PayPal SDK** | Payment processing integration        | Latest  |
| **JWT**        | Secure token-based authentication     | 9.x     |
| **Morgan**     | HTTP request logger middleware        | 1.x     |
| **Winston**    | Application-level logging             | 3.x     |
| **Joi/Zod**    | Request validation                    | Latest  |

---

## 🏗️ Architecture

### Design Pattern: Modular Architecture

```
src/
├── config/          # Configuration files (database, environment)
├── modules/         # Feature modules (users, parties, payments)
│   ├── user/
│   │   ├── user.model.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.route.ts
│   │   ├── user.interface.ts
│   │   └── user.validation.ts
│   ├── party/
│   ├── payment/
│   └── chat/
├── middleware/      # Custom middleware (auth, error handling)
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
└── app.ts           # Application entry point
```

### Key Architecture Principles

- ✅ **Separation of Concerns**: Each module handles specific business logic
- ✅ **DRY Principle**: Reusable services and utilities
- ✅ **Dependency Injection**: Loose coupling between components
- ✅ **Error Handling**: Centralized error handling middleware
- ✅ **Validation**: Request validation at controller level
- ✅ **Logging**: Comprehensive logging for debugging and monitoring

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager
- PayPal Developer Account (for payment integration)

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdulSatterism/party-management.git

# Navigate to project directory
cd party-management

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your environment variables
# Edit .env with your configuration
```

### Environment Variables

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mongodb://localhost:27017/party-management
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

CLIENT_URL=http://localhost:3000
```

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Build TypeScript
npm run build

# Production mode
npm start

# Run tests
npm test
```

---

## 💡 Core Features Breakdown

### 💳 Payment System

- **Secure Transactions**: PCI-compliant PayPal integration
- **Automated Revenue Split**: 85% to hosts, 15% to platform
- **Smart Refunds**: Conditional cashback based on cancellation timing
- **Transaction History**: Complete audit trail for all payments

### 💬 Real-Time Chat

- **Event-Specific Rooms**: Isolated chat for each party
- **Multi-User Support**: Group conversations with unlimited participants
- **Message Persistence**: Chat history stored in MongoDB
- **Online Status**: Real-time presence indicators

### 📧 Notification System

- **Transactional Emails**: Booking confirmations, cancellations, refunds
- **Host Notifications**: Application status, payout confirmations
- **Admin Alerts**: New host requests, system events
- **Template Engine**: Professional, branded email templates

---

## 🔒 Security Features

- 🔐 **JWT Authentication**: Secure, stateless authentication
- 🛡️ **Password Hashing**: bcrypt encryption for user passwords
- 🚫 **Rate Limiting**: Protection against brute force attacks
- ✅ **Input Validation**: Sanitization of all user inputs
- 🔒 **CORS Configuration**: Controlled cross-origin requests
- 📝 **Audit Logging**: Track all sensitive operations

---

## 📈 Future Enhancements

- [ ] GraphQL API implementation
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Push notifications (Firebase/OneSignal)
- [ ] Video streaming integration
- [ ] AI-powered event recommendations
- [ ] Social media integrations
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Abdul Satter Islam**

- GitHub: [@AbdulSatterism](https://github.com/AbdulSatterism)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/abdulsatterism)
- Email: your.email@example.com

---

<div align="center">

**Made with ❤️ by Abdul Satter **

⭐ Star this repo if you find it useful! ⭐

</div>
