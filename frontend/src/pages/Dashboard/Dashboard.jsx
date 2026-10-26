import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Package, ShoppingCart, AlertTriangle, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from "../../services/api";
import "./Dashboard.css";

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      <Icon size={24} />
    </div>
    <div className="stat-info">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_invoices: 0,
    total_products: 0,
    low_stock_products: [],
    daily_sales: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/reports/dashboard/");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <StatCard 
            title="Total Revenue" 
            value={`₹${parseFloat(stats.total_revenue || 0).toFixed(2)}`} 
            icon={DollarSign} 
            color="bg-green"
        />
        <StatCard 
            title="Customers" 
            value={stats.total_customers || 0} 
            icon={Users} 
            color="bg-orange"
        />
        <StatCard 
            title="Total Invoices" 
            value={stats.total_invoices || 0} 
            icon={ShoppingCart} 
            color="bg-purple"
        />
        <StatCard 
            title="Total Products" 
            value={stats.total_products || 0} 
            icon={Package} 
            color="bg-blue"
        />
      </div>

      <div className="dashboard-content-grid mt-6">
        {/* Sales Chart */}
        <div className="card p-6 chart-container">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Last 7 Days Revenue
            </h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.daily_sales}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()}/${date.getMonth()+1}`;
                            }}
                            tick={{fontSize: 12}}
                        />
                        <YAxis tick={{fontSize: 12}} />
                        <Tooltip 
                            formatter={(value) => [`₹${value}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-amubuer-600">
                <AlertTriangle size={20} className="text-orange-500" />
                Low Stock Alerts
            </h2>
            {stats.low_stock_products.length > 0 ? (
                <div className="low-stock-list">
                    {stats.low_stock_products.map(p => (
                        <div key={p.id} className="low-stock-item">
                            <div>
                                <div className="font-medium">{p.name}</div>
                                <div className="text-sm text-gray-500">{p.sku}</div>
                            </div>
                            <div className="stock-badge">
                                {p.stock_qty} left
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-500 text-center py-4">
                    All products are well stocked!
                </div>
            )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
            <Link to="/sales/new" className="btn btn-primary">
                New Invoice
            </Link>
            <Link to="/products/new" className="btn btn-secondary">
                Add Product
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
