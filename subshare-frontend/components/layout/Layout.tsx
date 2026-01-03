"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { Menu } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showSidebar = false, showFooter = true }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A1628] via-[#0D1E35] to-[#162845]">
      <Header />
      
      <div className="flex">
        {showSidebar && <Sidebar isOpen={sidebarOpen} />}
        
        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? (sidebarOpen ? "ml-64" : "ml-0 md:ml-20") : ""
          }`}
        >
          {showSidebar && (
            <div className="sticky top-16 z-30 flex items-center justify-between border-b border-white/5 bg-[#0A1628]/95 backdrop-blur-lg px-4 py-3 lg:px-8">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-gray-300 transition-colors hover:bg-white/10 border border-white/10"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="min-h-[calc(100vh-4rem)] p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {showFooter && <Footer />}
    </div>
  );
}