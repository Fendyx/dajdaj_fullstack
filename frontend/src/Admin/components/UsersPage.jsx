// components/UsersPage.jsx
import { useState } from "react";
import Card, { CardHeader, CardContent, CardTitle } from "./ui/Card";
import Badge from "./ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";
import Button from "./ui/Button";

export default function UsersPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Users</h1>
        <p>Manage user accounts and permissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>USR-001</TableCell>
                <TableCell>user@example.com</TableCell>
                <TableCell><Badge className="bg-blue">Customer</Badge></TableCell>
                <TableCell><Badge className="bg-green">Active</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost">Edit</Button>
                  <Button variant="ghost" className="text-red">Delete</Button>
                </TableCell>
              </TableRow>
              {/* Другие строки */}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
