import { useEffect } from "react";
import Header from "./HeaderContent";
import Home from "./Content/Home";
import { Routes, Route } from "react-router-dom";

function Content() {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/swiper/swiper-bundle.min.js";
    script.async = true;
    script.onload = () => {
      const Swiper = (window as any).Swiper;
      if (Swiper) {
        new Swiper(".swiper-container", {
          loop: true,
          autoplay: {
            delay: 3500,
            disableOnInteraction: false,
          },
          pagination: {
            el: ".swiper-pagination",
            clickable: true,
          },
          navigation: {
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          },
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Header />

      <Routes>
        <Route path="/dashboard" element={<Home />} />
      </Routes>
    </>
  );
}

export default Content;
