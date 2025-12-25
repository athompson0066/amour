
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
  onConsult: () => void;
}

const Hero: React.FC<HeroProps> = ({ onBrowse, onConsult }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  
  // Parallax effects
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 rounded-full blur-[120px] animate-blob mix-blend-multiply"></div>
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-200/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] bg-amber-100/40 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
      </div>

      <motion.div 
        style={{ opacity, y: yText }}
        className="relative z-10 max-w-5xl mx-auto px-4 text-center"
      >
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
        >
            <div className="glass px-4 py-1.5 rounded-full flex items-center space-x-2 border border-white/60 shadow-sm">
                <Sparkles className="text-rose-500 w-4 h-4" />
                <span className="text-xs font-bold tracking-wide text-rose-800 uppercase">The Future of Relationships</span>
            </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, type: "spring" }}
          className="text-6xl md:text-8xl font-serif font-extrabold tracking-tight mb-8 leading-tight text-slate-900"
        >
          Master the Art of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-purple-500 to-rose-500 animate-pulse">Connection.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed font-light"
        >
          Explore a curated universe of courses, expert AI coaching, and stories designed to deepen your bonds.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={onBrowse}
            className="group relative px-8 py-4 bg-rose-600 text-white rounded-full font-bold text-lg shadow-lg shadow-rose-300 hover:shadow-rose-400 hover:-translate-y-1 transition-all overflow-hidden w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center justify-center">
                Start Reading <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          
          <button 
            onClick={onConsult}
            className="px-8 py-4 glass text-slate-700 rounded-full font-bold text-lg hover:bg-white/80 hover:-translate-y-1 transition-all w-full sm:w-auto"
          >
            Consult AI Expert
          </button>
        </motion.div>
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-24 h-24 bg-white/40 backdrop-blur-md rounded-2xl shadow-xl animate-float hidden lg:block border border-white/50"></div>
          <div className="absolute bottom-[20%] right-[10%] w-32 h-32 bg-white/40 backdrop-blur-md rounded-full shadow-xl animate-float animation-delay-2000 hidden lg:block border border-white/50"></div>
      </motion.div>
    </div>
  );
};

export default Hero;
