# 🎉 Party Management Mobile App – Backend

This is the backend system for a Party Management Mobile Application, built with **Node.js**, **Express.js**, **TypeScript**,
and **MongoDB**.
It handles user authentication,
real-time chat,
payment processing,
party scheduling,
and role-based access for **Users**, **Hosts**, and **Admins**.

---

## 🚀 Features

### 🔐 Roles & Permissions

#### 👤 User

- Join parties via **PayPal**
- Purchase **multiple tickets**
- Automatically added to the **party chat group** on joining
- Eligible for **cashback** if leaving ≥ 3 days before the party starts
- Receives email notifications (join, leave, refund, etc.)

#### 🎉 Host

- Can **create and reschedule** parties
- Earns **85%** of total ticket sales and got money automatically before start party 24 hours
- Must **submit documents** (passport, residency) for host approval
- Receives email upon **approval** or **rejection** of request

#### 🛡️ Admin

- Full access to **all parties, users, and hosts**
- Reviews and approves host requests
- Receives **15%** of total revenue
- Manages the entire system

---

## 💬 Real-Time Chat

- Built with **Socket.IO**
- Users are added to chat groups after joining a party
- Supports multiple users per ticket
- Dynamic, event-specific chat rooms

---

## 💸 Payments & Revenue

- Secure integration with **PayPal**
- Automatic **revenue split**:
  - Host: 85%
  - Admin: 15%
- Built-in **cashback system** for early cancellations

---

## 📩 Notifications

- Automated **email notifications**:
  - When user joins or leaves a party
  - When cashback is processed
  - For host application approvals/rejections

---

## 🛠️ Tech Stack

| Tech              | Description               |
| ----------------- | ------------------------- |
| **Node.js**       | Runtime environment       |
| **Express.js**    | Web framework             |
| **TypeScript**    | Static typing             |
| **MongoDB**       | NoSQL database            |
| **Mongoose**      | MongoDB ODM               |
| **Socket.IO**     | Real-time chat            |
| **PayPal API**    | Payment processing        |
| **Morgan**        | HTTP request logger       |
| **Custom Logger** | Application-level logging |

---

## 📁 Folder Structure moduler pattern

---

## 📌 Notes

- Only verified users can become hosts after document verification
- All logic is built to ensure **scalability**, **security**, and **maintainability**

---

## 📧 Contact

For any issues or collaboration inquiries, please open an issue or contact the maintainer.
