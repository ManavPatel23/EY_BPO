import React from "react";
import { Navbar } from "./Navbar";

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="pt-14">{children}</main>
    </div>
  );
}
