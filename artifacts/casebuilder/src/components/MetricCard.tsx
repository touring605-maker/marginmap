import { ReactNode } from "react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  icon?: ReactNode;
  trend?: { value: string; isPositive: boolean };
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon, trend, className = "" }: MetricCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -2, scale: 1.01 }}
      className={`
        bg-white dark:bg-slate-900 rounded-2xl p-6 
        border border-slate-200 dark:border-slate-800 
        shadow-sm hover:shadow-md transition-all duration-200
        relative overflow-hidden group
        ${className}
      `}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-500" />
      
      <div className="flex justify-between items-start mb-4 relative">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        {icon && (
          <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-primary">
            {icon}
          </div>
        )}
      </div>
      
      <div className="relative">
        <div className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        
        {(subtitle || trend) && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            {trend && (
              <span className={`font-medium px-2 py-0.5 rounded-md ${
                trend.isPositive 
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" 
                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
              }`}>
                {trend.isPositive ? "+" : ""}{trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}
