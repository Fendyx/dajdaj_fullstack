// components/OrdersPage.jsx
import { useState } from "react";
import Card, { CardHeader, CardContent, CardTitle } from "./ui/Card";
import Badge from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";
import Button from "./ui/Button";

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = ["all", "shipping", "canceled", "delivered"];

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
          <div className="tabs">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "secondary" : "ghost"}
                className="tab-btn"
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>ORD-001</TableCell>
                <TableCell>user@example.com</TableCell>
                <TableCell>Product A</TableCell>
                <TableCell><Badge className="bg-gray">Shipping</Badge></TableCell>
                <TableCell>2025-01-01</TableCell>
                <TableCell>$999</TableCell>
              </TableRow>
              {/* Другие строки можно добавлять позже */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
