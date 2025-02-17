import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar({ className }) {
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-white border-b h-18",
        className
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/" className="flex items-center">
          <span className="text-3xl font-semibold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            CallbackAI
          </span>
        </a>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl px-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for clients"
            className="w-full rounded-md border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-md outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
    </nav>
  );
}
