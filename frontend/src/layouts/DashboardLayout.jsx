import { useAuth } from "../context/AuthContext";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Users,
  CreditCard,
  PlusCircle,
  History,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "Employees", path: "/employees", icon: Users, roles: ["HR"] },
    {
      name: "Generate Slip",
      path: "/generate",
      icon: PlusCircle,
      roles: ["HR"],
    },
    {
      name: "Slip History",
      path: "/history",
      icon: History,
      roles: ["HR", "EMPLOYEE"],
    },
  ];

  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(user?.role),
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Hidden on mobile, fixed on desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300`}
      >
        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          PayCraft Lite
        </div>
        <nav className="mt-6 flex-1">
          {filteredMenu.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-6 py-3 hover:bg-slate-800 ${location.pathname === item.path ? "bg-blue-600" : ""}`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center w-full px-6 py-3 mt-auto hover:bg-red-600 text-red-400 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow p-4 lg:hidden flex justify-between">
          <span className="font-bold">PayCraft</span>
          <button onClick={() => setMenuOpen(!isMobileMenuOpen)}>
            <Menu />
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
