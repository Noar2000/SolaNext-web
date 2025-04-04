import React, { useEffect, useState } from "react";
import { getOrdersAdmin, changeOrderStatus } from "../../api/admin";
import useEcomStore from "../../store/ecom-store";
import { toast } from "react-toastify";
import { numberFormat } from "../../utils/number";
import { dateFormat } from "../../utils/dateformat";

const TableOrders = () => {
  const token = useEcomStore((state) => state.token);
  const [orders, setOrders] = useState([]);

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

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Management</h2>
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
            {orders?.map((item, index) => (
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
