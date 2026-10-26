import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus, Search, Printer } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import api from "../../services/api";
import InvoicePrint from "./InvoicePrint";
import "./Sales.css";

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Ref for printing
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Invoice-${id}`,
  });

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    payment_method: "CASH",
    items: [],
    subtotal: 0,
    tax_amount: 0,
    discount_amount: 0,
    total: 0,
    invoice_no: "", // Added for print
    created_at: new Date().toISOString() // Added for print
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Category Filter State
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]); // map or list? let's use list for selected category
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const response = await api.get("/api/auth/settings/");
            setStoreSettings(response.data);
        } catch (error) {
            console.error("Error fetching settings", error);
        }
    };
    
    const fetchCustomers = async () => {
        try {
            const response = await api.get("/api/customers/");
            setCustomers(response.data);
        } catch (error) {
            console.error("Error fetching customers", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get("/api/products/categories/");
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    fetchSettings();
    fetchCustomers();
    fetchCategories();
  }, []);

  // Fetch all products for search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/api/products/");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  // Helper to recalculate totals
  const calculateTotals = (currentItems, discount = 0) => {
      let subtotal = 0;
      let taxAmount = 0;
  
      const calculatedItems = currentItems.map((item) => {
        const qty = parseFloat(item.qty) || 0;
        const price = parseFloat(item.unit_price) || 0;
        const gst = parseFloat(item.gst_rate) || 0;
  
        const lineSubtotal = qty * price;
        const lineTax = (lineSubtotal * gst) / 100;
        const lineTotal = lineSubtotal + lineTax;
  
        subtotal += lineSubtotal;
        taxAmount += lineTax;
  
        return {
          ...item,
          line_subtotal: lineSubtotal,
          line_tax: lineTax,
          line_total: lineTotal,
        };
      });
  
      const total = subtotal + taxAmount - (parseFloat(discount) || 0);
  
      return {
          items: calculatedItems,
          subtotal,
          tax_amount: taxAmount,
          total: Math.max(0, total)
      };
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/invoices/${id}/`);
            const data = response.data;
            // Sanitize null values to prevent empty inputs if backend sends null
            setFormData({
                ...data,
                customer_name: data.customer_name || "",
                customer_phone: data.customer_phone || "",
                // Recalculate to ensure numbers and consistency
                ...calculateTotals(data.items || [], data.discount_amount || 0)
            });
            // Also set products list if needed, but we already fetch all products above separately.
        } catch (error) {
            console.error("Error fetching invoice", error);
        } finally {
            setLoading(false);
        }
      };
      fetchInvoice();
    }
  }, [isEditMode, id]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
        const fetchSubs = async () => {
            try {
                const response = await api.get(`/api/products/subcategories/?category_id=${selectedCategory}`);
                setSubcategories(response.data);
            } catch (err) {
                console.error("Failed to load subcategories");
            }
        };
        fetchSubs();
    } else {
        setSubcategories([]);
    }
    setSelectedSubCategory(null); // Reset subcat when cat changes
  }, [selectedCategory]);

  // Search & Filter Logic
  useEffect(() => {
    let results = products;

    // 1. Filter by Category
    if (selectedCategory) {
        results = results.filter(p => p.category_id === selectedCategory);
    }

    // 2. Filter by Subcategory
    if (selectedSubCategory) {
        results = results.filter(p => p.subcategory_id === selectedSubCategory);
    }

    // 3. Filter by Search Term
    if (searchTerm.length > 0) {
        results = results.filter(
            (p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } else {
        // If no search term, should we show all filtered by category?
        // Yes, if category is selected, show all in that category.
        // If no category and no search, show top 5 recent (original logic) OR empty?
        // User request says: "Instead of showing 500 products randomly... click Groceries... click Snacks... show snack products"
        // So if category IS selected, show ALL matches.
        if (!selectedCategory) {
             results = results.slice(0, 5); // Default recent/top 5 if no filter
        }
    }
    
    setSearchResults(results);
  }, [searchTerm, products, selectedCategory, selectedSubCategory]);



  const addItem = (product) => {
    const newItem = {
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      qty: 1,
      unit_price: parseFloat(product.selling_price),
      gst_rate: parseFloat(product.gst_rate) || 0,
      line_subtotal: 0,
      line_tax: 0,
      line_total: 0,
    };
    
    // Check if item already exists
    const existingItemIndex = formData.items.findIndex(item => item.product_id === product.id);
    let newItems = [...formData.items];
    
    if (existingItemIndex >= 0) {
        newItems[existingItemIndex].qty += 1;
    } else {
        newItems.push(newItem);
    }

    const calculated = calculateTotals(newItems, formData.discount_amount);
    setFormData((prev) => ({ ...prev, ...calculated }));
    setSearchTerm("");
    setSearchResults([]);
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const calculated = calculateTotals(newItems, formData.discount_amount);
    setFormData((prev) => ({ ...prev, ...calculated }));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    const calculated = calculateTotals(newItems, formData.discount_amount);
    setFormData((prev) => ({ ...prev, ...calculated }));
  };

  const handleDiscountChange = (e) => {
      const discount = parseFloat(e.target.value) || 0;
      const calculated = calculateTotals(formData.items, discount);
      setFormData((prev) => ({ ...prev, discount_amount: discount, ...calculated }));
  };

  // Customer Search Logic
  useEffect(() => {
    if (customerSearchTerm.length === 0) {
        setCustomerSearchResults([]);
        setShowCustomerDropdown(false);
    } else {
        const results = customers.filter(
            (c) =>
              c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
              c.phone.includes(customerSearchTerm)
        );
        setCustomerSearchResults(results);
        setShowCustomerDropdown(true);
    }
  }, [customerSearchTerm, customers]);

  const selectCustomer = (customer) => {
      setFormData(prev => ({
          ...prev,
          customer_name: customer.name,
          customer_phone: customer.phone,
          customer_address: customer.address || ""
      }));
      setCustomerSearchTerm("");
      setShowCustomerDropdown(false);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
        alert("Please add at least one item");
        return;
    }
    setLoading(true);
    try {
      await api.post("/api/invoices/", formData);
      navigate("/sales");
    } catch (error) {
      console.error("Error creating invoice", error);
      const errorMessage = error.response?.data?.detail || "Failed to create invoice";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex-row gap-4">
          <Link to="/sales" className="btn btn-secondary">
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>
          <h1>{isEditMode ? "View Invoice" : "New Invoice"}</h1>
        </div>
        
        {/* Print Button */}
        {isEditMode && (
         <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={18} />
            <span>Print Invoice</span>
         </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="invoice-grid">
        {loading && <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center">Loading...</div>}
        
        {/* Left Column: Items */}
        <div className="card p-6">
          {!isEditMode && (
          <div className="form-group mb-4 search-input-wrapper">
            
            {/* Category Filters */}
            <div className="category-filters mb-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <button 
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${!selectedCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            type="button"
                            className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${selectedCategory === cat.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
                
                {/* Subcategory Filters */}
                {selectedCategory && subcategories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto mt-2">
                         <button 
                            type="button"
                            className={`px-3 py-0.5 rounded-full text-xs border ${!selectedSubCategory ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                            onClick={() => setSelectedSubCategory(null)}
                        >
                            All {categories.find(c => c.id === selectedCategory)?.name}
                        </button>
                        {subcategories.map(sub => (
                             <button 
                                key={sub.id}
                                type="button"
                                className={`px-3 py-0.5 rounded-full text-xs border ${selectedSubCategory === sub.id ? 'bg-gray-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                                onClick={() => setSelectedSubCategory(sub.id)}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <label>Add Product</label>
            <div className="input-wrapper">
                <Search className="input-icon" size={18} />
                <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                    if (searchResults.length === 0 && products.length > 0) {
                        setSearchResults(products.slice(0, 5));
                    }
                }}
                />
            </div>
            
            {/* Show message if no products exist at all */}
            {products.length === 0 && (
                <div className="text-sm text-gray-500 mt-2">
                    No products found. <Link to="/products/new" className="text-blue-600 underline">Add a product</Link> first.
                </div>
            )}
            
            {/* Show dropdown if we have results */}
            {searchResults.length > 0 && (
              <div className="product-search-dropdown">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="dropdown-item"
                    onClick={() => addItem(product)}
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku} | Price: ₹{product.selling_price} | Stock: {product.stock_qty}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Show 'No matches' if search is active but no results */}
            {searchTerm.length > 0 && searchResults.length === 0 && products.length > 0 && (
                <div className="product-search-dropdown">
                    <div className="dropdown-item p-3 text-gray-500 cursor-default hover:bg-white text-center">
                        No matching products found.
                    </div>
                </div>
            )}
          </div>
          )}

          <div className="table-responsive">
            <table className="invoice-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ width: "100px" }}>Price</th>
                  <th style={{ width: "80px" }}>Qty</th>
                  <th style={{ width: "80px" }}>GST %</th>
                  <th style={{ width: "100px" }}>Total</th>
                  <th style={{ width: "50px" }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div className="font-medium">{item.name}</div>
                      <small>{item.sku}</small>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-full border rounded p-1"
                        value={item.unit_price}
                        readOnly={isEditMode}
                        onChange={(e) =>
                          updateItem(index, "unit_price", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="w-full border rounded p-1"
                        min="1"
                        value={item.qty}
                        readOnly={isEditMode}
                        onChange={(e) => updateItem(index, "qty", e.target.value)}
                      />
                    </td>
                    <td>{item.gst_rate}%</td>
                    <td>₹{item.line_total.toFixed(2)}</td>
                    <td>
                      {!isEditMode && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                      )}
                    </td>
                  </tr>
                ))}
                {formData.items.length === 0 && (
                    <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">No items added</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Customer & Summary */}
        <div className="flex flex-col gap-4">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
            <div className="form-group mb-3 relative">
              <label>Name (Search existing or type new)</label>
              <input
                type="text"
                value={formData.customer_name}
                readOnly={isEditMode}
                onChange={(e) => {
                  setFormData({ ...formData, customer_name: e.target.value });
                  setCustomerSearchTerm(e.target.value);
                }}
                onFocus={() => {
                    if (formData.customer_name) setCustomerSearchTerm(formData.customer_name);
                }}
                placeholder="Walk-in Customer"
                className="w-full border rounded p-2"
                autoComplete="off"
              />
              {/* Customer Dropdown */}
              {!isEditMode && showCustomerDropdown && customerSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border rounded shadow-lg max-h-48 overflow-y-auto mt-1">
                      {customerSearchResults.map(customer => (
                          <div 
                            key={customer.id} 
                            className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                            onClick={() => selectCustomer(customer)}
                          >
                              <div className="font-bold">{customer.name}</div>
                              <div className="text-xs text-gray-500">{customer.phone}</div>
                          </div>
                      ))}
                  </div>
              )}
            </div>
            <div className="form-group mb-3">
              <label>Phone</label>
              <input
                type="text"
                value={formData.customer_phone}
                readOnly={isEditMode}
                onChange={(e) =>
                  setFormData({ ...formData, customer_phone: e.target.value })
                }
                className="w-full border rounded p-2"
              />
            </div>
            <div className="form-group mb-3">
              <label>Address</label>
              <textarea
                rows="2"
                value={formData.customer_address}
                readOnly={isEditMode}
                onChange={(e) =>
                  setFormData({ ...formData, customer_address: e.target.value })
                }
                className="w-full border rounded p-2"
                placeholder="Customer Address..."
              ></textarea>
            </div>
             <div className="form-group">
              <label>Payment Method</label>
              <select
                value={formData.payment_method}
                disabled={isEditMode}
                onChange={(e) =>
                  setFormData({ ...formData, payment_method: e.target.value })
                }
                className="w-full border rounded p-2"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>
          </div>

          <div className="invoice-summary">
            <h3 className="text-lg font-semibold mb-4">Summary</h3>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{formData.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (GST)</span>
              <span>₹{formData.tax_amount.toFixed(2)}</span>
            </div>
            <div className="summary-row">
                <span>Discount</span>
                <input 
                    type="number" 
                    className="w-24 border rounded p-1 text-right"
                    value={formData.discount_amount}
                    readOnly={isEditMode}
                    onChange={handleDiscountChange}
                />
            </div>
            <div className="summary-row total">
              <span>Grand Total</span>
              <span>₹{formData.total.toFixed(2)}</span>
            </div>

            {!isEditMode && (
            <button
              type="submit"
              className="btn btn-primary w-full mt-6 justify-center"
              disabled={loading}
            >
              <Save size={18} />
              <span>{loading ? "Processing..." : "Create Invoice"}</span>
            </button>
            )}
          </div>
        </div>
      </form>

      {/* Hidden Print Component */}
      <div style={{ display: "none" }}>
        <InvoicePrint ref={componentRef} invoice={formData} settings={storeSettings} />
      </div>
    </div>
  );
};

export default InvoiceForm;
