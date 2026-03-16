import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "./sidebar";
import { Link } from "react-router-dom";

export default function AdminProducts() {
const [products, setProducts] = useState([]);
const [editingpId, setEditingpId] = useState(null);
const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", rating: "", color: "", 
description: "", sizes: [], image: [], inStock: true, });
const [search, setSearch] = useState("");
const [filter, setFilter] = useState({ category: "", color: "" });
const [errors, setErrors] = useState({ image: "", sizes: "" });

  const fetchProducts = () => {
    axios
      .get("http://localhost:5000/products")
      .then((res) => setProducts(res.data.data || []))
      .catch((err) => console.error("Fetch products error:", err));
  };
  
  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <span>Are you sure you want to delete this product?</span>
          <div className="flex justify-end gap-2">
            <button
              className="px-2 py-1 bg-gray-300 rounded"
              onClick={() => toast.dismiss(t.id)}>
              Cancel
            </button>
            <button
              className="px-2 py-1 bg-red-600 text-white rounded"
              onClick={async () => {
                try {
                  await axios.delete(`http://localhost:5000/products/${id}`);
                  setProducts((prev) => prev.filter((p) => p.id !== id));
                  toast.success("Product deleted!");
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete product.");
                }
                toast.dismiss(t.id);
              }}> Delete </button>
          </div>
        </div>
      ),
      { duration: 4000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let valid = true;
    const newErrors = { image: "", sizes: "" };

    if (!newProduct.image?.some((img) => img)) {
      newErrors.image = "Please upload at least one image";
      valid = false;
    }

    if (!newProduct.sizes?.length) {
      newErrors.sizes = "Please select at least one size";
      valid = false;
    }

    setErrors(newErrors);
    if (!valid) return;

    try {
      if (editingpId && editingpId !== "new") {
        await axios.put(`http://localhost:5000/products/${editingpId}`, newProduct);
        toast.success("Product updated!");
      } else {
        await axios.post("http://localhost:5000/products", newProduct);
        toast.success("Product added!");
      }

      setEditingpId(null);
      setNewProduct({ name: "", category: "", price: "", rating: "", color: "", description: "", sizes: [], image: [], inStock: true, });
      setErrors({ image: "", sizes: "" });
      fetchProducts();
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to save product.");
    }
  };

  const handleEdit = (product) => {
    setEditingpId(product.id);
    setNewProduct({
      ...product,
      image: product.image || [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrors({ image: "", sizes: "" });
  };

  const handleSizeChange = (size) => {
    setNewProduct((prev) => {
      const updatedSizes = prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
    setErrors((prev) => ({ ...prev, sizes: "" }));
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => {
        const updated = [...prev.image];
        updated[index] = reader.result; 
        return { ...prev, image: updated };
      });
      setErrors((prev) => ({ ...prev, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const colors = Array.from(new Set(products.map((p) => p.color)));

  const filteredProducts = products
    .filter((p) => (filter.category ? p.category === filter.category : true))
    .filter((p) => (filter.color ? p.color === filter.color : true))
    .filter((p) => search ?
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          String(p.price).includes(search) ||
          String(p.id).includes(search) ||
          p.color.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()) : true
    );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-2xl font-semibold text-gray-800">Manage Products</h2>

          <button
            onClick={() => {
              if (editingpId === "new") {
                setEditingpId(null);
                setNewProduct(null);
                setErrors({ image: "", sizes: "" });
              } else { setEditingpId("new"); 
                setNewProduct({ name: "", category: "", price: "", rating: "", color: "", description: "", sizes: [], image: [], inStock: true, });
                setErrors({ image: "", sizes: "" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition cursor-pointer">Add Product</button>
        </div>

        {editingpId && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h4 className="text-gray-800 font-semibold mb-4">
              {editingpId === "new" ? "Add New Product" : "Edit Product"}
            </h4>

            {editingpId !== "new" && newProduct.image?.[0] && (
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={newProduct.image[0]}
                  alt={newProduct.name}
                  className="h-20 w-20 object-cover rounded"
                />
                <span className="text-lg font-medium text-gray-700">{newProduct.name}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="border p-2 rounded"
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                className="border p-2 rounded"
                required
              />
              <input
                type="text"
                placeholder="Color"
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                className="border p-2 rounded"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="border p-2 rounded col-span-2"
              />

              <div className="col-span-2 flex flex-wrap gap-2">
                <label className="font-medium w-full">Sizes:</label>
                {["S", "M", "L", "XL", "XXL"].map((size) => (
                  <button
                    type="button"
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-3 py-1 border rounded ${
                      newProduct.sizes.includes(size) ? "bg-gray-800 text-white" : "text-gray-700"
                    }`}
                  >
                    {size}
                  </button>
                ))}
                {errors.sizes && <p className="text-red-500 text-sm mt-1">{errors.sizes}</p>}
              </div>

              <div className="col-span-2">
                <label className="font-medium w-full block mb-2">Images:</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <input
                        type="file"
                        onChange={(e) => handleImageChange(e, idx)}
                        className="border p-2 rounded-2xl w-full"
                      />
                      {newProduct.image?.[idx] && (
                        <img
                          src={newProduct.image[idx]}
                          className="h-16 w-16 mt-1 rounded object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
              </div>

              <div className="col-span-2 flex items-center gap-4 mt-7">
                <label>
                  <input
                    type="checkbox"
                    checked={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                    className="mr-2"
                  />
                  In Stock
                </label>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition">
                  {editingpId === "new" ? "Add Product" : "Update Product"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingpId(null)}
                  className="px-4 py-2 rounded-xl bg-gray-300 text-black cursor-pointer">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 flex-wrap mt-10">
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="border-2 border-gray-500 p-1 rounded-2xl text-sm"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filter.color}
            onChange={(e) => setFilter({ ...filter, color: e.target.value })}
            className="border-2 border-gray-500 border p-1 rounded-2xl text-sm"
          >
            <option value="">All Colors</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFilter({ category: "", color: "" })}
            className="px-4 py-1 bg-gray-300 text-black rounded-2xl hover:text-gray-800 border-2 border-gray-500"
          >
            <Link>Reset</Link>
          </button>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-gray-500 p-1 rounded-3xl w-70 ml-143 bg-white pl-5"
          />
        </div>

        <div className="space-y-2">
          <div className="bg-gray-200 rounded-2xl p-4 flex items-center text-sm font-semibold text-gray-700 gap-3">
            <span className="w-6">#</span>
            <span className="w-16">Image</span>
            <span className="flex-1">Name</span>
            <span className="flex-1">Category</span>
            <span className="w-24">Price</span>
            <span className="w-16">Rating</span>
            <span className="flex-1">Sizes</span>
            <span className="w-16">Stock</span>
            <span className="w-40">Actions</span>
          </div>

          {filteredProducts.map((p, i) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between hover:shadow-md hover:bg-gray-50 transition gap-3"
            >
              <span className="w-6 text-gray-600">{i + 1}</span>
              {p.image?.[0] && (
                <img src={p.image[0]} alt={p.name} className="h-12 w-16 object-cover rounded" />
              )}
              <span className="flex-1 text-gray-700">{p.name}</span>
              <span className="flex-1 text-gray-700">{p.category}</span>
              <span className="w-24 text-gray-700">₹{p.price}</span>
              <span className="w-16 text-gray-700">{p.rating}</span>
              <span className="flex-1 text-gray-700">{p.sizes?.join(", ")}</span>
              <span className="w-16 text-gray-700">{p.inStock ? "In" : "Out"}</span>
              <div className="w-40 flex gap-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="flex-1 px-2 py-1 bg-black text-white rounded-lg hover:bg-gray-700 text-sm cursor-pointer">Edit</button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
