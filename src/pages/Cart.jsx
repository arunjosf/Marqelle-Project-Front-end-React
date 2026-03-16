// import { useEffect, useState } from "react";
// import axios from "axios";
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// export default function Cart() {
//   const [cart, setCart] = useState([]);
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();
//   const CART_URL = "https://localhost:7177/api/usercart";

//   useEffect(() => {
//     const loggedUser = JSON.parse(localStorage.getItem("user"));
//     if (loggedUser) {
//       setUser(loggedUser);
//       fetchCart(loggedUser.id);
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   async function fetchCart(userId) {
//     try {
//       const res = await axios.get(`http://localhost:5001/cart?userId=${userId}`);
//       setCart(res.data);
//     } catch (err) {
//       console.error("Error loading cart:", err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleRemove(id) {
//     try {
//       await axios.delete(`http://localhost:5001/cart/${id}`);
//       setCart((prev) => prev.filter((item) => item.id !== id));

//       toast.success("Removed from cart", {
//         style: {
//           borderRadius: "10px",
//           background: "#fff",
//           color: "#111",
//           border: "1px solid #ddd",
//           fontWeight: "normal",
//         },
//         iconTheme: {
//           primary: "#111",
//           secondary: "#fff",
//         },
//       });
//     } catch (err) {
//       console.error("Error removing item:", err);
//       toast.error("Failed to remove item", {
//         style: {
//           borderRadius: "10px",
//           background: "#fff",
//           color: "#111",
//           border: "1px solid #ddd",
//           fontWeight: "normal",
//         },
//       });
//     }
//   }
//   async function handleQuantityChange(id, newQty) {
//     if (newQty < 1) return;
//     setCart((prev) =>
//       prev.map((item) =>
//         item.id === id ? { ...item, quantity: newQty } : item
//       )
//     );
//     try {
//       await axios.patch(`http://localhost:5001/cart/${id}`, { quantity: newQty });
//     } catch (err) {
//       console.error("Error updating quantity:", err);
//     }
//   }

//   const total = cart.reduce(
//     (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
//     0
//   );

//   if (loading) {
//     return (
//       <div className="h-screen flex justify-center items-center">
//         <p className="text-gray-600">Loading cart...</p>
//       </div>
//     );
//   }

//   if (!user) {
//     return (
//       <div className="h-screen flex flex-col justify-center items-center">
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//           You are not logged in
//         </h2>
//         <p className="text-gray-600">Please login to view your cart.</p>
//       </div>
//     );
//   }

 
//   return (
//     <div className="min-h-screen bg-gray-100 py-10 px-6 pt-15">
//       <h1 className="text-3xl font-semibold text-center mb-8">Your Cart</h1>

//       {cart.length === 0 ? (
//         <div className="flex flex-col items-center">
//           <p className="text-gray-700 text-lg">Your cart is empty.</p>
//         </div>
//       ) : (
//         <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
//           <div className="flex flex-col gap-6">
//             {cart.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
//               >
//                 <Link to={`/productdetails/${item.productId}`}>
//                   <div className="flex items-center gap-4">
//                     <img
//                       src={Array.isArray(item.image) ? item.image[0] : item.image}
//                       alt={item.name}
//                       className="w-32 h-32 object-cover rounded-lg"
//                     />
//                     <div>
//                       <h2 className="text-lg font-medium text-gray-900">
//                         {item.name}
//                       </h2>
//                       <p className="text-gray-800 font-semibold">₹{item.price}</p>
//                     </div>
//                   </div>
//                 </Link>

//                 <div className="flex items-center gap-3 mt-4 md:mt-0">
//                   <div className="flex items-center border rounded-lg px-3 py-1">
//                     <button
//                       onClick={() =>
//                         handleQuantityChange(item.id, (item.quantity || 1) - 1)
//                       }
//                       className="px-2 text-lg text-gray-700 hover:text-black"
//                     >
//                       −
//                     </button>
//                     <span className="px-3 text-gray-800 text-sm font-medium">
//                       {item.quantity || 1}
//                     </span>
//                     <button
//                       onClick={() =>
//                         handleQuantityChange(item.id, (item.quantity || 1) + 1)
//                       }
//                       className="px-2 text-lg text-gray-700 hover:text-black"
//                     >
//                       +
//                     </button>
//                   </div>

                 
//                   <button
//                     onClick={() => handleRemove(item.id)}
//                     className="text-gray-700 hover:underline"
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="mt-8 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-gray-800">
//               Total: ₹{total}
//             </h2>
//             <button
//               className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
//               onClick={() => navigate("/payment")}>
//               Checkout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { context } from "../App";
 
const CART_URL = "https://localhost:7177/api/usercart";
 
export default function Cart() {
  const { cart, setCart, user } = useContext(context);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    axios
      .get(`${CART_URL}/Cartitems`, { withCredentials: true })
      .then((res) => {
        setCart(res.data.data || []);
      })
      .catch((err) => console.error("Error loading cart:", err))
      .finally(() => setLoading(false));
  }, [user]);
 
  async function handleRemove(cartId) {
    try {
      await axios.delete(`${CART_URL}/remove/${cartId}`, { withCredentials: true });
      setCart((prev) => prev.filter((item) => item.cartId !== cartId));
 
      toast.success("Removed from cart", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
        iconTheme: { primary: "#111", secondary: "#fff" },
      });
    } catch (err) {
      console.error("Error removing item:", err);
      toast.error("Failed to remove item", {
        style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
      });
    }
  }
 
  async function handleQuantityChange(cartId, newQty) {
    if (newQty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQty } : item
      )
    );
    try {
      await axios.put(`${CART_URL}/updateQuantity/${cartId}?quantity=${newQty}`, {}, { withCredentials: true });
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  }
 
  const total = cart.reduce(
    (acc, item) => acc + (item.productPrice || 0) * (item.quantity || 1),
    0
  );
 
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-gray-600">Loading cart...</p>
      </div>
    );
  }
 
  if (!user) {
    return (
      <div className="h-screen flex flex-col justify-center items-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          You are not logged in
        </h2>
        <p className="text-gray-600">Please login to view your cart.</p>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 pt-15">
      <h1 className="text-3xl font-semibold text-center mb-8">Your Cart</h1>
 
      {cart.length === 0 ? (
        <div className="flex flex-col items-center">
          <p className="text-gray-700 text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
          <div className="flex flex-col gap-6">
            {cart.map((item) => (
              <div
                key={item.cartId}
                className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
              >
                <Link to={`/productdetails/${item.productId}`}>
                  <div className="flex items-center gap-4">
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h2 className="text-lg font-medium text-gray-900">
                        {item.productName}
                      </h2>
                      <p className="text-gray-500 text-sm">Size: {item.size}</p>
                      <p className="text-gray-800 font-semibold">₹{item.productPrice}</p>
                      {item.stockWarning && (
                        <p className="text-orange-500 text-xs">{item.stockWarning}</p>
                      )}
                      {item.isOutOfStock && (
                        <p className="text-red-500 text-xs">Out of stock</p>
                      )}
                    </div>
                  </div>
                </Link>
 
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <div className="flex items-center border rounded-lg px-3 py-1">
                    <button
                      onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) - 1)}
                      className="px-2 text-lg text-gray-700 hover:text-black">
                      −
                    </button>
                    <span className="px-3 text-gray-800 text-sm font-medium">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(item.cartId, (item.quantity || 1) + 1)}
                      className="px-2 text-lg text-gray-700 hover:text-black">
                      +
                    </button>
                  </div>
 
                  <button
                    onClick={() => handleRemove(item.cartId)}
                    className="text-gray-700 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
 
          <div className="mt-8 flex justify-between items-center">
  <h2 className="text-xl font-semibold text-gray-800">
    Total: ₹{total}
  </h2>
  <button
    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
    onClick={() => {
      const outOfStock = cart.find((item) => item.isOutOfStock);
      if (outOfStock) {
        toast.error(`"${outOfStock.productName}" is out of stock. Please remove it to continue.`, {
          style: { borderRadius: "10px", background: "#fff", color: "#111", border: "1px solid #ddd", fontWeight: "normal" },
        });
        return;
      }
      navigate("/payment");
    }}>
    Checkout
  </button>
</div>
        </div>
      )}
    </div>
  );
}
