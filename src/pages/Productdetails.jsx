import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { context } from "../App";
import { Menu, X, ShoppingCart, Bookmark, Search } from "lucide-react";

export default function Productdetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, setCart, user, wishlist, setWishlist } = useContext(context);
  const [productdetails, setProductdetails] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [filledIcon, setFilledIcon] = useState({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5001/products/${id}`)
      .then((res) => setProductdetails(res.data))
      .catch((err) => console.log("Product fetch error:", err));
  }, [id]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`http://localhost:5001/wishlist?userId=${user.id}`)
      .then((res) => {
        setWishlist(res.data);
        const wish = {};
        res.data.forEach((item) => (wish[item.productId] = true));
        setFilledIcon(wish);
      })
      .catch((err) => console.log(err));
  }, [user]);

  const toggleIcon = async (prod) => {
    if (!user) {
      toast.error("Please login to add wishlist items!", {
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

    const isFilled = filledIcon[prod.id];
    try {
      if (isFilled) {
        const itemToRemove = wishlist.find(
          (w) => w.productId === prod.id && w.userId === user.id
        );
        if (itemToRemove) {
          await axios.delete(`http://localhost:5001/wishlist/${itemToRemove.id}`);
          setWishlist((prev) => prev.filter((w) => w.id !== itemToRemove.id));
        }
      } else {
        const newItem = {
          userId: user.id,
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
        };
        const res = await axios.post("http://localhost:5001/wishlist", newItem);
        setWishlist((prev) => [...prev, res.data]);
      }

      setFilledIcon((prev) => ({
        ...prev,
        [prod.id]: !isFilled,
      }));
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  const handleAddToCart = async () => {
  if (!selectedSize) {
    toast.error("Please select a size before adding to cart!", {
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

  if (!user) {
    toast.error("Please login to add items to cart!", {
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
    const res = await axios.get(
      `http://localhost:5001/cart?userId=${user.id}&productId=${productdetails.id}&size=${selectedSize}`
    );

    if (res.data.length > 0) {
      toast("Item already in cart!", {
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

    const newCartItem = {
      userId: user.id,
      productId: productdetails.id,
      name: productdetails.name,
      price: productdetails.price,
      size: selectedSize,
      image: productdetails.image,
      quantity: 1,
    };

    await axios.post("http://localhost:5001/cart", newCartItem);

    toast.success("Added to cart", {
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
  } catch (err) {
    console.error("Error adding to cart:", err);
    toast.error("Something went wrong while adding to cart!", {
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
  }
};

  if (!productdetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-700 text-lg">Loading product details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between px-55 mt-8">
       <Link to={"/home"}><h2 className="text-4xl md:text-5xl font-semibold text-black text-left md:text-left md:ml-1 mt-8">
          Marqelle.
        </h2></Link>

        <div className="flex items-center gap-3">
          <button
            className="px-3 py-2 rounded-[15px] text-gray-900 text-sm flex items-center gap-1"
            onClick={() => navigate(user ? "/profile" : "/login")}>
            {user ? (
              <span className="text-sm font-semibold">
                <Link to={"/profile"}>Profile</Link>
              </span>
            ) : (
              <span className="text-sm font-medium">
                <Link to={"/login"}>Login</Link>
              </span>
            )}
          </button>

          <button className="px-2 py-2 rounded-[15px] text-gray-900 text-sm">
            <Link to={"/search"}>
              <Search size={17} />
            </Link>
          </button>

          <button onClick={() => navigate("/wishlist")}
  className="flex items-center px-3 text-gray-900 text-sm gap-1">
  <Bookmark size={17} />
  <span className="text-xs">{wishlist.length}</span>
</button>

          <button className="px-3 text-gray-900 text-sm">
  <Link to="/cart" className="flex items-center gap-1">
    <ShoppingCart size={17} />
    <span className="text-xs">{cart.length}</span>
  </Link>
</button>

          <div className="md:hidden flex items-center justify-center">
            <button onClick={() => setOpen(!open)}>
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <hr className="border-t border-gray-900 w-[81%] mx-5 md:w-267 mx-auto mt-5 md:mt-7" />

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 mt-10 md:mt-15 px-4 md:px-10 w-full md:w-267 mx-auto md:ml-47">
        <div className="flex-1 flex justify-center">
          <img
            src={productdetails.image?.[0]}
            alt={productdetails.name}
            className=" mx-5 h-[420px] w-[350px] sm:h-[450px] sm:w-[350px] md:h-[500px] md:w-[420px] object-cover rounded-lg shadow-lg"
          />
        </div>

        <div className="flex-1 mt-6 md:mt-0 text-left mx-5 md:text-left">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {productdetails.name}
            </h1>

            <button onClick={() => toggleIcon(productdetails)}>
              <Bookmark
                size={22}
                className={`cursor-pointer transition mt-2 ml-2 ${
                  filledIcon[productdetails.id]
                    ? "fill-black text-black"
                    : "text-gray-500"
                }`}
              />
            </button>
          </div>

          <p className="mt-4 text-gray-700 leading-relaxed sm:text-base">
            {productdetails.description}
          </p>

          <p className="mt-2 text-sm text-gray-900">
            Status: {productdetails.inStock ? "in Stock" : "out of stock"}
          </p>

          <p className="mt-3 text-lg md:text-xl font-medium text-gray-800">
            ₹{productdetails.price}
          </p>
          <p className="mt-2 text-sm text-gray-800">
            Rating: {productdetails.rating}
          </p>

          <p className="mt-6 font-medium text-gray-800">Size:</p>
          <div className="flex flex-wrap justify-start md:justify-start gap-2 mt-2">
            {productdetails.sizes?.map((size, index) => (
              <button
                key={index}
                onClick={() => setSelectedSize(size)}
                className={`px-1 py-1 border rounded-md text-sm sm:text-base transition-all duration-200 w-11 ${
                  selectedSize === size
                    ? "bg-gray-800 text-white border-gray-800"
                    : "border-gray-700 text-gray-800 hover:bg-gray-100"}`}>
                {size}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-8">
            <button
              onClick={handleAddToCart}
              className="px-6 py-2 text-white rounded-lg hover:bg-gray-800 border-2 border-gray-900 bg-black w-full sm:w-40">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-7  mt-15 md:mt-20 mb-40 place-items-center md:mx-62">
        {productdetails.image?.slice(1, 5).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={productdetails.name}
            className="h-[400px] w-[320px] sm:h-[450px] sm:w-[350px] md:h-[580px] md:w-[500px] object-cover rounded-lg shadow-lg"
          />
        ))}
      </div>
    </>
  );
}