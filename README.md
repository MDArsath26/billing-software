# Billing Software Project

A modern, full-stack billing and inventory management application built with **Django (Backend)** and **React/Vite (Frontend)**.

## 🚀 Features
-   **Dashboard**: Real-time sales overview, total revenue, and product stats.
-   **Inventory Management**: Add, edit, and track products with stock levels.
-   **Sales & Invoicing**: Create professional invoices with automatic stock deduction.
-   **Product Search**: Smart search with recent items and "No match" suggestions.
-   **PDF Printing**: One-click invoice printing/PDF generation.
-   **Settings**: Configure Store Name, Address, and Logo dynamically.
-   **Reports**: Visual charts for daily and monthly sales performance.

## 🛠️ Tech Stack
-   **Backend**: Python, Django REST Framework, MongoEngine.
-   **Database**: MongoDB.
-   **Frontend**: React.js, Vite, TailwindCSS (via standard CSS), Lucide Icons.
-   **Deployment**: Docker & Docker Compose support.

## 🏃 Quick Start (Windows)
The easiest way to run the app is using the one-click script:

1.  Navigate to the project folder.
2.  Double-click **`start_app.bat`**.
3.  The app will open automatically in your browser at `http://localhost:5173`.

## 🐳 Docker Deployment
To run in a containerized environment:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:3000` (or configured port).

## 📂 Project Structure
-   `accounts/`: User authentication and Profile management.
-   `products/`: Product CRUD and stock logic.
-   `sales/`: Invoice generation and calculations.
-   `reports/`: Analytics endpoints.
-   `frontend/`: React application.
