import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

// Import required modules
import { Pagination, Autoplay, Navigation } from "swiper/modules";

const ContentCarousel = () => {
  return (
    <div>
      <Swiper
        pagination={true}
        modules={[Pagination, Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        className="mySwiper h-80 object-cover rounded-md mb-4"
      >
        <SwiperSlide className="flex justify-center items-center">
          <img src="/c.png" alt="Custom Image" className="w-300px h-700px object-cover rounded-md" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default ContentCarousel;
