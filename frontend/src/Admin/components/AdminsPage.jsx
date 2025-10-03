// components/AdminsPage.jsx
import Card, { CardContent, CardHeader, CardTitle } from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Avatar, { AvatarFallback, AvatarImage } from "./ui/Avatar";

export default function AdminsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Admins</h1>
        <p>Manage administrator accounts and permissions</p>
      </div>

      <div className="grid">
        <Card>
          <CardContent>
            <div className="admin-card">
              <Avatar><AvatarFallback>AD</AvatarFallback></Avatar>
              <div>
                <div>
                  <h3>admin@example.com</h3>
                  <Badge className="bg-red">Super Admin</Badge>
                </div>
                <p>Joined 2023-01-01</p>
              </div>
              <div>
                <Button variant="outline">Edit</Button>
                <Button variant="ghost" className="text-red">Delete</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="add-admin">
            <Button>Add Admin</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
