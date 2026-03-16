import { useAuth } from "@workspace/replit-auth-web";
import { motion } from "framer-motion";
import { TrendingUp, BarChart2, ShieldCheck, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#131568]">
        <div className="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Left side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-16 lg:p-24 bg-white dark:bg-[#0d0f3a] z-10 relative overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#131568]/5 blur-3xl" />
          <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#4C7960]/5 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-[#131568] p-2 shadow-lg shadow-[#131568]/30 flex items-center justify-center">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-full h-full rounded-lg object-cover" />
            </div>
            <span className="font-display font-bold text-3xl text-[#131568] dark:text-white tracking-tight">MarginMap</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground leading-tight mb-6">
            Track every margin,<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#131568] to-[#4C7960]">map every move.</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            The professional financial modeling platform for modern finance teams. Surface product-level profitability, standardize assumptions, and drive smarter decisions.
          </p>

          <button
            onClick={() => login()}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg text-white bg-[#131568] hover:bg-[#1a1e7a] shadow-xl shadow-[#131568]/25 hover:shadow-2xl hover:shadow-[#131568]/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign in <ArrowRight className="w-5 h-5" />
          </button>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#131568]/10 flex items-center justify-center text-[#131568]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground">Margin Analysis</h3>
              <p className="text-sm text-muted-foreground">Automated NPV & IRR calcs.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#4C7960]/10 flex items-center justify-center text-[#4C7960]">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground">Visual Mapping</h3>
              <p className="text-sm text-muted-foreground">Dependency canvas included.</p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground">Secure</h3>
              <p className="text-sm text-muted-foreground">Org-scoped access control.</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block w-1/2 relative bg-[#131568]">
        <img
          src={`${import.meta.env.BASE_URL}images/login-bg.png`}
          alt="Abstract Finance Background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#131568] via-[#1a2080]/80 to-[#4C7960]/60" />

        {/* Floating glass card decorative element */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="absolute bottom-24 left-24 right-24 glass-panel rounded-2xl p-8"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="space-y-1">
              <h4 className="text-white/80 font-medium">Projected ROI</h4>
              <p className="text-3xl font-display font-bold text-white">142.5%</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-[#4C7960]/30 flex items-center justify-center border border-[#4C7960]/40">
              <TrendingUp className="w-8 h-8 text-[#80B155]" />
            </div>
          </div>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-[#4C7960] to-[#80B155] rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
