import { useState, useEffect, useRef } from "react";
import { Pencil, Trash2, PackagePlus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "./sidebar";

const BASE = "https://localhost:7177/api/adminproduct";
const SIZES = ["S", "M", "L", "XL"]; // Only 4 sizes
const LOW_STOCK_THRESHOLD = 5;
const TOAST_STYLE = {
  style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd" },
};

const getAdminHeaders = () => {
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  return admin?.token ? { Authorization: `Bearer ${admin.token}` } : {};
};

const emptyForm = {
  name: "", category: "", price: "", rating: "", color: "", description: "",
  sizes: [], images: [], previewImages: [],
};

const emptyAddStock = { sizes: [] };


function StockBadge({ sizeStocks }) {
  const total = (sizeStocks || []).reduce((sum, s) => sum + (s.stock ?? s.Stock ?? 0), 0);
  const hasLow = (sizeStocks || []).some((s) => { const st = s.stock ?? s.Stock ?? 0; return st > 0 && st <= LOW_STOCK_THRESHOLD; });
  if (total === 0) return <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Out of Stock</span>;
  if (hasLow) return <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full"> Low Stock</span>;
  return <span className="text-xs font-semibold text-green-600 bg-green -60 px-2 py-0.5 rounded-full">In Stock</span>;
}

function SizeStockSelector({ sizes, onToggle, onStockChange }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {SIZES.map((size) => {
          const selected = sizes.find((s) => s.size === size);
          return (
            <div key={size} className="flex items-center gap-1">
              <button type="button" onClick={() => onToggle(size)}
                className={`px-1 py-1 border rounded-md text-sm transition-all duration-200 w-11
                  ${selected
                    ? "bg-gray-800 text-white border-gray-800"
                    : "border-gray-700 text-gray-800 hover:bg-gray-100"}`}>
                {size}
              </button>
              {selected && (
                <input
                  type="number" min="1"
                  autoFocus={sizes[sizes.length - 1].size === size}
                  placeholder="0"
                  className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-black"
                  value={selected.stock || ""}
                  onChange={(e) => onStockChange(size, Number(e.target.value))}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null); 
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState({ category: "", color: "", stock: "" });
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [addStockProductId, setAddStockProductId] = useState(null);
  const [addStockForm, setAddStockForm] = useState(emptyAddStock);
  const [addStockLoading, setAddStockLoading] = useState(false);

  const headers = getAdminHeaders();

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${BASE}/all-products`, { withCredentials: true, headers });
      setProducts(res.data.data || []);
    } catch (err) { console.error("Fetch products error:", err); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => {
        const previews = [...prev.previewImages];
        const images = [...prev.images];
        previews[index] = reader.result;
        images[index] = file;
        return { ...prev, previewImages: previews, images };
      });
    };
    reader.readAsDataURL(file);
  };

  const addImageSlot = () => {
    setForm((prev) => ({ ...prev, previewImages: [...prev.previewImages, null], images: [...prev.images, null] }));
  };


  const handleSizeToggle = (size) => {
    setForm((prev) => {
      const exists = prev.sizes.find((s) => s.size === size);
      if (exists) return { ...prev, sizes: prev.sizes.filter((s) => s.size !== size) };
      return { ...prev, sizes: [...prev.sizes, { size, stock: "" }] };
    });
  };

  const handleStockChange = (size, stock) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => s.size === size ? { ...s, stock: Number(stock) } : s),
    }));
  };

  const handleAddStockToggle = (size) => {
    setAddStockForm((prev) => {
      const exists = prev.sizes.find((s) => s.size === size);
      if (exists) return { ...prev, sizes: prev.sizes.filter((s) => s.size !== size) };
      return { ...prev, sizes: [...prev.sizes, { size, stock: "" }] };
    });
  };

  const handleAddStockChange = (size, stock) => {
    setAddStockForm((prev) => ({
      ...prev,
      sizes: prev.sizes.map((s) => s.size === size ? { ...s, stock: Number(stock) } : s),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.images.some(Boolean) && editingId === "new") { toast.error("Please upload at least one image.", TOAST_STYLE); return; }
    if (!form.sizes.length) { toast.error("Please select at least one size.", TOAST_STYLE); return; }
    if (form.sizes.some((s) => !s.stock || Number(s.stock) <= 0)) { toast.error("Stock must be greater than 0 for all selected sizes.", TOAST_STYLE); return; }

    setLoading(true);
    try {
      if (editingId === "new") {
        const fd = new FormData();
        fd.append("Name", form.name); fd.append("Category", form.category);
        fd.append("Price", form.price); fd.append("Color", form.color);
        fd.append("Description", form.description); fd.append("Rating", form.rating || 0);
        form.images.forEach((img) => { if (img) fd.append("Images", img); });
        const res = await axios.post(`${BASE}/add-product`, fd, { withCredentials: true, headers: { ...headers, "Content-Type": "multipart/form-data" } });
        const productId = res.data.data?.productId;
        await axios.post(`${BASE}/add-stock?productId=${productId}`, { sizes: form.sizes }, { withCredentials: true, headers });
        toast.success("Product added successfully!", TOAST_STYLE);
      } else {
        const fd = new FormData();
        if (form.name) fd.append("Name", form.name); if (form.category) fd.append("Category", form.category);
        if (form.price) fd.append("Price", form.price); if (form.color) fd.append("Color", form.color);
        if (form.description) fd.append("Description", form.description); if (form.rating) fd.append("Rating", form.rating);
        form.images.forEach((img) => { if (img) fd.append("Images", img); });
        await axios.put(`${BASE}/update-product?productId=${editingId}`, fd, { withCredentials: true, headers: { ...headers, "Content-Type": "multipart/form-data" } });
        await axios.put(`${BASE}/update-stock?productId=${editingId}`, { sizes: form.sizes }, { withCredentials: true, headers });
        toast.success("Product updated successfully!", TOAST_STYLE);
      }
      setEditingId(null); setForm(emptyForm); fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save product.", TOAST_STYLE); }
    finally { setLoading(false); }
  };

  const handleAddStockSubmit = async () => {
    const sizesToUpdate = addStockForm.sizes.filter((s) => s.stock && Number(s.stock) > 0);
    if (!sizesToUpdate.length) { toast.error("Please enter stock for at least one size.", TOAST_STYLE); return; }
    setAddStockLoading(true);
    try {
      await axios.post(`${BASE}/add-stock?productId=${addStockProductId}`, { sizes: sizesToUpdate }, { withCredentials: true, headers });
      toast.success("Stock added successfully!", TOAST_STYLE);
      setAddStockProductId(null); setAddStockForm(emptyAddStock);
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to add stock.", TOAST_STYLE); }
    finally { setAddStockLoading(false); }
  };

  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <span className="font-medium">Delete this product?</span>
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded-lg text-sm" onClick={() => toast.dismiss(t.id)}>Cancel</button>
          <button className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm" onClick={async () => {
            try {
              await axios.delete(`${BASE}/delete-product?productId=${id}`, { withCredentials: true, headers });
              setProducts((prev) => prev.filter((p) => p.id !== id));
              toast.success("Product deleted!", TOAST_STYLE);
            } catch { toast.error("Failed to delete.", TOAST_STYLE); }
            toast.dismiss(t.id);
          }}>Delete</button>
        </div>
      </div>
    ), { duration: 4000, ...TOAST_STYLE });
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    const ss = p.sizeStocks ?? p.SizeStocks ?? [];
    setForm({
      name: p.name ?? "", category: p.categoryName ?? p.category ?? "",
      price: p.price ?? "", color: p.color ?? "",
      description: p.description ?? "", rating: p.rating ?? "",
      sizes: ss.map((s) => ({ size: s.size ?? s.Size, stock: s.stock ?? s.Stock })),
      images: [], previewImages: p.images ?? p.Images ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categories = [...new Set(products.map((p) => p.categoryName ?? p.category).filter(Boolean))];
  const colors = [...new Set(products.map((p) => p.color).filter(Boolean))];
  const getSizeStocks = (p) => p.sizeStocks ?? p.SizeStocks ?? [];
  const getTotal = (p) => getSizeStocks(p).reduce((sum, s) => sum + (s.stock ?? s.Stock ?? 0), 0);
  const hasLowStock = (p) => getSizeStocks(p).some((s) => { const st = s.stock ?? s.Stock ?? 0; return st > 0 && st <= LOW_STOCK_THRESHOLD; });

  const stockCounts = products.reduce((acc, p) => {
    if (getTotal(p) === 0) acc.out++;
    else if (hasLowStock(p)) acc.low++;
    else acc.in++;
    return acc;
  }, { in: 0, low: 0, out: 0 });

  const filteredProducts = products
    .filter((p) => filter.category ? (p.categoryName ?? p.category) === filter.category : true)
    .filter((p) => filter.color ? p.color === filter.color : true)
    .filter((p) => {
      if (!filter.stock) return true;
      if (filter.stock === "out") return getTotal(p) === 0;
      if (filter.stock === "low") return hasLowStock(p);
      if (filter.stock === "in") return getTotal(p) > 0 && !hasLowStock(p);
      return true;
    })
    .filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (p.name ?? "").toLowerCase().includes(s) || String(p.price ?? "").includes(s) ||
        String(p.id ?? "").includes(s) || (p.color ?? "").toLowerCase().includes(s) ||
        (p.categoryName ?? p.category ?? "").toLowerCase().includes(s);
    });

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black transition-colors bg-white";
  const imageSlots = form.previewImages.length < 5
    ? [...form.previewImages, ...Array(5 - form.previewImages.length).fill(null)]
    : [...form.previewImages];


  const addStockProduct = products.find((p) => p.id === addStockProductId);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-y-auto">

  
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-2xl font-semibold text-gray-900">Manage Products</h2>
          <button onClick={() => { if (editingId === "new") { setEditingId(null); setForm(emptyForm); } else { setEditingId("new"); setForm(emptyForm); window.scrollTo({ top: 0, behavior: "smooth" }); } }}
            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition text-sm font-medium">
            {editingId === "new" ? "✕ Cancel" : "+ Add Product"}
          </button>
        </div>

        {editingId && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h4 className="text-gray-800 font-semibold mb-5 text-lg">
              {editingId === "new" ? "Add New Product" : "Edit Product"}
            </h4>

            {editingId !== "new" && (form.previewImages ?? []).filter(Boolean)[0] && (
              <div className="flex items-center gap-4 mb-5">
                <img src={(form.previewImages ?? []).filter(Boolean)[0]}
                  className="w-20 h-20 object-cover rounded-2xl border border-gray-100" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{form.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Editing product</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div><label className="block text-xs text-gray-800 mb-1">Product Name *</label>
                  <input className={inputClass} placeholder="e.g. Classic Blazer" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div><label className="block text-xs text-gray-800 mb-1">Category *</label>
                  <input className={inputClass} placeholder="e.g. Formal" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></div>
                <div><label className="block text-xs text-gray-800 mb-1">Color *</label>
                  <input className={inputClass} placeholder="e.g. Navy Blue" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} required /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><label className="block text-xs text-gray-800 mb-1">Price (₹) *</label>
                  <input type="number" className={inputClass} placeholder="e.g. 2999" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
                <div><label className="block text-xs text-gray-800 mb-1">Rating (0–5)</label>
                  <input type="number" step="0.1" min="0" max="5" className={inputClass} placeholder="e.g. 4.2" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} /></div>
              </div>

              <div className="mb-4"><label className="block text-xs text-gray-800 mb-1">Description *</label>
                <textarea className={inputClass + " resize-none"} rows={3} placeholder="Product description..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>

              <div className="mb-4">
                <label className="block text-xs text-gray-800 mb-2">Sizes & Stock * <span className="text-gray-400">(click size to select, set stock &gt; 0)</span></label>
                <SizeStockSelector sizes={form.sizes} onToggle={handleSizeToggle} onStockChange={handleStockChange} />
              </div>

              <div className="mb-6">
                <label className="block text-xs text-gray-800 mb-2">Images *</label>
                <div className="flex gap-3 flex-wrap">
                  {imageSlots.map((preview, idx) => (
                    <label key={idx} className={`relative w-30 h-40 flex items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors flex-shrink-0
                      ${preview ? "border-black" : "border-gray-200 hover:border-gray-400"}`}>
                      {preview ? <img src={preview} className="w-full h-full object-cover rounded-xl" />
                        : <span className="text-xs text-gray-400 text-center leading-tight px-1">+ Image {idx + 1}</span>}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, idx)} />
                    </label>
                  ))}
                  <button type="button" onClick={addImageSlot}
                    className="w-30 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl hover:border-black hover:bg-gray-50 transition-colors flex-shrink-0 text-gray-400 hover:text-black">
                    <span className="text-2xl leading-none">+</span>
                    <span className="text-xs mt-1">Add More</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50">
                  {loading ? "Saving..." : editingId === "new" ? "Add Product" : "Update Product"}
                </button>
                <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {addStockProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {(addStockProduct?.images ?? addStockProduct?.Images)?.[0] && (
                    <img src={(addStockProduct?.images ?? addStockProduct?.Images)[0]}
                      className="w-12 h-12 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                  )}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{addStockProduct?.name ?? ""}</h3>
                    <p className="text-xs text-gray-400">ID: {addStockProductId}</p>
                  </div>
                </div>
              
              </div>

              <div className="flex flex-wrap gap-7 mb-4 bg-gray-100 rounded-xl px-3 py-2">
                <p className="text-sm text-gray-600 ">Current stock:</p>
                {addStockForm.sizes.map(({ size }) => {
                  const current = getSizeStocks(addStockProduct).find((s) => (s.size ?? s.Size) === size);
                  const currentStock = current?.stock ?? current?.Stock ?? 0;
                  return (
                    <span key={size} className="text-sm text-gray-600 font-medium">
                      {size}: <span className="font-bold text-gray-900">{currentStock}</span>
                    </span>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mb-3">Enter quantity to add:</p>

              <div className="flex flex-wrap gap-2">
                {addStockForm.sizes.map(({ size, stock }) => (
                  <div key={size} className="flex items-center gap-1">
                    <button type="button"
                      className="px-1 py-1 border rounded-md text-sm w-11 bg-gray-800 text-white border-gray-800 cursor-default">
                      {size}
                    </button>
                    <input
                      type="number" min="0"
                      placeholder="0"
                      className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-black"
                      value={stock || ""}
                      onChange={(e) => handleAddStockChange(size, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={handleAddStockSubmit} disabled={addStockLoading}
                  className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition disabled:opacity-50">
                  {addStockLoading ? "Adding..." : "Add Stock"}
                </button>
                <button onClick={() => { setAddStockProductId(null); setAddStockForm(emptyAddStock); }}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="border border-gray-300 px-3 py-1.5 rounded-xl text-sm focus:outline-none focus:border-black">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filter.color} onChange={(e) => setFilter({ ...filter, color: e.target.value })}
            className="border border-gray-300 px-3 py-1.5 rounded-xl text-sm focus:outline-none focus:border-black">
            <option value="">All Colors</option>
            {colors.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>


          <div className="flex gap-2">
            {[
              { key: "in", label: "In Stock", count: stockCounts.in, dot: "bg-green-500", active: "bg-green-100 text-green-700 border-green-300" },
              { key: "low", label: "Low Stock", count: stockCounts.low, dot: "bg-orange-400", active: "bg-orange-100 text-orange-700 border-orange-300" },
              { key: "out", label: "Out of Stock", count: stockCounts.out, dot: "bg-red-500", active: "bg-red-100 text-red-700 border-red-300" },
            ].map(({ key, label, count, dot, active }) => (
              <button key={key}
                onClick={() => setFilter((f) => ({ ...f, stock: f.stock === key ? "" : key }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition
                  ${filter.stock === key ? active : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                {label}
                <span className={`font-bold text-xs px-1.5 py-0.5 rounded-full ${filter.stock === key ? "bg-white/60" : "bg-gray-100"}`}>{count}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setFilter({ category: "", color: "", stock: "" })}
            className="px-3 py-1.5 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition">
            Reset
          </button>

          <div className="ml-auto flex flex-col items-center" style={{ width: 260 }}>
            <input type="text" placeholder="Search products" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-b border-gray-400 bg-transparent text-sm text-gray-900 tracking-wide py-1 focus:outline-none focus:border-black transition-colors" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="bg-gray-200 rounded-2xl p-4 flex items-center text-xs font-semibold text-gray-600 gap-3 tracking-wide">
            <span className="w-6">#</span>
            <span className="w-16">Image</span>
            <span className="flex-1">Name</span>
            <span className="w-28">Category</span>
            <span className="w-20">Price</span>
            <span className="w-52">Stock by Size</span>
            <span className="w-24">Status</span>
            <span className="w-28">Actions</span>
          </div>

          {filteredProducts.length === 0 && <p className="text-center text-gray-500 text-sm py-10">No products found.</p>}

          {filteredProducts.map((p, i) => {
            const firstImage = (p.images ?? p.Images)?.[0];
            const sizeStocks = getSizeStocks(p);
            const isExpanded = expandedId === p.id;

            return (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 flex items-center gap-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                  <span className="w-6 text-sm text-gray-500">{p.id}</span>
                  {firstImage ? <img src={firstImage} alt={p.name} className="h-12 w-16 object-cover rounded-xl flex-shrink-0" />
                    : <div className="h-12 w-16 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400 flex-shrink-0">No img</div>}
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{p.name}</span>
                  <span className="w-28 text-sm text-gray-500 truncate">{p.categoryName ?? p.category}</span>
                  <span className="w-20 text-sm text-gray-700 font-medium">₹{p.price}</span>

                  <div className="w-52 flex flex-wrap gap-1">
                    {sizeStocks.length === 0 ? <span className="text-xs text-gray-400">No stock</span> :
                      sizeStocks.map((s) => {
                        const sz = s.size ?? s.Size;
                        const st = s.stock ?? s.Stock ?? 0;
                        return (
                          <span key={sz} className={`text-xs px-1.5 py-0.5 rounded-md font-medium
                            ${st === 0 ? "bg-red-50 text-red-400" : st <= LOW_STOCK_THRESHOLD ? "bg-orange-50 text-orange-500" : "bg-gray-100 text-gray-700"}`}>
                            {sz}: {st}
                          </span>
                        );
                      })}
                  </div>

                  <div className="w-24"><StockBadge sizeStocks={sizeStocks} /></div>

                  <div className="w-28 flex gap-1.5 items-center" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEdit(p)} title="Edit"
                      className="p-2 rounded-lg bg-gray-100 hover:bg-black hover:text-white text-gray-600 transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => {
                      setAddStockProductId(p.id);
                      const ss = getSizeStocks(p);
                      setAddStockForm({ sizes: ss.map((s) => ({ size: s.size ?? s.Size, stock: 0 })) });
                    }} title="Add Stock"
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-800 hover:text-white text-gray-600 transition-colors">
                      <PackagePlus size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} title="Delete"
                      className="p-2 rounded-lg bg-gray-100 hover:bg-red-600 hover:text-white text-gray-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {isExpanded && (p.images ?? p.Images ?? []).filter(Boolean).length > 0 && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Product Images</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(p.images ?? p.Images).filter(Boolean).map((imgUrl, idx) => (
                        <img key={idx} src={imgUrl} className="h-24 w-24 object-cover rounded-xl flex-shrink-0" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}