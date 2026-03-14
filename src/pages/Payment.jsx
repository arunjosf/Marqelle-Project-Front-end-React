import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { context } from "../App";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom"; 

import {
  CreditCard,
  Banknote,
  Landmark,
  Gift,
  Wallet,
} from "lucide-react";

export default function Payment() {
  const { user, cart, setCart } = useContext(context);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate(); 

  const methods = [
    {
      title: "PAY BY ANY UPI APP",
      label: "UPI",
      img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/2560px-UPI-Logo-vector.svg.png",
    },
    {
      title: "CREDIT/DEBIT CARD",
      label: "CARD",
      icon: <CreditCard className="w-6 h-6 text-gray-900" />,
    },
    {
      title: "NETBANKING",
      label: "NETBANKING",
      icon: <Landmark className="w-6 h-6 text-gray-900" />,
    },
    {
      title: "RUPAY",
      label: "RUPAY",
      icon: <Wallet className="w-6 h-6 text-gray-900" />,
    },
    {
      title: "GIFT CARD",
      label: "GIFT CARD",
      icon: <Gift className="w-6 h-6 text-gray-900" />,
    },
    {
      title: "CASH ON DELIVERY",
      label: "CASH",
      icon: <Banknote className="w-6 h-6 text-gray-900" />,
    },
  ];

  useEffect(() => {
  if (!user) return;
  axios.get(`http://localhost:5000/cart?userId=${user.id}`)
    .then(res => setCart(res.data))
    .catch(err => console.error("Cart fetch error:", err));
}, [user, setCart]);


  const handleConfirm = async () => {
  if (!selected) {
    toast.error("Please select a payment method first!", {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111",
        border: "1px solid #ddd",
        fontWeight: "normal",
      },
      iconTheme: {
        primary: "#111",
        secondary: "#fff",
      },
    });
    return;
  }

  try {
    if (!user || !cart || cart.length === 0) {
      toast.error("No user or cart found!", {
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#111",
          border: "1px solid #ddd",
          fontWeight: "normal",
        },
      });
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = {
      userId: user.id,
      items: cart,
      total,
      date: new Date().toISOString(), 
      paymentMethod: selected,
      status: "Pending"
    };

    await axios.post("http://localhost:5000/orders", newOrder);
    await Promise.all(cart.map(item => axios.delete(`http://localhost:5000/cart/${item.id}`)));
    setCart([]);

    toast.success("Payment successful! Order placed", {
      duration: 3000,
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111",
        border: "1px solid #ddd",
        fontWeight: "normal",
        fontSize: "15px",
        padding: "12px 18px",
      },
      iconTheme: {
        primary: "black",
        secondary: "#fff",
      },
    });

    setTimeout(() => {
      navigate("/profile");
    }, 3200);

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while processing payment!", {
      style: {
        borderRadius: "10px",
        background: "#fff",
        color: "#111",
        border: "1px solid #ddd",
        fontWeight: "normal",
      },
    });
  }
};


  return (
    <div className="min-h-screen bg-white px-4 py-10">
      <h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:ml-56 mt-8 ml-9">
        Marqelle.
      </h2>
      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-[70%] mx-auto mt-5 md:mt-7" />

      <div className="bg-[#FFF4E5] border border-[#FFD9A1] text-[#714B00] text-sm text-center py-3 mb-8 max-w-5xl mx-auto rounded mt-10">
        Please note that only cards that use 3D Secure are accepted. Contact your bank to activate it or for further instructions.
      </div>

      <div className="max-w-5xl mx-auto">
        <h2 className="text-base font-semibold tracking-wide mb-6">
          CHOOSE A PAYMENT METHOD
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {methods.map((method) => (
            <div
              key={method.title}
              onClick={() => setSelected(method.label)}
              className={`cursor-pointer border rounded-md flex flex-col justify-center items-center py-5 text-center transition-all duration-200 
              ${
                selected === method.label
                  ? "border-black bg-gray-100"
                  : "border-gray-400 hover:border-black"
              }`}
            >
              {method.img ? (
                <img
                  src={method.img}
                  alt={method.label}
                  className="w-16 mb-2 object-contain"
                />
              ) : (
                <span className="text-2xl mb-2">{method.icon}</span>
              )}
              <p className="font-medium text-sm">{method.label}</p>
              <p className="text-xs mt-1 text-gray-600">{method.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center md:justify-end max-w-5xl mx-auto">
        <button
          onClick={handleConfirm}
          className="mt-12 w-full sm:w-60 py-3 text-white rounded-lg hover:bg-gray-800 border-2 border-gray-900 bg-black transition"
        >
          Confirm Your Order
        </button>
      </div>
    </div>
  );
}

