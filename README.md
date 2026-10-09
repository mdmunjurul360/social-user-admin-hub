# Social User Admin Hub

A modern **React + Firebase** social platform featuring a **role-based admin dashboard**, secure authentication, and Firestore integration.

This project was built as a learning-focused application to explore modern frontend architecture, authentication flows, protected routes, and scalable project organization.

> **Project Status:** 🚧 Active Learning Project (Not Production Ready)

---

# ✨ Features

- Firebase Authentication
- Firestore Integration
- Protected Routes
- Role-Based Admin Dashboard
- User Feed Interface
- React Router Navigation
- Responsive UI
- TypeScript Support
- Tailwind CSS
- Modern React Architecture

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Firebase SDK

## Backend

This project currently uses **Firebase Firestore** as its primary backend service.

---

# 📁 Project Structure

```text
social-user-admin-hub/
│
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
│
├── firestore.rules
├── firebase-blueprint.json
├── .env.example
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- npm
- Firebase Project

---

## Installation

Clone the repository:

```bash
git clone https://github.com/mdmunjurul360/social-user-admin-hub.git
```

Move into the project:

```bash
cd social-user-admin-hub
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file from `.env.example`.

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## Run the Project

```bash
npm run dev
```

---

# 🔐 Authentication

This project currently supports:

- Firebase Email & Password Authentication
- Protected Routes
- Authentication Context
- Session Persistence

---

# 👤 User Features

- Secure Login
- Protected Home Page
- Firebase Authentication
- Responsive Interface

---

# 🛡 Admin Dashboard

The Admin Dashboard is designed to manage application content through role-based access.

Current functionality includes:

- Protected Admin Route
- Admin Authentication
- Dashboard Layout

Future versions will include:

- Create Posts
- Edit Posts
- Delete Posts
- User Management
- Analytics

---

# 🔥 Firestore

Firestore is used for:

- User Data
- Application Data
- Authentication Support
- Role Management

Security is enforced using **Firestore Security Rules**.

---

# 🔒 Security

Current security features:

- Firebase Authentication
- Firestore Security Rules
- Protected Routes

Planned improvements:

- Role-based Authorization
- Better Permission Management
- Server-side Validation
- Rate Limiting

---

# 📚 Learning Objectives

This project was created to practice:

- React
- TypeScript
- Firebase Authentication
- Firestore Database
- React Router
- Context API
- Modern Frontend Development
- Component-Based Architecture

---

# 🚧 Project Status

This repository is a **learning-focused prototype** built to explore React and Firebase development.

Some planned features are still under development and the project should **not** be considered production-ready.

---

# 🗺 Future Roadmap

- Complete Admin CRUD
- User Profile Management
- Media Upload Support
- Notifications
- Search & Filtering
- Better Role Management
- Responsive Improvements
- Unit Testing
- CI/CD Pipeline
- Production Deployment

---

# 🤝 Contributing

This repository is maintained as a personal learning project.

Suggestions, issues, and feedback are always welcome.

---

# 📄 License

This project is licensed under the **MIT License**.

See the **LICENSE** file for more information.
