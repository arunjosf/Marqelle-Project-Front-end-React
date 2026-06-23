
import { useNavigate, Link } from "react-router-dom";
import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { context } from "../App";
import { Bookmark } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();
  const { products, setProducts, user, wishlist, setWishlist } = useContext(context);
  const [filledHearts, setFilledHearts] = useState({});
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
  return sessionStorage.getItem("hasVisitedHome") ? false : true;

});
const nextSectionRef = useRef(null);
const videoRef = useRef(null);
// const PRODUCTS_URL = "https://localhost:7177/api/userproducts";
// const WISHLIST_URL = "https://localhost:7177/api/userwishlist";

const PRODUCTS_URL = "https://marqelle-net-ecommerce-project-1.onrender.com/api/userproducts";
const WISHLIST_URL = "https://marqelle-net-ecommerce-project-1.onrender.com/api/userwishlist";

useEffect(() => {
  if (isFirstLoad) {
    sessionStorage.setItem("hasVisitedHome", "true");
    const timer = setTimeout(() => setIsFirstLoad(false), 0);
    return () => clearTimeout(timer);
  }
}, [isFirstLoad]);

  useEffect(() => {
    axios
      .get(`${PRODUCTS_URL}/all`, {withCredentials: true})
      .then((res) => setProducts(res.data.data.slice(0, 6) || []))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${WISHLIST_URL}/Get`, {withCredentials: true})
      .then((res) => {
        const wishlistData = res.data.data || []
        setWishlist(wishlistData);
        const hearts = {};
        res.data.data.forEach((item) => (hearts[item.productId] = true));
        setFilledHearts(hearts);
      })
      .catch((err) => console.log(err));
  }, [user]);

  
  useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  let userScrolledAway = false;

  const handleEnded = () => {
    userScrolledAway = true;
    
    // Check if the user is still looking at the top section!
    // If they scrolled down past the first screen, don't auto-scroll.
    if (window.scrollY < window.innerHeight / 2) {
      const next = nextSectionRef.current;
      if (next) {
        const top = next.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: "smooth" });
      }
    }
  };

  video.addEventListener("ended", handleEnded);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && userScrolledAway) {
          userScrolledAway = false;
          video.currentTime = 0;
          video.play();
        }
      });
    },
    { threshold: 0.5 }
  );

  observer.observe(video);

  return () => {
    video.removeEventListener("ended", handleEnded);
    observer.unobserve(video);
  };
}, []);

  const toggleHeart = async (prod) => {
    if (!user) {
      toast.error("Please login to add wishlist items.", {
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
    const isFilled = filledHearts[prod.id];

      try {
  if (isFilled) {
    await axios.delete(`${WISHLIST_URL}/Delete?productId=${prod.id}`, {
      withCredentials: true,
    });
    setWishlist((prev) => prev.filter((w) => w.productId !== prod.id));
  } else {
    const res = await axios.post(`${WISHLIST_URL}/add?productId=${prod.id}`, {}, {
      withCredentials: true,
    });
    setWishlist(res.data.data || []);
  }

  setFilledHearts((prev) => ({
    ...prev,
    [prod.id]: !isFilled,
  }));
} catch (err) {
  console.error("Wishlist toggle error:", err);
}
  };

  return (
    <>
  <div className="w-full h-[480px] md:h-[800px] overflow-hidden  relative">
  <video
   ref={videoRef}
    src="MarqelleHomevideo.mp4"
    autoPlay
    muted
    playsInline
    className="w-full h-full object-cover"
  />
   <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
    <h1 id= "logo-text" className="text-gray-200 font-serif font-light 
                   text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl 
                   leading-tight tracking-wide">
      Marqelle.
    </h1>
    <p className="typing-text mt-4 sm:mt-7 text-gray-300 text-[10px] sm:text-xs md:text-base tracking-wide max-w-[90vw] sm:max-w-none">
      <i>Designed with purpose, crafted with precision, and worn with confidence</i>
    </p>
  </div>
</div>

    <div ref={nextSectionRef} className="w-full bg-gray-300 pt-17 md:pt-25 text-center overflow-hidden ">
   <motion.div
  initial={isFirstLoad ? { opacity: 1, y: -250 } : { opacity: 1, y: 0 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: "easeOut" }}>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif font-light text-gray-900 leading-snug px-4">
          Bespoke Suits <br /> for the Modern Era!
        </h1>

        <div className="flex justify-center gap-3 mx-auto mt-5 pb-10">
          <button
            className="bg-gray-900 hover:bg-gray-700 text-white px-4 py-[7px] rounded-[20px] w-28 text-sm"
            onClick={() => navigate("/allproducts")}
          >
            Shop now
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-[7px] rounded-[20px] w-28 text-sm border-2 border-gray-900"
            onClick={() => navigate("/explore")}
          >
            Explore
          </button>
        </div>
      </motion.div>

  <motion.div
  initial={isFirstLoad ? { opacity: 1, y: 250 } : { opacity: 1, y: 0 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.9, ease: "easeOut", delay: isFirstLoad ? 0.4 : 0 }}

        className="w-full md:w-100 aspect-[3/4] sm:h-[480px] md:h-[480px] bg-cover bg-top mx-auto"
        style={{ backgroundImage: "url('home2.png')" }}
      ></motion.div>
    </div>
   

<div className="bg-gray-200 py-10 md:py-20 -mt-1 relative z-10">
  <div className="px-4">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-black leading-snug text-center">
      Luxury Redefined
    </h2>
    <p className="text-center text-sm sm:text-base leading-snug text-gray-800 mt-2">
      Rediscover the power of simplicity with timeless designs tailored
      for <br className="hidden sm:block" /> today's modern man. Subtle, sleek, and undeniably classy.
    </p>
  </div>

  <div className="w-full flex justify-center mt-10 md:mt-15 px-4">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
      {products.map((prod) => (
        <div key={prod.id} className="text-center">
          <Link to={`/productdetails/${prod.id}`}>
            <img
              src={prod.images && prod.images.length > 0 ? prod.images[0] : "/placeholder.png"}
              alt={prod.name}
              className="h-[200px] sm:h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto"
            />
          </Link>

          <div className="flex items-center justify-center gap-2 mt-2">
            <h1 className="font-light font-serif text-gray-900 text-xs sm:text-sm md:text-base lg:text-base">
              {prod.name}
            </h1>

            <button
              onClick={() => toggleHeart(prod)}
              className="hover:scale-110 transition"
            >
              <Bookmark
                size={15}
                className={`cursor-pointer transition ${
                  filledHearts[prod.id] ? "fill-black" : "text-gray-500"
                }`}
              />
            </button>
          </div>

          <h1 className="mt-1 text-gray-900 text-xs sm:text-sm md:text-base lg:text-base">
            ₹{prod.price}
          </h1>
        </div>
      ))}
    </div>
  </div>
</div>

  {/* <div className="flex flex-col md:flex-row w-full gap-0 md:gap-2 mb-2 mt-2 md:mb-2  relative z-10">
  <div className="w-full md:w-1/2 bg-gray-300 flex justify-center overflow-hidden min-h-[100px] sm:min-h-[320px]">
  <video
      src="videofinalsh.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    ></video> 


  </div>
  <div
    className="w-full md:w-1/2 h-[280px] sm:h-[280px] md:h-130 bg-cover bg-center"
    style={{ backgroundImage: "url('herovop.png')" }}></div>
</div> */}
<div className="flex flex-col md:flex-row w-full gap-[2px] md:gap-2 mb-2 mt-2 md:mb-2 relative z-10">
  
  {/* Video Section: Fixed mobile height to match the image */}
  <div className="w-full md:w-1/2 h-[250px] md:h-130 bg-gray-300 flex justify-center overflow-hidden">
    <video
      src="videofinalsh.mp4"
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
    ></video> 
  </div>

  {/* Image Section: Matched the mobile height to 250px */}
  <div
    className="w-full md:w-1/2 h-[250px] md:h-130 bg-cover bg-center"
    style={{ backgroundImage: "url('herovop.png')" }}
  ></div>

</div>
{/* <div className="w-full h-140"  style={{ backgroundImage: "url('src/assets/m3.png')" }}></div> */}

<div className="bg-gray-200 mt-0 md:mt-2 py-10 md:py-20">
  <div className="px-4">
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-black leading-snug text-center">
      Signature Identity
    </h2>
    <p className="text-center text-sm sm:text-base leading-snug text-gray-800 mt-2">
      A testament to craftsmanship and timeless elegance, reflecting  <br className="hidden sm:block" /> your distinctive individuality with confidence and class.
    </p>
  </div>

  {/* <div className="w-full flex justify-center mt-10 md:mt-15 px-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <video
        src="public/16077695-uhd_3840_2160_30fps.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="md:h-[380px] sm:h-[320px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto"
      ></video>
      <video
        src="public/7426708-hd_1080_1920_25fps.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="md:h-[380px] h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto"
      ></video>

      <video
        src="public/7266482-uhd_2160_4096_25fps.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="md:h-[380px] h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto"
      ></video>
    </div>
  </div> */}

  <div className="w-full flex justify-center mt-10 md:mt-15 px-2 sm:px-4">
  <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">

    <img
      src="Group 42.png"
      alt="img1"
      className="h-[160px] sm:h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto shadow-lg"
    />

    <img
      src="Rectangle 69png.png"
      alt="img2"
      className="h-[160px] sm:h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto shadow-lg"
    />

    <img
      src="Rectangle 8.png"
      alt="img3"
      className="h-[160px] sm:h-[280px] md:h-[350px] w-full sm:w-[250px] object-cover rounded-lg mx-auto shadow-lg"
    />

  </div>
</div>
</div>  

    </>
  );
}



