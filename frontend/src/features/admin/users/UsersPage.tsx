import { useState } from "react";
import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  usePromoteUserToAdminMutation,
} from "./api/adminUsersApi";
import type { UserListItem } from "./api/adminUsersApi";
import { UserModal } from "./components/UserModal";
import "./UsersPage.css";

const ROLE_LABELS: Record<string, string> = {
  user: "User",
  admin: "Admin",
  superadmin: "Super",
};

export function UsersPage() {
  const { data: users = [], isLoading, isError } = useGetAllUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [promoteUser] = usePromoteUserToAdminMutation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this user?")) return;
    await deleteUser(id);
  };

  const handlePromote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Make this user an admin?")) return;
    await promoteUser(id);
  };

  if (isLoading) return <div className="admin-loading">Loading users...</div>;
  if (isError) return <div className="admin-error">Failed to load users</div>;

  return (
    <div className="users-page">
      <div className="users-page__header">
        <h1 className="users-page__title">Users</h1>
        <span className="users-page__count">{users.length}</span>
      </div>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>Client ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Card</th>
              <th>Registered</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="users-table__row"
                onClick={() => setSelectedUserId(user._id)}
              >
                <td>
                  <span className="users-table__mono">#{user.clientId}</span>
                </td>
                <td>
                  <span className="users-table__name">{user.name}</span>
                </td>
                <td>
                  <span className="users-table__email">{user.email}</span>
                </td>
                <td>
                  <span className="users-table__mono users-table__card">
                    {user.cardNumber || "—"}
                  </span>
                </td>
                <td>
                  <span className="users-table__date">
                    {new Date(user.registrationDate).toLocaleDateString("pl-PL")}
                  </span>
                </td>
                <td>
                  <span className={`users-table__role users-table__role--${user.role}`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="users-table__actions">
                    {user.role === "user" && (
                      <button
                        className="users-table__btn users-table__btn--promote"
                        onClick={(e) => handlePromote(e, user._id)}
                        title="Make admin"
                      >
                        ↑ Admin
                      </button>
                    )}
                    <button
                      className="users-table__btn users-table__btn--delete"
                      onClick={(e) => handleDelete(e, user._id)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUserId && (
        <UserModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </div>
  );
}