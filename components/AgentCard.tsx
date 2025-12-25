import React from 'react';
import { Agent } from '../types';
import { MessageCircle, Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentCardProps {
  agent: Agent;
  onChat: (agent: Agent) => void;
  onCall: (agent: Agent) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onChat, onCall }) => {
  return (
    <motion.div 
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-rose-100/50 transition-all duration-300 border border-slate-100 overflow-hidden flex flex-col h-full group relative"
    >
      {/* Top Gradient Line - Reveals on Hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-6 flex flex-col items-center text-center flex-grow relative z-10">
        <div className="relative mb-5">
          {/* Avatar Container with glowing ring animation on hover */}
          <motion.div 
            className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-rose-100 to-slate-100 group-hover:from-rose-400 group-hover:to-purple-400 transition-colors duration-500"
            whileHover={{ scale: 1.05 }}
          >
             <div className="w-full h-full rounded-full overflow-hidden border-2 border-white relative">
                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" />
             </div>
          </motion.div>
          
          {/* Status Indicator */}
          {agent.isOnline ? (
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-[3px] border-white rounded-full flex items-center justify-center z-20 shadow-sm" title="Online Now">
               <div className="w-2 h-2 bg-white rounded-full animate-ping absolute opacity-75"></div>
               <div className="w-1.5 h-1.5 bg-white rounded-full relative z-10"></div>
            </div>
          ) : (
             <div className="absolute bottom-2 right-2 w-6 h-6 bg-slate-300 border-[3px] border-white rounded-full flex items-center justify-center z-20 shadow-sm" title="Offline"></div>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-rose-600 transition-colors">{agent.name}</h3>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-purple-600 font-bold text-xs uppercase tracking-widest mb-4">{agent.role}</p>
        
        <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-3">
          {agent.description}
        </p>

        <div className="flex flex-wrap justify-center gap-1.5 mb-2 mt-auto">
           {agent.expertise.slice(0, 3).map(exp => (
             <span key={exp} className="text-[10px] font-medium px-2.5 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100 group-hover:border-rose-100 group-hover:bg-rose-50/50 group-hover:text-rose-600 transition-colors">
               {exp}
             </span>
           ))}
        </div>
      </div>

      <div className="p-5 bg-gradient-to-b from-white to-slate-50/50 border-t border-slate-100">
         <div className="flex justify-between items-center mb-4 text-xs font-semibold text-slate-500">
             <span>Session Rate</span>
             <span className="text-slate-900 font-bold bg-white px-2 py-1 rounded shadow-sm border border-slate-100">{agent.price}</span>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChat(agent)}
                className="flex items-center justify-center space-x-2 bg-white border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl text-xs font-bold hover:border-rose-200 hover:text-rose-600 hover:shadow-md hover:shadow-rose-100/50 transition-all"
            >
                <MessageCircle size={16} />
                <span>Text Chat</span>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onCall(agent)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-rose-600 to-rose-500 text-white px-3 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-200 hover:shadow-lg hover:shadow-rose-300 transition-all"
            >
                <Phone size={16} className="fill-current" />
                <span>Call Now</span>
            </motion.button>
         </div>
      </div>
    </motion.div>
  );
};

export default AgentCard;