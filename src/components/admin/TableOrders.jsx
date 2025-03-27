import React, { useEffect, useState, useRef } from "react";
import { getOrdersAdmin, changeOrderStatus } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TableOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  const chartRef = useRef(null); // To hold the chart instance

  useEffect(() => {
    handleGetOrder(token);
  }, [token]);

  useEffect(() => {
    setFilteredOrders(
      orders.filter((order) =>
        order.products.some(
          (product) =>
            product.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dateFormat(order.createdAt).includes(searchTerm)
        )
      )
    );
  }, [searchTerm, orders]);

  const handleGetOrder = (token) => {
    getOrdersAdmin(token)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleChangeOrderStatus = (token, orderId, orderStatus) => {
    changeOrderStatus(token, orderId, orderStatus)
      .then((res) => {
        toast.success("Update Status Success!");
        handleGetOrder(token);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Process":
        return "bg-gray-200";
      case "Processing":
        return "bg-blue-200";
      case "Completed":
        return "bg-green-200";
      case "Cancelled":
        return "bg-red-200";
      default:
        return "bg-gray-100";
    }
  };

  // Calculate total sales for the Line and Bar chart
  const getTotalSalesByDate = () => {
    const salesByDate = {};
    filteredOrders.forEach((order) => {
      const date = dateFormat(order.createdAt);
      salesByDate[date] = (salesByDate[date] || 0) + order.cartTotal;
    });
    return salesByDate;
  };

  const getSalesByProduct = () => {
    const salesByProduct = {};
    filteredOrders.forEach((order) => {
      order.products.forEach((product) => {
        const title = product.product.title;
        const total = product.count * product.product.price;
        salesByProduct[title] = (salesByProduct[title] || 0) + total;
      });
    });
    return salesByProduct;
  };

  // Data for the line chart (Sales by Date)
  const salesByDate = getTotalSalesByDate();
  const salesDateLabels = Object.keys(salesByDate);
  const salesDateData = Object.values(salesByDate);

  // Data for the bar chart (Sales by Product)
  const salesByProduct = getSalesByProduct();
  const productLabels = Object.keys(salesByProduct);
  const productSalesData = Object.values(salesByProduct);

  const lineChartData = {
    labels: salesDateLabels,
    datasets: [
      {
        label: "ยอดขายตามวัน",
        data: salesDateData,
        borderColor: "#4BC0C0",
        backgroundColor: "#A1D1D1",
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const barChartData = {
    labels: productLabels,
    datasets: [
      {
        label: "ยอดขายตามสินค้า",
        data: productSalesData,
        backgroundColor: "#FF6384",
      },
    ],
  };

  // Cleanup function for Chart.js to destroy previous charts before re-rendering
  useEffect(() => {
    return () => {
      if (chartRef.current && chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Management</h2>
      
      {/* Search Bar */}
      <div className="mb-4 flex items-center space-x-2">
        <input
          type="text"
          className="px-4 py-2 border border-gray-300 rounded-md"
          placeholder="Search by Date or Product"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Line Chart - Sales by Date */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">ยอดขายตามวัน</h3>
        <Line ref={chartRef} data={lineChartData} />
      </div>

      {/* Bar Chart - Sales by Product */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">ยอดขายตามสินค้า</h3>
        <Bar ref={chartRef} data={barChartData} />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left border-b">
              <th className="py-2 px-4">ลำดับ</th>
              <th className="py-2 px-4">ผู้ใช้งาน</th>
              <th className="py-2 px-4">วันที่</th>
              <th className="py-2 px-4">สินค้า</th>
              <th className="py-2 px-4">รวม</th>
              <th className="py-2 px-4">สถานะ</th>
              <th className="py-2 px-4">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-4 px-4 text-center">{index + 1}</td>
                <td className="py-4 px-4">
                  <p>{item.orderedBy.email}</p>
                  <p>{item.orderedBy.address}</p>
                </td>
                <td className="py-4 px-4">{dateFormat(item.createdAt)}</td>
                <td className="py-4 px-4">
                  <ul className="space-y-1">
                    {item.products?.map((product, idx) => (
                      <li key={idx} className="text-sm text-gray-600">
                        {product.product.title}{" "}
                        <span className="text-xs text-gray-500">
                          {product.count} x {numberFormat(product.product.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="py-4 px-4">{numberFormat(item.cartTotal)}</td>
                <td className="py-4 px-4">
                  <span
                    className={`${getStatusColor(item.orderStatus)} px-2 py-1 rounded-full text-center text-sm font-semibold`}
                  >
                    {item.orderStatus}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <select
                    value={item.orderStatus}
                    onChange={(e) =>
                      handleChangeOrderStatus(token, item.id, e.target.value)
                    }
                    className="border-gray-300 bg-gray-50 py-1 px-3 rounded-md"
                  >
                    <option>Not Process</option>
                    <option>Processing</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableOrders;
