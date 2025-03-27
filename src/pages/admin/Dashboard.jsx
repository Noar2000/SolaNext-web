import React, { useEffect, useState } from "react";
import { getOrdersAdmin } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { numberFormat } from "../../utils/number";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // สำหรับการใช้ DatePicker
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Register the necessary chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TableOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null); // เก็บวันที่ที่เลือก

  useEffect(() => {
    handleGetOrder(token);
  }, [token]);

  const handleGetOrder = (token) => {
    getOrdersAdmin(token)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const filterOrdersByDate = (orders, selectedDate) => {
    if (!selectedDate) return orders; // ถ้ายังไม่เลือกวันที่จะไม่กรอง
    const formattedDate = selectedDate.toLocaleDateString("en-GB"); // แปลงวันที่เป็นรูปแบบ "dd/mm/yyyy"
    
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt).toLocaleDateString("en-GB");
      return orderDate === formattedDate; // ตรวจสอบว่าเป็นวันที่เดียวกัน
    });
  };

  // คำนวณยอดรวมของคำสั่งซื้อทั้งหมดในวันที่เลือก
  const filteredOrders = filterOrdersByDate(orders, selectedDate);
  const totalOrderAmount = filteredOrders.reduce((total, order) => total + order.cartTotal, 0);

  // นับสินค้าที่ขายในวันนั้นๆ
  const getSoldProducts = (orders) => {
    const productCount = {};

    orders.forEach((order) => {
      order.products?.forEach((product) => {
        const productName = product.product.title;
        const productQuantity = product.count;

        if (productCount[productName]) {
          productCount[productName] += productQuantity;
        } else {
          productCount[productName] = productQuantity;
        }
      });
    });

    return productCount;
  };

  const soldProducts = getSoldProducts(filteredOrders);

  // ข้อมูลสำหรับกราฟ
  const chartData = {
    labels: Object.keys(soldProducts), // ใช้ชื่อสินค้าจาก soldProducts
    datasets: [
      {
        label: "จำนวนที่ขายได้",
        data: Object.values(soldProducts), // ใช้จำนวนสินค้าที่ขายได้
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard