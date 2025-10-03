import Avatar, { AvatarFallback, AvatarImage } from "./ui/Avatar";
import Dropdown from "./ui/Dropdown";

export default function Header() {
  return (
    <header className="header">
      <h1>Dashboard</h1>
      <Dropdown
        triggerContent={
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <span>Admin</span>
          </div>
        }
      >
        <div>Profile Settings</div>
        <div>Logout</div>
      </Dropdown>
    </header>
  );
}
