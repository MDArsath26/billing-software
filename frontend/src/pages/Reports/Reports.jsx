import React, { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Package, DollarSign } from "lucide-react";
import api from "../../services/api";
import "./Reports.css";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "sales") endpoint = `/api/reports/sales/?start_date=${startDate}&end_date=${endDate}`;
      if (activeTab === "inventory") endpoint = `/api/reports/inventory/`;
      if (activeTab === "profit") endpoint = `/api/reports/profit/?start_date=${startDate}&end_date=${endDate}`;

      if (endpoint) {
        const response = await api.get(endpoint);
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching report", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSalesTab = () => (
    <div className="report-content">
      {/* KPI Cards */}
      <div className="stats-grid mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-green"><DollarSign size={24} /></div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <p>₹{data?.total_sales?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
        <div className="stat-card">
            <div className="stat-icon bg-blue"><TrendingUp size={24} /></div>
            <div className="stat-info">
                <h3>Total Invoices</h3>
                <p>{data?.invoice_count || 0}</p>
            </div>
        </div>
        <div className="stat-card">
            <div className="stat-icon bg-purple"><DollarSign size={24} /></div>
            <div className="stat-info">
                <h3>Tax Collected</h3>
                <p>₹{data?.total_tax?.toFixed(2) || "0.00"}</p>
            </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6 mb-6 h-80">
        <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.chart_data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#10b981" name="Sales (₹)" />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
      <div className="report-content">
        <div className="stats-grid mb-6">
            <div className="stat-card">
                <div className="stat-icon bg-blue"><Package size={24} /></div>
                <div className="stat-info">
                    <h3>Total Products</h3>
                    <p>{data?.product_count || 0}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon bg-orange"><DollarSign size={24} /></div>
                <div className="stat-info">
                    <h3>Inventory Cost Value</h3>
                    <p>₹{data?.total_cost_value?.toFixed(2) || "0.00"}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon bg-green"><TrendingUp size={24} /></div>
                <div className="stat-info">
                    <h3>Potential Sales Value</h3>
                    <p>₹{data?.total_sales_value?.toFixed(2) || "0.00"}</p>
                </div>
            </div>
        </div>

        <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Product Inventory</h3>
            <div className="table-responsive">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th className="text-center">Stock</th>
                            <th className="text-right">Cost Price</th>
                            <th className="text-right">Selling Price</th>
                            <th className="text-right">Total Cost Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.products?.map(p => (
                            <tr key={p.id}>
                                <td>{p.name}</td>
                                <td>{p.sku}</td>
                                <td className="text-center">
                                    <span className={`badge ${p.stock_qty < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {p.stock_qty}
                                    </span>
                                </td>
                                <td className="text-right">₹{p.cost_price.toFixed(2)}</td>
                                <td className="text-right">₹{p.selling_price.toFixed(2)}</td>
                                <td className="text-right font-medium">₹{p.total_cost.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
  );

  const renderProfitTab = () => (
    <div className="report-content">
        <div className="stats-grid mb-6">
            <div className="stat-card">
                <div className="stat-icon bg-green"><DollarSign size={24} /></div>
                <div className="stat-info">
                    <h3>Total Revenue (Net)</h3>
                    <p>₹{data?.total_sales?.toFixed(2) || "0.00"}</p>
                    <small className="text-gray-500">Excl. Tax</small>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon bg-red"><DollarSign size={24} /></div>
                <div className="stat-info">
                    <h3>Total Cost (COGS)</h3>
                    <p>₹{data?.total_cost?.toFixed(2) || "0.00"}</p>
                </div>
            </div>
            <div className="stat-card">
                <div className="stat-icon bg-purple"><TrendingUp size={24} /></div>
                <div className="stat-info">
                    <h3>Gross Profit</h3>
                    <p>₹{data?.gross_profit?.toFixed(2) || "0.00"}</p>
                    <small className="text-green-600">
                        {data?.total_sales > 0 ? ((data.gross_profit / data.total_sales) * 100).toFixed(1) : 0}% Margin
                    </small>
                </div>
            </div>
        </div>

        <div className="card p-6 h-80">
            <h3 className="text-lg font-semibold mb-4">Profit Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data?.chart_data || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#10b981" name="Sales" />
                    <Line type="monotone" dataKey="profit" stroke="#8b5cf6" name="Profit" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header flex-col md:flex-row gap-4 items-start md:items-center">
        <h1>Reports</h1>
        
        {/* Date Filter (Only for Sales & Profit) */}
        {activeTab !== 'inventory' && (
            <div className="flex gap-2 items-center bg-white p-2 rounded shadow-sm border">
                <Calendar size={18} className="text-gray-500" />
                <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    className="border-none outline-none text-sm"
                />
                <span className="text-gray-400">-</span>
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    className="border-none outline-none text-sm"
                />
            </div>
        )}
      </div>

      {/* Tabs */}
      <div className="report-tabs">
        <button 
            className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sales')}
        >
            Sales Report
        </button>
        <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
        >
            Inventory Value
        </button>
        <button 
            className={`tab-btn ${activeTab === 'profit' ? 'active' : ''}`}
            onClick={() => setActiveTab('profit')}
        >
            Profit & Loss
        </button>
      </div>

      {/* Content */}
      <div className="report-body mt-6">
        {loading ? (
            <div className="text-center py-12 text-gray-500">Loading Report Data...</div>
        ) : data ? (
            <>
                {activeTab === 'sales' && renderSalesTab()}
                {activeTab === 'inventory' && renderInventoryTab()}
                {activeTab === 'profit' && renderProfitTab()}
            </>
        ) : (
            <div className="text-center py-12 text-gray-500">No data available or failed to load.</div>
        )}
      </div>
    </div>
  );
};

export default Reports;
