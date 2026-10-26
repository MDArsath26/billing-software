import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import InvoiceList from "./pages/Sales/InvoiceList";
import InvoiceForm from "./pages/Sales/InvoiceForm";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProductList from "./pages/Products/ProductList";
import ProductForm from "./pages/Products/ProductForm";
import CustomerList from "./pages/Customers/CustomerList";
import Reports from "./pages/Reports/Reports.jsx";
import Settings from "./pages/Settings/Settings";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            
            {/* Product Routes */}
            <Route path="products" element={<ProductList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/:id" element={<ProductForm />} />

            {/* Customer Routes */}
            <Route path="customers" element={<CustomerList />} />

            {/* Sales Routes */}
            <Route path="sales" element={<InvoiceList />} />
            <Route path="sales/new" element={<InvoiceForm />} />
            <Route path="sales/:id" element={<InvoiceForm />} />

            {/* Reports */}
            <Route path="reports" element={<Reports />} />

            {/* Settings */}
            <Route path="settings" element={<Settings />} />

            {/* Catch all for unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
