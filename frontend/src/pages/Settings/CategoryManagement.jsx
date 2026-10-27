import React, { useState, useEffect } from "react";
import { Plus, Trash2, ChevronRight, ChevronDown, Folder, FileText } from "lucide-react";
import api from "../../services/api";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [subcategories, setSubcategories] = useState({}); // Map: categoryId -> [subcats]
  const [newSubCategory, setNewSubCategory] = useState({}); // Map: categoryId -> string (input value)
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/products/categories/");
      setCategories(response.data);
    } catch (err) {
        setError("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await api.get(`/api/products/subcategories/?category_id=${categoryId}`);
      setSubcategories(prev => ({ ...prev, [categoryId]: response.data }));
    } catch (err) {
        console.error("Failed to load subcategories", err);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
        const isExpanded = !prev[categoryId];
        if (isExpanded && !subcategories[categoryId]) {
            fetchSubCategories(categoryId);
        }
        return { ...prev, [categoryId]: isExpanded };
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
        const response = await api.post("/api/products/categories/", { name: newCategory });
        setCategories([response.data, ...categories]);
        setNewCategory("");
    } catch (err) {
        alert(err.response?.data?.name?.[0] || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id) => {
      if (!window.confirm("Are you sure? This will delete the category.")) return;
      try {
          await api.delete(`/api/products/categories/${id}/`);
          setCategories(categories.filter(c => c.id !== id));
      } catch (err) {
          alert("Failed to delete category. It may contain products or subcategories.");
      }
  };

  const handleAddSubCategory = async (e, categoryId) => {
      e.preventDefault();
      const name = newSubCategory[categoryId];
      if (!name?.trim()) return;

      try {
          const response = await api.post("/api/products/subcategories/", { 
              name: name,
              category_id: categoryId 
          });
          setSubcategories(prev => ({
              ...prev,
              [categoryId]: [...(prev[categoryId] || []), response.data]
          }));
          setNewSubCategory(prev => ({ ...prev, [categoryId]: "" }));
      } catch (err) {
          alert("Failed to add subcategory");
      }
  };

  const handleDeleteSubCategory = async (subId, categoryId) => {
      if (!window.confirm("Are you sure?")) return;
      try {
          await api.delete(`/api/products/subcategories/${subId}/`);
          setSubcategories(prev => ({
              ...prev,
              [categoryId]: prev[categoryId].filter(s => s.id !== subId)
          }));
      } catch (err) {
          alert("Failed to delete subcategory.");
      }
  };

  return (
    <div className="category-manager">
        <h2 className="text-xl font-semibold mb-4">Product Management</h2>
        
        {/* Add Category */}
        <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input 
                type="text" 
                placeholder="New Category Name" 
                className="flex-1 border rounded p-2"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
            />
            <button type="submit" className="btn btn-primary whitespace-nowrap">
                <Plus size={18} /> Add Category
            </button>
        </form>

        {/* Category List */}
        <div className="space-y-2">
            {categories.map(category => (
                <div key={category.id} className="border rounded bg-white">
                    <div className="flex items-center justify-between p-3 bg-gray-50">
                        <div 
                            className="flex items-center gap-2 cursor-pointer select-none"
                            onClick={() => toggleCategory(category.id)}
                        >
                            {expandedCategories[category.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            <Folder size={18} className="text-blue-500" />
                            <span className="font-medium">{category.name}</span>
                        </div>
                        <button 
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>

                    {/* Subcategories */}
                    {expandedCategories[category.id] && (
                        <div className="p-3 pl-8 border-t">
                            <ul className="space-y-2 mb-3">
                                {subcategories[category.id]?.map(sub => (
                                    <li key={sub.id} className="flex items-center justify-between text-sm group">
                                        <div className="flex items-center gap-2">
                                            <FileText size={16} className="text-gray-400" />
                                            {sub.name}
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteSubCategory(sub.id, category.id)}
                                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </li>
                                ))}
                                {subcategories[category.id]?.length === 0 && (
                                    <li className="text-gray-400 text-sm italic">No subcategories</li>
                                )}
                            </ul>

                            {/* Add Subcategory */}
                            <form onSubmit={(e) => handleAddSubCategory(e, category.id)} className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Add subcategory..." 
                                    className="flex-1 border rounded px-2 py-1 text-sm"
                                    value={newSubCategory[category.id] || ""}
                                    onChange={(e) => setNewSubCategory({...newSubCategory, [category.id]: e.target.value})}
                                />
                                <button type="submit" className="btn btn-sm btn-secondary">
                                    <Plus size={14} />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ))}
            
            {loading && <div>Loading...</div>}
            {!loading && categories.length === 0 && (
                <div className="text-gray-500 text-center py-4">No categories found.</div>
            )}
        </div>
    </div>
  );
};

export default CategoryManagement;
