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

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Business Cases", href: "/cases", icon: Briefcase },
    { name: "Dependency Canvas", href: "/canvas", icon: Network },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-border">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-display font-bold text-xl text-foreground tracking-tight">CaseBuilder</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground">
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
              w-72 h-screen bg-white dark:bg-slate-900 border-r border-border
              flex flex-col shadow-2xl md:shadow-none
            `}
          >
            <div className="p-6 hidden md:flex items-center gap-3 border-b border-border/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 p-0.5 shadow-lg shadow-primary/20">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-full h-full rounded-xl object-cover bg-white dark:bg-slate-900" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground tracking-tight">CaseBuilder</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Main Menu</div>
              {navItems.map((item) => {
                const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? "bg-primary/10 text-primary font-semibold" 
                        : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-foreground"}
                    `}>
                      <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border/50">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {user?.firstName?.[0] || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                    <Building2 className="w-3 h-3" /> Acme Corp
                  </p>
                </div>
                <button 
                  onClick={() => logout()} 
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
