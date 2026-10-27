import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, FileText, Trash2 } from "lucide-react";
import api from "../../services/api";
import "../Products/Products.css"; // Reuse common styles
import "./Sales.css";

const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInvoices = async () => {
    try {
      const response = await api.get("/api/invoices/");
      setInvoices(response.data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
        await api.delete(`/api/invoices/${id}/`);
        setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (error) {
        console.error("Error deleting invoice:", error);
        alert("Failed to delete invoice");
    }
  };

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Sales & Invoices</h1>
        <Link to="/sales/new" className="btn btn-primary">
          <Plus size={18} />
          <span>New Invoice</span>
        </Link>
      </div>

      <div className="table-controls">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-state">Loading invoices...</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td className="font-medium">{inv.invoice_no}</td>
                      <td>{inv.customer_name || "N/A"}</td>
                      <td className="font-bold">₹{parseFloat(inv.total).toFixed(2)}</td>
                      <td>
                        <span className="badge badge-neutral">
                          {inv.payment_method}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link to={`/sales/${inv.id}`} className="btn-icon" title="View">
                            <Eye size={16} />
                          </Link>
                          {/* Add Delete Button */}
                          <button 
                            className="btn-icon delete-btn" 
                            onClick={() => handleDelete(inv.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceList;
