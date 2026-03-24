import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../App";
import { CreditCard, Smartphone, Wallet, Truck } from "lucide-react";

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
                      : active ? "bg-white border-gray-600 border-2 text-black"
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

function Skeleton() {
  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="h-7 w-32 bg-gray-400 rounded-lg mx-auto animate-pulse" />
      </div>
      <StepBar step={3} />
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
            <div className="h-5 w-40 bg-gray-400 rounded animate-pulse" />
            {[1, 2].map((i) => (
              <div key={i} className="border-2 border-gray-200 rounded-2xl p-4 flex gap-3">
                <div className="w-4 h-4 rounded-full bg-gray-400 mt-1 animate-pulse flex-shrink-0" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 w-32 bg-gray-400 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentMethods({ selectedMethod, onSelect }) {
  const methods = [
    { id: "card", name: "Credit/Debit Card", icon: <CreditCard size={18} /> },
    { id: "upi", name: "UPI", icon: <Smartphone size={18} /> },
    { id: "wallet", name: "Digital Wallet", icon: <Wallet size={18} /> },
    { id: "cod", name: "Cash on Delivery", icon: <Truck size={18} /> },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Payment Method</h2>
      <div className="flex flex-col gap-2">
        {methods.map((method) => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left
              ${selectedMethod === method.id 
                ? "border-black bg-gray-50" 
                : "border-gray-200 hover:border-gray-300 bg-white"}`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
              ${selectedMethod === method.id ? "border-black" : "border-gray-300"}`}>
              {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-black" />}
            </div>
            <span className="text-lg">{method.icon}</span>
            <span className="text-sm font-medium text-gray-900">{method.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PriceSummary({ checkoutData, onPayment, isProcessing }) {
  if (!checkoutData) return null;
  const count = checkoutData.products?.length ?? 0;
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden sticky top-6">
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Price Details</h3>
      </div>

      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Price ({count} item{count !== 1 ? "s" : ""})</span>
          <span className="font-medium text-gray-800">₹{checkoutData.subTotal?.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Delivery Charges</span>
          {checkoutData.shippingCharge === 0 ? (
            <span className="text-green-600 font-semibold">FREE</span>
          ) : (
            <span className="font-medium text-gray-800">₹{checkoutData.shippingCharge}</span>
          )}
        </div>

        <div className="border-t border-dashed border-gray-200 my-1" />

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-900">Total Amount</span>
          <span className="text-lg font-bold text-gray-900">₹{checkoutData.totalAmount?.toLocaleString('en-IN')}</span>
        </div>

        {checkoutData.shippingCharge > 0 && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <p className="text-xs text-green-700 font-medium mx-auto">
              You're one more click away from this order!
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        <button
          onClick={onPayment}
          disabled={isProcessing}
          className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? "Processing..." : "Place Order"}
          {!isProcessing && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Payment() {
  const { user, setCart } = useContext(context);
  const navigate = useNavigate();
  const location = useLocation();

  const { address, addressId, checkoutData } = location.state || {};

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!addressId) {
      toast.error("Please select a delivery address", TOAST_STYLE);
      navigate("/checkout");
      return;
    }

    setLoading(false);
  }, [user, addressId, navigate]);

  async function handlePlaceOrder() {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method", TOAST_STYLE);
      return;
    }

    if (!addressId) {
      toast.error("Delivery address is required", TOAST_STYLE);
      return;
    }

    if (!checkoutData) {
      toast.error("Something went wrong. Please go back and try again.", TOAST_STYLE);
      return;
    }

    setIsProcessing(true);
    try {
      const paymentMethodMap = {
        card: "Card",
        upi: "UPI",
        wallet: "Wallet",
        cod: "COD",
      };

      const response = await axios.post(
        `${BASE}/userorder/place-order?addressId=${addressId}`,
        {
          paymentMethod: paymentMethodMap[selectedPaymentMethod] || "Card",
          totalAmount: checkoutData.totalAmount,
        },
        { withCredentials: true }
      );

      setCart([]);

      toast.success("Order placed successfully!", { 
        ...TOAST_STYLE, 
        iconTheme: { primary: "#111", secondary: "#fff" } 
      });

      navigate("/profile/orders");
    } catch (err) {
      const errorMsg = err?.response?.data?.Message || "Failed to place order. Please try again.";
      toast.error(errorMsg, TOAST_STYLE);
      console.error("Order placement error:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gray-50/80">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-800 text-center">Marqelle</h1>
      </div>

      <StepBar step={3} />

      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">

          {address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Deliver to</p>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{address?.fullName}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-semibold uppercase">
                      {address?.addressType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {address?.flatorHouseorBuildingName}, {address?.landMark},{" "}
                    {address?.city}, {address?.state} — {address?.pincode}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{address?.phoneNumber}</p>
                </div>
                <button
                  onClick={() => navigate("/checkout")}
                  className="text-xs font-semibold text-black border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <PaymentMethods selectedMethod={selectedPaymentMethod} onSelect={setSelectedPaymentMethod} />
        </div>

        <div className="lg:col-span-1">
          <PriceSummary 
            checkoutData={checkoutData}
            onPayment={handlePlaceOrder}
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}