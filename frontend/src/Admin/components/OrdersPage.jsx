import { useState } from "react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "../../slices/adminApi";
import Card, { CardHeader, CardContent, CardTitle } from "./ui/Card";
import Badge from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";
import Button from "./ui/Button";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: orders = [], isLoading, error } = useGetAllOrdersQuery();
  const [updateOrderStatus] = useUpdateOrderStatusMutation();

  const tabs = ["all", "shipping", "canceled", "delivered", "paid"];
  const filteredOrders =
    activeTab === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === activeTab);

  const handleChangeStatus = (orderId, status) => {
    updateOrderStatus({ orderId, status });
  };

  if (isLoading) return <p>Loading orders...</p>;
  if (error) return <p>Error loading orders</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage and track all customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="tabs flex gap-2 mb-4">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "secondary" : "ghost"}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan="7" className="text-center">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order._id}</TableCell>
                    <TableCell>{order.userId?.email || "Unknown"}</TableCell>
                    <TableCell>
                      {order.products.map((p, i) => (
                        <div key={i}>{p.name} × {p.quantity}</div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge>{order.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.totalPrice} PLN</TableCell>
                    <TableCell>
                      <select
                        value={order.status}
                        onChange={(e) => handleChangeStatus(order._id, e.target.value)}
                      >
                        <option value="paid">Paid</option>
                        <option value="shipping">Shipping</option>
                        <option value="delivered">Delivered</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
