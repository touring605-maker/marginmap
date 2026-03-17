import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@workspace/replit-auth-web";
import {
  LayoutDashboard,
  Briefcase,
  Network,
  LogOut,
  Building2,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isCanvasPage = location === "/canvas";

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Business Cases", href: "/cases", icon: Briefcase },
    { name: "Value Map", href: "/canvas", icon: Network },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#131568] border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          <span className="font-display font-bold text-xl text-white tracking-tight">MarginMap</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white/70 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className={`
              fixed md:sticky top-0 left-0 z-40
              w-72 h-screen bg-[#131568] border-r border-white/10
              flex flex-col shadow-2xl md:shadow-none
            `}
          >
            <div className="p-6 hidden md:flex items-center gap-3 border-b border-white/10">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-md" />
              <span className="font-display font-bold text-2xl text-white tracking-tight">MarginMap</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 px-2">Main Menu</div>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${isActive
                        ? "bg-white/15 text-white font-semibold"
                        : "text-white/60 hover:bg-white/10 hover:text-white"}
                    `}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-white/50"}`} />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/8 border border-white/10">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-white/20" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">
                    {user?.firstName?.[0] || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-white/50 flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3" /> Acme Corp
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {isCanvasPage ? (
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-6xl mx-auto h-full"
            >
              {children}
            </motion.div>
          </div>
        )}
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
