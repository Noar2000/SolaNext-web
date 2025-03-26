// rafce
import React from "react";
import { ShoppingCart } from "lucide-react";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import { motion } from "framer-motion";
import { toast } from "react-toastify"; // ✅ นำเข้า toast
import "react-toastify/dist/ReactToastify.css"; // ✅ นำเข้า CSS ของ Toast

const ProductCard = ({ item }) => {
  const actionAddtoCart = useEcomStore((state) => state.actionAddtoCart);

  // ฟังก์ชันกดปุ่มตะกร้า
  const handleAddToCart = () => {
    actionAddtoCart(item); // ✅ เพิ่มสินค้าลงตะกร้า
    toast.success(`เพิ่ม "${item.title}" ลงตะกร้าแล้ว! 🛒`, { // ✅ แจ้งเตือน
      position: "top-right",
      autoClose: 2000, // 2 วินาทีปิด
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="border rounded-md shadow-md p-2 w-48">
        <div>
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0].url}
              className="rounded-md w-full h-24 object-cover hover:scale-110 hover:duration-200"
            />
          ) : (
            <div className="w-full h-24 bg-gray-200 rounded-md text-center flex items-center justify-center shadow">
              No Image
            </div>
          )}
        </div>

        <div className="py-2">
          <p className="text-xl truncate">{item.title}</p>
          <p className="text-sm text-gray-500 truncate">{item.description}</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-bold">{numberFormat(item.price)}</span>
          <button
            onClick={handleAddToCart} // ✅ ใช้ฟังก์ชันใหม่
            className="bg-blue-500 rounded-md p-2 hover:bg-blue-700 shadow-md"
          >
            <ShoppingCart />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
