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
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-semibold text-gray-700 mb-4 text-center">Dashboard: Order Management</h2>
      
      {/* Date Picker for selecting a date */}
      <div className="mb-6">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)} // เปลี่ยนวันที่ที่เลือก
          dateFormat="dd/MM/yyyy"
          className="border border-gray-300 rounded-md px-3 py-2"
          placeholderText="Select a date"
        />
      </div>
      
      {/* Dashboard Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-blue-700">Total Orders</h3>
          <p className="text-xl font-semibold text-blue-900">{filteredOrders.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-green-700">Completed Orders</h3>
          <p className="text-xl font-semibold text-green-900">{filteredOrders.filter(order => order.orderStatus === "Completed").length}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-red-700">Cancelled Orders</h3>
          <p className="text-xl font-semibold text-red-900">{filteredOrders.filter(order => order.orderStatus === "Cancelled").length}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-yellow-700">Total Amount</h3>
          <p className="text-xl font-semibold text-yellow-900">{numberFormat(totalOrderAmount)}</p>
        </div>
      </div>

      {/* Sold Products Graph */}
      <div className="bg-gray-50 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-700">Sold Products on {selectedDate ? selectedDate.toLocaleDateString("en-GB") : "Select a Date"}</h3>
        <Bar data={chartData} options={{ responsive: true }} />
      </div>

      {/* Order Table Section - Show orders based on selected date */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <p className="text-lg font-medium text-gray-700">Total Revenue from Orders</p>
        <p className="text-xl font-semibold text-gray-900">{numberFormat(totalOrderAmount)}</p>
      </div>
    </div>
  );
};

export default TableOrders;
