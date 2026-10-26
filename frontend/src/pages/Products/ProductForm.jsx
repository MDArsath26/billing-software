import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Plus } from "lucide-react";
import api from "../../services/api";
import "./Products.css";

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    barcode: "",
    hsn_code: "",
    category_id: "",
    subcategory_id: "",
    cost_price: 0,
    selling_price: 0,
    gst_rate: 0,
    stock_qty: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Quick Add State
  const [showCatModal, setShowCatModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.category_id) {
        fetchSubCategories(formData.category_id);
    } else {
        setSubcategories([]);
    }
  }, [formData.category_id]);

  const fetchCategories = async () => {
    try {
        const response = await api.get("/api/products/categories/");
        setCategories(response.data);
    } catch (err) {
        console.error("Failed to load categories");
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
        const response = await api.get(`/api/products/subcategories/?category_id=${categoryId}`);
        setSubcategories(response.data);
    } catch (err) {
        console.error("Failed to load subcategories");
    }
  };

  const handleAddCategory = async (e) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      try {
          const res = await api.post("/api/products/categories/", { name: newCategoryName });
          const newCat = res.data;
          setCategories([newCat, ...categories]);
          setFormData(prev => ({ ...prev, category_id: newCat.id, subcategory_id: "" })); // Auto-select & reset subcat
          setNewCategoryName("");
          setShowCatModal(false);
      } catch (err) {
          console.error("Failed to create category:", err);
          const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to create category";
          alert(msg);
      }
  };

  const handleAddSubCategory = async (e) => {
      e.preventDefault();
      if (!newSubCategoryName.trim() || !formData.category_id) return;
      try {
          const res = await api.post("/api/products/subcategories/", { 
              name: newSubCategoryName,
              category_id: formData.category_id
          });
          const newSub = res.data;
          setSubcategories([...subcategories, newSub]);
          setFormData(prev => ({ ...prev, subcategory_id: newSub.id })); // Auto-select
          setNewSubCategoryName("");
          setShowSubModal(false);
      } catch (err) {
            console.error("Failed to create subcategory:", err);
            const msg = err.response?.data?.name?.[0] || err.response?.data?.detail || "Failed to create subcategory";
            alert(msg);
      }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}/`);
      setFormData(response.data);
    } catch (err) {
      setError("Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await api.put(`/api/products/${id}/`, formData);
      } else {
        await api.post("/api/products/", formData);
      }
      navigate("/products");
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Failed to save product. Please check the inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="loading-state">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-row gap-4">
            <Link to="/products" className="btn btn-secondary">
                <ArrowLeft size={18} />
                <span>Back</span>
            </Link>
            <h1>{isEditMode ? "Edit Product" : "Add New Product"}</h1>
        </div>
      </div>

      <div className="card">
        {error && <div className="error-message m-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>SKU (Unique ID) *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>HSN Code</label>
              <input
                type="text"
                name="hsn_code"
                value={formData.hsn_code}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                    <label className="mb-0">Category *</label>
                    <button 
                        type="button" 
                        onClick={() => setShowCatModal(true)}
                        className="text-blue-600 text-xs flex items-center gap-1 hover:underline"
                    >
                        <Plus size={12} /> Add New
                    </button>
                </div>
                <select
                    name="category_id"
                    value={formData.category_id || ""}
                    onChange={handleChange}
                    required
                    className="border rounded p-2 w-full"
                >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                    <label className="mb-0">Subcategory *</label>
                    <button 
                        type="button" 
                        onClick={() => setShowSubModal(true)}
                        disabled={!formData.category_id}
                        className={`text-blue-600 text-xs flex items-center gap-1 hover:underline ${!formData.category_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Plus size={12} /> Add New
                    </button>
                </div>
                <select
                    name="subcategory_id"
                    value={formData.subcategory_id || ""}
                    onChange={handleChange}
                    required
                    className="border rounded p-2 w-full"
                    disabled={!formData.category_id}
                >
                    <option value="">Select Subcategory</option>
                    {subcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
            </div>

            <div className="form-group">
              <label>Cost Price *</label>
              <input
                type="number"
                name="cost_price"
                min="0"
                step="0.01"
                value={formData.cost_price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Selling Price *</label>
              <input
                type="number"
                name="selling_price"
                min="0"
                step="0.01"
                value={formData.selling_price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>GST Rate (%)</label>
              <input
                type="number"
                name="gst_rate"
                min="0"
                step="0.01"
                value={formData.gst_rate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity</label>
              <input
                type="number"
                name="stock_qty"
                min="0"
                value={formData.stock_qty}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-footer">
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Save size={18} />
              <span>{loading ? "Saving..." : "Save Product"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Simple Modals */}
      {showCatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h3 className="text-lg font-bold mb-4">Add Category</h3>
                <form onSubmit={handleAddCategory}>
                    <input 
                        type="text" 
                        className="border w-full p-2 mb-4 rounded" 
                        placeholder="Category Name" 
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowCatModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Add</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-80">
                <h3 className="text-lg font-bold mb-4">Add Subcategory</h3>
                <p className="text-sm text-gray-500 mb-2">Under: {categories.find(c => c.id === formData.category_id)?.name}</p>
                <form onSubmit={handleAddSubCategory}>
                    <input 
                        type="text" 
                        className="border w-full p-2 mb-4 rounded" 
                        placeholder="Subcategory Name" 
                        value={newSubCategoryName}
                        onChange={(e) => setNewSubCategoryName(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowSubModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                        <button type="submit" className="btn btn-primary btn-sm">Add</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default ProductForm;
