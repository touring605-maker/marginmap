import { motion } from "framer-motion";
import { Network, Plus } from "lucide-react";

export default function Canvas() {
  return (
    <div className="h-full min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <div className="relative mb-8 rounded-2xl overflow-hidden shadow-2xl border border-border bg-slate-900">
          <img 
            src={`${import.meta.env.BASE_URL}images/canvas-placeholder.png`} 
            alt="Dependency Canvas Preview" 
            className="w-full h-64 object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-primary/30">
              <Network className="w-10 h-10 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Strategic Dependency Canvas</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Visualize how different business cases interact. Connect outputs to inputs to build complex portfolio models. (Coming soon)
        </p>

        <button className="px-8 py-4 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 mx-auto">
          <Plus className="w-5 h-5" /> Feature in Development
        </button>
      </motion.div>
    </div>
  );
}
