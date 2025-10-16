import Card, { CardContent, CardHeader, CardTitle } from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import Avatar, { AvatarFallback } from "./ui/Avatar";

import {
  useGetAdminsQuery,
  useFindUserByEmailQuery,
  usePromoteUserToAdminMutation,
} from "../../slices/adminUsersApi";
import { useState } from "react";

export default function AdminsPage() {
  const { data: admins = [] } = useGetAdminsQuery();
  const [email, setEmail] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const { data: foundUser, error: searchError, isFetching } = useFindUserByEmailQuery(searchEmail, {
    skip: !searchEmail,
  });
  const [promoteUser] = usePromoteUserToAdminMutation();

  const handleSearch = () => {
    setSearchEmail(email.trim());
  };

  const handlePromote = async () => {
    if (foundUser?._id) {
      await promoteUser(foundUser._id);
      setSearchEmail(""); // очистить после назначения
      setEmail("");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Admins</h1>
        <p>Manage administrator accounts and permissions</p>
      </div>

      <div className="grid">
        {admins.map((admin) => (
          <Card key={admin._id}>
            <CardContent>
              <div className="admin-card">
                <Avatar>
                  <AvatarFallback>{admin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3>{admin.email}</h3>
                  <Badge className={admin.role === "superadmin" ? "bg-red" : "bg-blue"}>
                    {admin.role}
                  </Badge>
                  <p>Joined {new Date(admin.registrationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Button variant="outline">Edit</Button>
                  <Button variant="ghost" className="text-red">Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent>
          <div className="add-admin">
            <input
              type="email"
              placeholder="Enter user email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {isFetching && <p>Searching...</p>}
          {searchError && <p>User not found</p>}
          {foundUser && (
            <div className="found-user">
              <p><strong>{foundUser.name}</strong> ({foundUser.email})</p>
              <p>Role: {foundUser.role}</p>
              <p>Joined: {new Date(foundUser.registrationDate).toLocaleDateString()}</p>
              {foundUser.role === "admin" || foundUser.role === "superadmin" ? (
                <Badge>Already Admin</Badge>
              ) : (
                <Button onClick={handlePromote}>Promote to Admin</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

