import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

const slides = [
  {
    src: "public/9563511-uhd_4096_2160_25fps.mp4",
    description: "Effortless style meets seasonal comfort in a suit made for modern work life.",
    category: "Casual",
    link: "/allproducts?category=Casual",
  },
  {
    src: "public/explore1.mp4",
    description: "A refined winter essential that delivers both comfort and a polished appearance.",
    category: "Winter",
    link: "/allproducts?category=Winter",
  },
  {
    src: "public/e3.mp4",
    description: "An expression of confidence, tailored for the modern professional.",
    category: "Formal",
    link: "/allproducts?category=Formal",
  },
];

export default function Explore() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const slideRefs = useRef([]);

  useEffect(() => {
    const observers = slideRefs.current.map((ref, i) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setFading(true);
            setTimeout(() => {
              setActiveIndex(i);
              setFading(false);
            }, 250);
          }
        },
        { threshold: 0.5 }
      );
      if (ref) observer.observe(ref);
      return observer;
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="relative">

      <div className="fixed inset-0 z-10 flex flex-col justify-center items-center text-center px-4 pointer-events-none">

        <h1
          id="logo-text"
          className="text-gray-200 font-serif font-light
                     text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
                     leading-tight tracking-wide"
        >
          Marqelle.
        </h1>

        <p
  className="mt-7 text-gray-200 text-xs md:text-base tracking-wide transition-opacity duration-300"
  style={{ opacity: fading ? 0 : 1 }}
>
  <i>{slides[activeIndex].description}</i>
</p>

<Link
  to={slides[activeIndex].link}
  className="pointer-events-auto mt-10 px-8 py-2.5 border border-white text-white text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
  style={{ opacity: fading ? 0 : 1, transition: "opacity 0.3s" }}
>
  Shop {slides[activeIndex].category}
</Link>
             

      </div>

      <div className="h-screen overflow-y-scroll snap-y snap-mandatory">
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => (slideRefs.current[i] = el)}
            className="relative w-full h-screen snap-start snap-always overflow-hidden"
          >
            <video
              src={slide.src}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            <Link
              to={slide.link}
              className="absolute inset-0 bg-black/30 "
              aria-label={`Shop ${slide.category}`}
            />

            {i < slides.length - 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 z-10">
                <span className="text-xs tracking-widest uppercase">Scroll</span>
                <svg className="w-4 h-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}