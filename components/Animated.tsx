
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, type Variants } from 'framer-motion';

// For full width headers (like Article View)
interface ParallaxHeaderProps {
  imageUrl: string;
  children?: React.ReactNode;
  height?: string;
}

export const ParallaxHeader: React.FC<ParallaxHeaderProps> = ({ imageUrl, children, height = "60vh" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <div ref={ref} className="relative overflow-hidden w-full" style={{ height }}>
             <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-[120%]">
                 <img src={imageUrl} alt="Background" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent z-10" />
             </motion.div>
             <div className="relative z-20 h-full">
                 {children}
             </div>
        </div>
    );
};

// Generic Fade Up
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Stagger Container for Grids
interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerGrid: React.FC<StaggerGridProps> = ({ children, className = "" }) => {
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };
    
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    );
};

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className = "" }) => {
    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
    };

    return (
        <motion.div variants={item} className={className}>
            {children}
        </motion.div>
    );
};
