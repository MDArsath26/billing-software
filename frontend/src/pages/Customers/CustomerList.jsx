import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, X } from "lucide-react";
import api from "../../services/api";
import "./Customers.css";

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/customers/?search=${searchTerm}`);
      setCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await api.delete(`/api/customers/${id}/`);
        fetchCustomers();
      } catch (error) {
        console.error("Error deleting customer", error);
      }
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ 
        name: customer.name, 
        phone: customer.phone, 
        email: customer.email || "", 
        address: customer.address || "" 
    });
    setError("");
    setShowModal(true);
  };

  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ name: "", phone: "", email: "", address: "" });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingCustomer) {
        await api.put(`/api/customers/${editingCustomer.id}/`, formData);
      } else {
        await api.post("/api/customers/", formData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.phone?.[0] || "Failed to save customer.";
      setError(errorMsg);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="card">
        {/* Search */}
        <div className="table-actions">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center">No customers found.</td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                        <div className="font-bold">{customer.name}</div>
                        <div className="text-sm text-gray">{customer.email}</div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.address}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                            className="btn-icon" 
                            onClick={() => handleEdit(customer)}
                            title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                            className="btn-icon delete-btn" 
                            onClick={() => handleDelete(customer.id)}
                            title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingCustomer ? "Edit Customer" : "Add New Customer"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert-error">{error}</div>}
                
                <div className="form-group mb-4">
                  <label>Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid-2">
                    <div className="form-group mb-4">
                    <label>Phone</label>
                    <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />
                    </div>
                    <div className="form-group mb-4">
                    <label>Email (Optional)</label>
                    <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    </div>
                </div>

                <div className="form-group mb-4">
                  <label>Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
