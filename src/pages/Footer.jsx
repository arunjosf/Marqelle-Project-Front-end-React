
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Footer() {

    const location = useLocation();

  const footerBg = location.pathname === "/home" || location.pathname === "/about" ? "bg-gray-200" : "bg-white";
 
  return (
    <>
    <footer className={`${footerBg} text-gray-300 pt-10`}>
        <hr className="border-t border-gray-400 w-full max-w-5xl mx-auto pt-10"/>

      {/* Top section: 4 link columns */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-5 gap-8 sm:gap-4">

        <div>
          <h3 className="text-sm font-semibold text-black mb-3">Quick Links</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <Link className="block hover:text-gray-500" to={"/home"}>Home</Link>
            <Link className="block hover:text-gray-500" to={"/allproducts"}>Shop</Link>
            <Link className="block hover:text-gray-500" to={"/explore"}>Explore</Link>
            <Link className="block hover:text-gray-500" to={"/allproducts?category=Formal"}>Formal</Link>
            <Link className="block hover:text-gray-500" to={"/allproducts?category=Casual"}>Casual</Link>
            </div>
        </div>

         <div>
          <h3 className="text-sm font-semibold text-black mb-3">Customer</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <Link className="block hover:text-gray-500">Shipping policy</Link>
            <Link className="block hover:text-gray-500">Returns &amp; Refunds</Link>
            <Link className="block hover:text-gray-500">Privacy Policy</Link>
            <Link className="block hover:text-gray-500">Terms of Service</Link>
            </div>
        </div>

         <div>
          <h3 className="text-sm font-semibold text-black mb-3">Address</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <Link className="block hover:text-gray-500 leading-loose">Marqelle,<br /> Bandra West,<br /> Mumbai, <br />MH 400050</Link>
            </div>
        </div>

         <div>
          <h3 className="text-sm font-semibold text-black mb-3">Help</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <Link className="block hover:text-gray-500">Delivery</Link>
            <Link className="block hover:text-gray-500">Returns</Link>
            <Link className="block hover:text-gray-500">FAQs</Link>
            <Link className="block hover:text-gray-500">Contact US</Link>
            </div>
        </div>

      <div>
          <h3 className="text-sm font-semibold text-black mb-3">Social</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <Link className="block hover:text-gray-500">Instagram</Link>
            <Link className="block hover:text-gray-500">Twitter</Link>
            <Link className="block hover:text-gray-500">Facebook</Link>
            <Link className="block hover:text-gray-500">Youtube</Link>
          </div>
        </div>  
      </div>

      {/* Bottom section: Brand + Social */}
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-start gap-8 mt-10">

        <div className="w-full sm:w-1/2">
          <h2 id="logo-text" className="text-2xl font-bold text-black">Marqelle.</h2>
          <p className="mt-3 text-sm text-gray-700 leading-loose">
            Your one-stop shop for quality products and exclusive deals.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-400 mt-8 pt-4 text-center text-sm text-gray-700 max-w-5xl mx-auto pb-8">
        ©Marqelle. All rights reserved.
      </div>
    </footer>
</>
    )
}
