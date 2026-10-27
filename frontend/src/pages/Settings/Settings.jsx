import React, { useState, useEffect } from "react";
import { Save, Lock, Store, User, Layers } from "lucide-react";
import api from "../../services/api";
import CategoryManagement from "./CategoryManagement";
import "./Settings.css";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile State
  const [profileData, setProfileData] = useState({
    store_name: "",
    address: "",
    phone: "",
    gstin: "",
    email: ""
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/api/auth/settings/");
      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile", error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.put("/api/auth/settings/", profileData);
      setMessage({ type: "success", text: "Store profile updated successfully!" });
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
        setMessage({ type: "error", text: "New passwords do not match." });
        return;
    }
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.post("/api/auth/change-password/", {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
      });
      setMessage({ type: "success", text: "Password changed successfully!" });
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      console.error("Error changing password", error);
      setMessage({ type: "error", text: error.response?.data?.old_password?.[0] || "Failed to change password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      <div className="settings-container">
        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <Store size={18} />
            <span>Store Profile</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            <Layers size={18} />
            <span>Product Management</span>
          </button>
        </div>

        {/* Content */}
        <div className="card p-6 settings-content">
            {message.text && (
                <div className={`alert ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} p-3 rounded mb-4`}>
                    {message.text}
                </div>
            )}

            {activeTab === "profile" && (
                <form onSubmit={handleProfileUpdate}>
                    <div className="form-group mb-4">
                        <label>Store Name</label>
                        <input 
                            type="text" 
                            className="w-full border rounded p-2"
                            value={profileData.store_name}
                            onChange={(e) => setProfileData({...profileData, store_name: e.target.value})}
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label>Address</label>
                        <textarea 
                            className="w-full border rounded p-2"
                            rows="3"
                            value={profileData.address}
                            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group mb-4">
                            <label>Phone</label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            />
                        </div>
                        <div className="form-group mb-4">
                            <label>GSTIN (Optional)</label>
                            <input 
                                type="text" 
                                className="w-full border rounded p-2"
                                value={profileData.gstin}
                                onChange={(e) => setProfileData({...profileData, gstin: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        <span>{loading ? "Saving..." : "Save Changes"}</span>
                    </button>
                </form>
            )}

            {activeTab === "products" && <CategoryManagement />}

            {activeTab === "security" && (
                <form onSubmit={handlePasswordChange}>
                    <div className="form-group mb-4">
                        <label>Current Password</label>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2"
                            value={passwordData.old_password}
                            onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group mb-4">
                        <label>Confirm New Password</label>
                        <input 
                            type="password" 
                            className="w-full border rounded p-2"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <Save size={18} />
                        <span>{loading ? "Changing..." : "Change Password"}</span>
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
