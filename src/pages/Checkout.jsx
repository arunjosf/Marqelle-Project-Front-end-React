import { useEffect, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../App";

const BASE = "https://localhost:7177/api";
const TOAST_STYLE = {
  style: {
    borderRadius: "10px",
    background: "#fff",
    color: "#111",
    border: "1px solid #ddd",
    fontWeight: "normal",
  },
};

// ── Step Bar ──────────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const steps = ["Address", "Order Summary", "Payment"];
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-0 py-3">
          {steps.map((s, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                    ${done ? "bg-black border-black text-white"
                      : active ? "bg-white border-black text-black"
                      : "bg-white border-gray-300 text-gray-300"}`}>
                    {done ? (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : idx}
                  </div>
                  <span className={`text-xs font-medium
                    ${active ? "text-black" : done ? "text-gray-400" : "text-gray-300"}`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 sm:w-14 h-px mx-2 rounded-full transition-all
                    ${step > idx ? "bg-black" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Loading Skeleton (darker) ─────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="h-7 w-32 bg-gray-400 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="flex items-center justify-center gap-0 py-5 border-b border-gray-200">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-400 animate-pulse" />
              <div className="h-3 w-14 bg-gray-400 rounded mt-1 animate-pulse" />
            </div>
            {i < 3 && <div className="w-24 h-0.5 mb-4 mx-1 bg-gray-400" />}
          </div>
        ))}
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
            <div className="h-5 w-40 bg-gray-400 rounded animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-2xl p-4 flex gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-400 mt-1 animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-32 bg-gray-400 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-40 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-300 rounded animate-pulse" />
                </div>
              </div>
            ))}
            <div className="h-11 w-full bg-gray-400 rounded-xl animate-pulse mt-2" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-3">
            <div className="h-4 w-28 bg-gray-400 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
            <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
            <div className="h-px bg-gray-200 my-1" />
            <div className="h-5 w-full bg-gray-400 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Out-of-Stock Popup ────────────────────────────────────────────────────────
function OutOfStockPopup({ items, onContinue, onCancel, allOutOfStock }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {allOutOfStock ? "No items available" : "Some items are out of stock"}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {allOutOfStock
                ? "All items in your cart are now out of stock. Please update your cart."
                : `The following item${items.length > 1 ? "s are" : " is"} no longer available. Continue without ${items.length > 1 ? "them" : "it"} or cancel.`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-6 max-h-56 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.cartId} className="flex items-center gap-3 border border-red-100 bg-red-50/50 rounded-xl px-3 py-2.5">
              <img
                src={item.productImage}
                alt={item.productName}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-100"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">Size: {item.size}</p>
                <span className="inline-block mt-1 text-xs font-medium text-red-500 bg-red-100 px-2 py-0.5 rounded-full">
                  Out of stock
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {allOutOfStock ? (
            <button
              onClick={onCancel}
              className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              Go to Cart
            </button>
          ) : (
            <>
              <button
                onClick={onContinue}
                className="w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Continue without {items.length > 1 ? "these items" : "this item"}
              </button>
              <button
                onClick={onCancel}
                className="w-full py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Address Form ──────────────────────────────────────────────────────────
// ── Address Field — defined OUTSIDE form to prevent focus loss on re-render ──
function AddressField({ label, name, value, onChange, placeholder, type = "text", half, error }) {
  return (
    <div className={half ? "" : "md:col-span-2"}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none transition-colors placeholder-gray-300
          ${error ? "border-red-400 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-black"}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// AddAddressForm: handles both new address creation and editing
function AddAddressForm({ onSaved, onCancel, showCancel, editAddress }) {
  const empty = {
    addressType: "Home", fullName: "", phoneNumber: "", email: "",
    country: "India", state: "", city: "", pincode: "",
    flatorHouseorBuildingName: "", landMark: "",
  };

  const [form, setForm] = useState(() =>
    editAddress ? {
      addressType: editAddress.addressType || "Home",
      fullName: editAddress.fullName || "",
      phoneNumber: editAddress.phoneNumber || "",
      email: editAddress.email || "",
      country: editAddress.country || "India",
      state: editAddress.state || "",
      city: editAddress.city || "",
      pincode: editAddress.pincode || "",
      flatorHouseorBuildingName: editAddress.flatorHouseorBuildingName || "",
      landMark: editAddress.landMark || "",
    } : empty
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!editAddress;

  function handleChange(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = "Full name must be at least 2 characters";
    if (!form.phoneNumber.trim() || !/^[0-9+\-\s]{7,15}$/.test(form.phoneNumber.trim()))
      e.phoneNumber = "Invalid phone number";
    if (!form.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()))
      e.email = "Invalid email address";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode.trim()))
      e.pincode = "Pincode must be 6 digits";
    if (!form.flatorHouseorBuildingName.trim())
      e.flatorHouseorBuildingName = "Flat / house / building is required";
    if (!form.landMark.trim())
      e.landMark = "Landmark is required";
    if (!form.city.trim())
      e.city = "City is required";
    if (!form.state.trim())
      e.state = "State is required";
    if (!form.country.trim())
      e.country = "Country is required";
    return e;
  }

  async function handleSave() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSaving(true);
    try {
      const params = new URLSearchParams({
        addressType: form.addressType,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        country: form.country,
        state: form.state,
        city: form.city,
        pincode: form.pincode,
        flatorHouseorBuildingName: form.flatorHouseorBuildingName,
        landMark: form.landMark,
      });

      if (isEdit) {
        // PUT — update existing address
        await axios.put(
          `${BASE}/address/update?addressId=${editAddress.addressId}&${params}`,
          {},
          { withCredentials: true }
        );
        toast.success("Address updated!", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
      } else {
        // POST — add new address
        await axios.post(`${BASE}/address/add?${params}`, {}, { withCredentials: true });
        toast.success("Address saved!", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
      }
      onSaved();
    } catch (err) {
      const backendErrors = err?.response?.data?.data;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        toast.error(backendErrors[0], TOAST_STYLE);
      } else {
        toast.error(`Failed to ${isEdit ? "update" : "save"} address. Try again.`, TOAST_STYLE);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 mt-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">{isEdit ? "Edit Address" : "New Delivery Address"}</p>
      <div className="flex gap-2 mb-4">
        {["Home", "Work"].map((t) => (
          <button
            key={t}
            onClick={() => setForm((p) => ({ ...p, addressType: t }))}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium border transition-colors
              ${form.addressType === t ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <AddressField label="Full Name *" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Arun Joseph" half error={errors.fullName} />
        <AddressField label="Phone Number *" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="9876543210" type="tel" half error={errors.phoneNumber} />
        <AddressField label="Email *" name="email" value={form.email} onChange={handleChange} placeholder="arun@email.com" type="email" half error={errors.email} />
        <AddressField label="Pincode *" name="pincode" value={form.pincode} onChange={handleChange} placeholder="682030" half error={errors.pincode} />
        <AddressField label="Flat / House / Building *" name="flatorHouseorBuildingName" value={form.flatorHouseorBuildingName} onChange={handleChange} placeholder="12B, Green Apts" error={errors.flatorHouseorBuildingName} />
        <AddressField label="Landmark *" name="landMark" value={form.landMark} onChange={handleChange} placeholder="Near City Mall" error={errors.landMark} />
        <AddressField label="City *" name="city" value={form.city} onChange={handleChange} placeholder="Kochi" half error={errors.city} />
        <AddressField label="State *" name="state" value={form.state} onChange={handleChange} placeholder="Kerala" half error={errors.state} />
        <AddressField label="Country *" name="country" value={form.country} onChange={handleChange} placeholder="India" half error={errors.country} />
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Use This Address"}
        </button>
        {showCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// ── Address Card ──────────────────────────────────────────────────────────────
function AddressCard({ address, selected, onSelect, onDelete, onEdit }) {
  const [confirming, setConfirming] = useState(false);

  function handleDeleteClick(e) {
    e.stopPropagation();
    setConfirming(true);
  }
  function handleCancelDelete(e) {
    e.stopPropagation();
    setConfirming(false);
  }
  function handleConfirmDelete(e) {
    e.stopPropagation();
    setConfirming(false);
    onDelete(address.addressId);
  }
  function handleEditClick(e) {
    e.stopPropagation();
    onEdit(address);
  }

  return (
    <div
      onClick={() => onSelect(address)}
      className={`cursor-pointer border-2 rounded-2xl p-4 transition-all
        ${selected ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400 bg-white"}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: radio + address details */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
            ${selected ? "border-black" : "border-gray-300"}`}>
            {selected && <div className="w-2 h-2 rounded-full bg-black" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">{address.fullName}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium uppercase">
                {address.addressType}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {address.flatorHouseorBuildingName}, {address.landMark}
            </p>
            <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
            <p className="text-sm text-gray-600">{address.country}</p>
            <p className="text-sm text-gray-500 mt-1">{address.phoneNumber}</p>
          </div>
        </div>

        {/* Right: edit + delete buttons */}
        <div className="flex items-center gap-3 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!confirming ? (
            <>
              <button
                onClick={handleEditClick}
                className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Remove
              </button>
            </>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <p className="text-xs text-gray-500">Remove?</p>
              <div className="flex gap-1">
                <button onClick={handleConfirmDelete}
                  className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  Yes
                </button>
                <button onClick={handleCancelDelete}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Price Summary Sidebar ─────────────────────────────────────────────────────
function PriceSummary({ checkoutData, step, onContinue }) {
  if (!checkoutData) return null;
  const count = checkoutData.products?.length ?? 0;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Price Details</h3>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        {/* Item count */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Price ({count} item{count !== 1 ? "s" : ""})</span>
          <span className="font-medium text-gray-800">₹{checkoutData.subTotal?.toLocaleString()}</span>
        </div>

        {/* Delivery */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Delivery Charges</span>
          {checkoutData.shippingCharge === 0 ? (
            <span className="text-green-600 font-semibold">FREE</span>
          ) : (
            <span className="font-medium text-gray-800">₹{checkoutData.shippingCharge}</span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-gray-200 my-1" />

        {/* Total */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Total Amount</span>
          <span className="text-lg font-bold text-gray-900">₹{checkoutData.totalAmount?.toLocaleString()}</span>
        </div>

        {/* Savings note */}
        {checkoutData.shippingCharge > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="text-green-600 text-sm">🎉</span>
            <p className="text-xs text-green-700 font-medium">
              You're saving ₹{checkoutData.shippingCharge} on delivery with this order!
            </p>
          </div>
        )}
      </div>

      {/* Continue button — only shown on step 2 */}
      {step === 2 && onContinue && (
        <div className="px-5 pb-5">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Continue to Payment
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
export default function Checkout() {
  const { user, setCart } = useContext(context);
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

// Normalize API response to camelCase regardless of server casing
  function normalizeCheckout(d) {
    return {
      products: (d.products || d.Products || []).map((p) => ({
        productId: p.productId ?? p.ProductId,
        productName: p.productName ?? p.ProductName,
        productImage: p.productImage ?? p.ProductImage,
        price: p.price ?? p.Price,
        quantity: p.quantity ?? p.Quantity,
        rating: p.rating ?? p.Rating ?? 0,
        totalPrice: p.totalPrice ?? p.TotalPrice,
      })),
      subTotal: d.subTotal ?? d.SubTotal,
      shippingCharge: d.shippingCharge ?? d.ShippingCharge,
      totalAmount: d.totalAmount ?? d.TotalAmount,
    };
  }
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null); // address being edited

  // Out-of-stock popup
  const [oosPopup, setOosPopup] = useState(false);
  const [oosItems, setOosItems] = useState([]);
  const [allOos, setAllOos] = useState(false);

  // ── Initial load ────────────────────────────────────────────────────────
  // Addresses and cart totals load independently.
  // checkout-page API (stock validation) is only called on Continue.
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadInitial();
  }, [user]);

  async function loadInitial() {
    setLoading(true);
    try {
      // Load addresses and cart totals in parallel
      const [addrRes, cartRes] = await Promise.all([
        axios.get(`${BASE}/address/user-addresses`, { withCredentials: true }),
        axios.get(`${BASE}/usercart/Cartitems`, { withCredentials: true }),
      ]);

      // Set addresses — normalize to camelCase
      const raw = addrRes.data.data || [];
      const addrs = raw.map((a) => ({
        addressId: a.addressId ?? a.AddressId,
        addressType: a.addressType ?? a.AddressType ?? "Home",
        fullName: a.fullName ?? a.FullName ?? "",
        phoneNumber: a.phoneNumber ?? a.PhoneNumber ?? "",
        email: a.email ?? a.Email ?? "",
        country: a.country ?? a.Country ?? "",
        state: a.state ?? a.State ?? "",
        city: a.city ?? a.City ?? "",
        pincode: a.pincode ?? a.Pincode ?? "",
        flatorHouseorBuildingName: a.flatorHouseorBuildingName ?? a.FlatorHouseorBuildingName ?? "",
        landMark: a.landMark ?? a.LandMark ?? "",
      }));
      setAddresses(addrs);
      if (addrs.length === 0) {
        setShowAddForm(true);
        setSelectedAddress(null);
      } else {
        const mostRecent = addrs.reduce((a, b) => (a.addressId > b.addressId ? a : b));
        setSelectedAddress(mostRecent);
        setShowAddForm(false);
      }

      // Build checkoutData from cart for price sidebar (no stock validation yet)
      const cartItems = cartRes.data.data || [];
      const subTotal = cartItems.reduce((sum, i) => sum + (i.productPrice * i.quantity), 0);
      const shippingCharge = 40;
      setCheckoutData({
        products: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          productImage: i.productImage,
          price: i.productPrice,
          quantity: i.quantity,
          totalPrice: i.productPrice * i.quantity,
        })),
        subTotal,
        shippingCharge,
        totalAmount: subTotal + shippingCharge,
      });
    } catch {
      toast.error("Failed to load checkout.", TOAST_STYLE);
    } finally {
      setLoading(false);
    }
  }

  async function loadAddresses() {
    try {
      const res = await axios.get(`${BASE}/address/user-addresses`, { withCredentials: true });
      const raw = res.data.data || [];

      // Normalize to camelCase regardless of server casing
      const addrs = raw.map((a) => ({
        addressId: a.addressId ?? a.AddressId,
        addressType: a.addressType ?? a.AddressType ?? "Home",
        fullName: a.fullName ?? a.FullName ?? "",
        phoneNumber: a.phoneNumber ?? a.PhoneNumber ?? "",
        email: a.email ?? a.Email ?? "",
        country: a.country ?? a.Country ?? "",
        state: a.state ?? a.State ?? "",
        city: a.city ?? a.City ?? "",
        pincode: a.pincode ?? a.Pincode ?? "",
        flatorHouseorBuildingName: a.flatorHouseorBuildingName ?? a.FlatorHouseorBuildingName ?? "",
        landMark: a.landMark ?? a.LandMark ?? "",
      }));

      setAddresses(addrs);
      if (addrs.length === 0) {
        setShowAddForm(true);
        setSelectedAddress(null);
      } else {
        const mostRecent = addrs.reduce((a, b) => (a.addressId > b.addressId ? a : b));
        setSelectedAddress(mostRecent);
        setShowAddForm(false);
      }
    } catch {
      toast.error("Failed to load addresses.", TOAST_STYLE);
    }
  }

  // ── Stock polling every 5 seconds ───────────────────────────────────────
  const checkStock = useCallback(async () => {
    if (oosPopup || loading) return;
    try {
      const res = await axios.get(`${BASE}/checkout/checkout-page`, { withCredentials: true });
      setCheckoutData(normalizeCheckout(res.data.data));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.Message || "";
      if (msg.toLowerCase().includes("out of stock")) {
        try {
          const cartRes = await axios.get(`${BASE}/usercart/Cartitems`, { withCredentials: true });
          const cartItems = cartRes.data.data || [];
          const oos = cartItems.filter((i) => i.isOutOfStock);
          const inStock = cartItems.filter((i) => !i.isOutOfStock);
          if (oos.length > 0) {
            setOosItems(oos);
            setAllOos(inStock.length === 0);
            setOosPopup(true);
          }
        } catch {
          // silent
        }
      }
    }
  }, [oosPopup, loading]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkStock, 5000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") checkStock();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, checkStock]);

  // ── Continue without OOS items ──────────────────────────────────────────
  async function handleOosContinue() {
    try {
      await Promise.all(
        oosItems.map((item) =>
          axios.delete(`${BASE}/usercart/remove/${item.cartId}`, { withCredentials: true })
        )
      );
      const removedIds = new Set(oosItems.map((i) => i.cartId));
      setCart((prev) => prev.filter((i) => !removedIds.has(i.cartId)));
      setOosPopup(false);
      setOosItems([]);
      const res = await axios.get(`${BASE}/checkout/checkout-page`, { withCredentials: true });
      setCheckoutData(normalizeCheckout(res.data.data));
      toast.success("Out-of-stock items removed.", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
    } catch {
      toast.error("Failed to remove items. Please go back to cart.", TOAST_STYLE);
    }
  }

  // ── Cancel popup → go to cart ───────────────────────────────────────────
  function handleOosCancel() {
    setOosPopup(false);
    navigate("/cart");
  }

  async function handleAddressSaved() {
    await loadAddresses();
    setShowAddForm(false);
    setShowAllAddresses(false);
  }

  function handleEditAddress(address) {
    setEditingAddress(address);
    setShowAddForm(true);
    setShowAllAddresses(true); // make sure expanded view is open
  }

  async function handleAddressSavedOrUpdated() {
    const wasEditing = editingAddress;
    setEditingAddress(null);
    setShowAddForm(false);
    setShowAllAddresses(false);
    // Force reload addresses and refresh selectedAddress
    try {
      const res = await axios.get(`${BASE}/address/user-addresses`, { withCredentials: true });
      const raw = res.data.data || [];
      const addrs = raw.map((a) => ({
        addressId: a.addressId ?? a.AddressId,
        addressType: a.addressType ?? a.AddressType ?? "Home",
        fullName: a.fullName ?? a.FullName ?? "",
        phoneNumber: a.phoneNumber ?? a.PhoneNumber ?? "",
        email: a.email ?? a.Email ?? "",
        country: a.country ?? a.Country ?? "",
        state: a.state ?? a.State ?? "",
        city: a.city ?? a.City ?? "",
        pincode: a.pincode ?? a.Pincode ?? "",
        flatorHouseorBuildingName: a.flatorHouseorBuildingName ?? a.FlatorHouseorBuildingName ?? "",
        landMark: a.landMark ?? a.LandMark ?? "",
      }));
      setAddresses(addrs);
      if (wasEditing) {
        // After edit, update selectedAddress with the fresh version of the same address
        const updated = addrs.find((a) => a.addressId === wasEditing.addressId);
        if (updated) setSelectedAddress(updated);
      } else {
        // After add, select the newest address
        const mostRecent = addrs.reduce((a, b) => (a.addressId > b.addressId ? a : b));
        setSelectedAddress(mostRecent);
      }
    } catch {
      toast.error("Failed to refresh addresses.", TOAST_STYLE);
    }
  }

  async function handleDeleteAddress(addressId) {
    try {
      await axios.delete(`${BASE}/address/delete?addressId=${addressId}`, { withCredentials: true });
      toast.success("Address removed", { ...TOAST_STYLE, iconTheme: { primary: "#111", secondary: "#fff" } });
      // If the deleted address was selected, clear selection
      if (selectedAddress?.addressId === addressId) {
        setSelectedAddress(null);
      }
      await loadAddresses();
    } catch {
      toast.error("Failed to remove address.", TOAST_STYLE);
    }
  }

  async function handleContinueToSummary() {
    if (!selectedAddress) {
      toast.error("Please add and select a delivery address to continue.", TOAST_STYLE);
      return;
    }
    try {
      const res = await axios.get(`${BASE}/checkout/checkout-page`, { withCredentials: true });
      const d = res.data.data;

      // Normalize to camelCase regardless of what the API returns
      const normalized = {
        products: (d.products || d.Products || []).map((p) => ({
          productId: p.productId ?? p.ProductId,
          productName: p.productName ?? p.ProductName,
          productImage: p.productImage ?? p.ProductImage,
          price: p.price ?? p.Price,
          quantity: p.quantity ?? p.Quantity,
          rating: p.rating ?? p.Rating ?? 0,
          totalPrice: p.totalPrice ?? p.TotalPrice,
        })),
        subTotal: d.subTotal ?? d.SubTotal,
        shippingCharge: d.shippingCharge ?? d.ShippingCharge,
        totalAmount: d.totalAmount ?? d.TotalAmount,
      };

      setCheckoutData(normalized);
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.Message || "Something went wrong. Please check your cart.";
      toast.error(msg, TOAST_STYLE);
      if (!msg.toLowerCase().includes("address")) {
        navigate("/cart");
      }
    }
  }

  function handleContinueToPayment() {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.", TOAST_STYLE);
      return;
    }
    if (!checkoutData) {
      toast.error("Something went wrong. Please go back and try again.", TOAST_STYLE);
      return;
    }
    navigate("/payment", { state: { addressId: selectedAddress.addressId, address: selectedAddress, checkoutData } });
  }

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gray-50/80">

      {oosPopup && (
        <OutOfStockPopup
          items={oosItems}
          onContinue={handleOosContinue}
          onCancel={handleOosCancel}
          allOutOfStock={allOos}
        />
      )}

      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 id="logo-text" className="text-2xl font-semibold text-gray-800 text-center">Marqelle</h1>
      </div>

      <StepBar step={step} />

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 flex flex-col gap-2">

          {/* ── STEP 1: Address ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Delivery Address</h2>
                {addresses.length > 0 && (
                  <button
                    onClick={() => { setShowAllAddresses((p) => !p); setShowAddForm(false); }}
                    className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showAllAddresses ? "Hide" : "Change"}
                  </button>
                )}
              </div>

              {/* No addresses — show form directly */}
              {addresses.length === 0 && (
                <AddAddressForm onSaved={handleAddressSavedOrUpdated} showCancel={false} />
              )}

              {addresses.length > 0 && (
                <>
                  {/* COLLAPSED: only selected address + small "+ Add New Address" text link */}
                  {!showAllAddresses && (
                    <div className="flex flex-col gap-3">
                      {selectedAddress && (
                        <AddressCard
                          address={selectedAddress}
                          selected={true}
                          onSelect={() => {}}
                          onDelete={handleDeleteAddress}
                          onEdit={handleEditAddress}
                        />
                      )}
                      <button
                        onClick={() => { setShowAllAddresses(true); setShowAddForm(true); }}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-black transition-colors mt-1"
                      >
                        <span className="text-base leading-none">+</span>
                        Add New Address
                      </button>
                    </div>
                  )}

                  {/* EXPANDED: all addresses + dashed add button */}
                  {showAllAddresses && (
                    <div className="flex flex-col gap-3">
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr.addressId}
                          address={addr}
                          selected={selectedAddress?.addressId === addr.addressId}
                          onSelect={(a) => {
                            setSelectedAddress(a);
                            setShowAllAddresses(false);
                            setShowAddForm(false);
                          }}
                          onDelete={handleDeleteAddress}
                          onEdit={handleEditAddress}
                        />
                      ))}

                      {!showAddForm && (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-sm text-gray-500 hover:border-black hover:text-black transition-colors"
                        >
                          <span className="text-lg font-light">+</span>
                          Add New Address
                        </button>
                      )}

                      {showAddForm && (
                        <AddAddressForm
                          onSaved={handleAddressSavedOrUpdated}
                          onCancel={() => { setShowAddForm(false); setEditingAddress(null); }}
                          showCancel={true}
                          editAddress={editingAddress}
                        />
                      )}
                    </div>
                  )}
                </>
              )}

              <button
                onClick={handleContinueToSummary}
                className="mt-6 w-full py-3 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {/* ── STEP 2: Order Summary ────────────────────────────────────── */}
          {step === 2 && (
            <>
              {/* Card 1 — Deliver To */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Deliver to</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{selectedAddress?.fullName}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wide">
                        {selectedAddress?.addressType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {selectedAddress?.flatorHouseorBuildingName}, {selectedAddress?.landMark},{" "}
                      {selectedAddress?.city}, {selectedAddress?.state} — {selectedAddress?.pincode}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">{selectedAddress?.phoneNumber}</p>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Card 2 — Order Items */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex flex-col divide-y divide-gray-50">
                  {checkoutData?.products?.map((item) => {
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + 5);
                    const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <div key={item.productId} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-28 h-28 object-cover rounded-xl flex-shrink-0 border border-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 leading-snug">{item.productName}</p>

                          {item.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                {item.rating}
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-gray-400 mt-1.5">Qty: {item.quantity}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">₹{item.price?.toLocaleString()}</p>
                          <p className="text-xs text-green-600 font-medium mt-1">
                            Delivery by {deliveryStr}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 pt-0.5">
                          <p className="text-sm font-bold text-gray-900">₹{item.totalPrice?.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <PriceSummary
            checkoutData={checkoutData}
            step={step}
            onContinue={step === 2 ? handleContinueToPayment : undefined}
          />
        </div>
      </div>
    </div>
  );
}