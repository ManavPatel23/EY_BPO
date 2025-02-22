import React, { useState, useContext } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Settings,
  FileText,
  CheckCircle,
  PlusCircle,
  LogIn,
  PersonStanding,
} from "lucide-react";
import { UserContext } from "./context/userContext";
import Cookies from "js-cookie";
import { cn } from "./lib/utils";

export function Sidebar({ className }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, setUser, setIsAuthen } = useContext(UserContext);
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleLogout = (e) => {
    e.preventDefault();
    setUser(null);
    setIsAuthen(false);
    Cookies.remove("token");
  };

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        "group flex z-10 h-screen flex-col border-r bg-background px-3 py-4 transition-all duration-300",
        isExpanded ? "w-[240px]" : "w-[70px]",
        className
      )}
    >
      <button
        onClick={toggleSidebar}
        className="mb-8 flex items-center justify-center rounded-lg bg-purple-600 p-3 text-white hover:bg-purple-700"
        aria-expanded={isExpanded}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Navigation Items */}
      <nav className="flex flex-1 flex-col gap-2">
        <NavItem
          to="/claim"
          icon={PlusCircle}
          label="Apply for Claim"
          isExpanded={isExpanded}
        />
        <NavItem
          to="/all-claims"
          icon={CheckCircle}
          label="Check Claim Status"
          isExpanded={isExpanded}
        />
        {!user && (
          <>
            <NavItem
              to="/hosp/login"
              icon={LogIn}
              label="Login"
              isExpanded={isExpanded}
            />
            <NavItem
              to="/hosp/register"
              icon={PersonStanding}
              label="Register"
              isExpanded={isExpanded}
            />
          </>
        )}

        {user && (
          <>
            <button
              onClick={handleLogout}
              className={cn(
                "group flex w-full items-center rounded-lg p-3 text-red-500 transition-colors hover:bg-red-50"
              )}
            >
              <LogOut className="h-6 w-6" />
              {isExpanded && (
                <span className="ml-2 text-base font-medium flex-1">
                  Logout
                </span>
              )}
            </button>
          </>
        )}
      </nav>

      {/* Profile Section */}
      <div className="border-t pt-4">
        <Link to="/profile">
          <div
            className={cn(
              "group flex items-center rounded-full p-4 text-gray-800 transition-colors",
              "cursor-pointer bg-purple-500",
              !isExpanded && "bg-transparent p-0 hover:bg-transparent"
            )}
          >
            {user?.avatar ? (
              <div className="h-24 w-20 rounded-full overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user?.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-purple-700">
                  {getInitials(user?.name)}
                </span>
              </div>
            )}
            {isExpanded && (
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-base font-semibold text-white truncate">
                  {user?.name}
                </p>
                <p className="text-sm text-purple-200 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </Link>
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          isExpanded={isExpanded}
        />
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, count, isExpanded, className, to }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to}>
      <button
        className={cn(
          "group flex w-full items-center rounded-lg p-3 text-gray-700 transition-colors hover:bg-purple-50",
          isActive && "bg-purple-100 text-purple-600",
          className
        )}
        title={!isExpanded ? label : undefined}
      >
        <Icon className="h-6 w-6" />
        {isExpanded && (
          <span className="ml-2 text-base font-medium flex-1">{label}</span>
        )}
        {count && isExpanded && (
          <span className="ml-auto rounded-full bg-purple-100 px-2 py-0.5 text-sm font-medium text-purple-600">
            {count}
          </span>
        )}
      </button>
    </Link>
  );
}
