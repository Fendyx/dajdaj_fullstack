// components/ProductsPage.jsx
import Card, { CardHeader, CardContent, CardTitle } from "./ui/Card";
import Button from "./ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";

export default function ProductsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product catalog and inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Total Ordered</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>PRD-001</TableCell>
                <TableCell>Product A</TableCell>
                <TableCell>10</TableCell>
                <TableCell>$199</TableCell>
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
