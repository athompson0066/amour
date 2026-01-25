
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleDollarSign, BarChart4, TrendingUp, Terminal, ArrowLeft, Loader2, Sparkles, CheckCircle2, ShieldAlert, Cpu, Globe, Search, RefreshCw, Save } from 'lucide-react';
import { generatePricingStrategy } from '../services/geminiService';
import { getPosts, getAgents, getAstroAgents, savePost, saveAgent } from '../services/storage';
import { Post, Agent } from '../types';
import { FadeIn, StaggerGrid, StaggerItem } from './Animated';

interface AdminPriceStrategyProps {
  onBack: () => void;
  onRefresh: () => void;
}

interface PricingProposal {
  id: string;
  proposedPrice: number;
  reasoning: string;
}

const AdminPriceStrategy: React.FC<AdminPriceStrategyProps> = ({ onBack, onRefresh }) => {
  const [items, setItems] = useState<(Post | Agent)[]>([]);
  const [proposals, setProposals] = useState<PricingProposal[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [missionLog, setMissionLog] = useState<string[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    const posts = await getPosts();
    const agents = getAgents();
    const astro = getAstroAgents();
    
    // Filter monetized items and ensure they have valid IDs
    const monetized = [...posts, ...agents, ...astro].filter(item => {
        if (!item.id) return false;
        // Fix for type narrowing: Use 'type' property unique to Post to prevent non-overlapping cast errors
        if ('type' in item) return item.isPremium;
        return item.priceValue && item.priceValue > 0;
    });
    setItems(monetized);
  };

  /**
   * Robust numeric parser that strips currency symbols and handles non-numeric strings
   */
  const safeParsePrice = (value: any): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      
      const cleaned = String(value).replace(/[^0-9.-]+/g, "");
      const parsed = parseFloat(cleaned);
      
      return isNaN(parsed) ? 0 : parsed;
  };

  const handleRunStrategy = async () => {
    if (items.length === 0) return;
    setIsAnalyzing(true);
    setProposals([]);
    setMissionLog(["Initializing Pricing Strategy Mission..."]);
    
    // Agent simulation
    await new Promise(r => setTimeout(r, 600));
    setMissionLog(prev => [...prev, "The Analyst: Identifying market competitors..."]);
    await new Promise(r => setTimeout(r, 800));
    setMissionLog(prev => [...prev, "The Analyst: Analyzing average platform rates..."]);
    await new Promise(r => setTimeout(r, 600));
    setMissionLog(prev => [...prev, "The Strategist: Calculating psychological value anchors..."]);

    try {
        const results = await generatePricingStrategy(items);
        if (Array.isArray(results) && results.length > 0) {
            // Sanitize prices from AI immediately to prevent NaN in render
            const sanitizedResults = results.map(p => ({
                ...p,
                proposedPrice: safeParsePrice(p.proposedPrice)
            }));
            setProposals(sanitizedResults);
            setMissionLog(prev => [...prev, `Mission Complete: Proposing adjustments for ${sanitizedResults.length} items.`]);
        } else {
            setMissionLog(prev => [...prev, "Warning: Analysis engine returned no actionable data."]);
            setProposals([]);
        }
    } catch (e) {
        console.error(e);
        setMissionLog(prev => [...prev, "Critical Error: Analysis engine failed to respond."]);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleApplyAll = async () => {
    setIsApplying(true);
    let count = 0;
    
    try {
        for (const proposal of proposals) {
            const item = items.find(i => i.id === proposal.id);
            if (!item) continue;

            const newPrice = safeParsePrice(proposal.proposedPrice);

            // Fix for type narrowing: Use 'type' property to distinguish between Post and Agent
            if ('type' in item) { 
                // It's a Post
                const updatedPost = { ...item as Post, price: newPrice };
                await savePost(updatedPost);
                count++;
            } else {
                // It's an Agent
                const updatedPriceString = `$${newPrice.toFixed(2)}/min`;
                await saveAgent(item.id, { 
                    price: updatedPriceString,
                    priceValue: newPrice 
                });
                count++;
            }
        }
        setAppliedCount(count);
        
        // Brief delay to allow storage to sync
        await new Promise(r => setTimeout(r, 500));
        onRefresh();
        
    } catch (e) {
        console.error("Failed to apply pricing:", e);
    } finally {
        setTimeout(() => {
            setIsApplying(false);
        }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-30 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold flex items-center">
                <CircleDollarSign className="mr-2 text-amber-500" size={20} />
                Pricing Command Center
            </h2>
        </div>
        <div className="flex items-center space-x-3">
            <div className="text-xs text-slate-500 font-mono hidden md:block uppercase tracking-widest">Status: Ready</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Market Agents */}
        <div className="lg:col-span-4 space-y-6">
            <FadeIn>
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                        <TrendingUp className="mr-2 text-amber-400" size={18} />
                        Pricing Strategy Crew
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                            <div className="p-2 bg-slate-800 rounded-lg"><Search className="text-blue-400" size={18} /></div>
                            <div>
                                <div className="text-sm font-bold">The Analyst</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Market Research</div>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3 p-4 bg-slate-900/50 border border-slate-700 rounded-xl">
                            <div className="p-2 bg-slate-800 rounded-lg"><Cpu className="text-purple-400" size={18} /></div>
                            <div>
                                <div className="text-sm font-bold">The Strategist</div>
                                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Revenue Optimizer</div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleRunStrategy}
                        disabled={isAnalyzing || items.length === 0}
                        className="w-full mt-8 bg-amber-600 hover:bg-amber-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center disabled:opacity-50"
                    >
                        {isAnalyzing ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                        Execute Pricing Analysis
                    </button>
                    {items.length === 0 && <p className="text-[10px] text-red-400 mt-2 text-center">No monetized content found to analyze.</p>}
                </div>
            </FadeIn>

            {/* Terminal Log */}
            <FadeIn delay={0.1}>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 h-[200px] flex flex-col font-mono text-[10px] text-slate-500 shadow-inner">
                    <div className="flex items-center space-x-2 mb-3">
                        <Terminal size={12} className="text-amber-500" />
                        <span className="uppercase font-bold text-amber-500">Crew Comms</span>
                    </div>
                    <div className="flex-grow overflow-y-auto space-y-1 custom-scrollbar">
                        {missionLog.map((log, i) => (
                            <div key={i} className="flex">
                                <span className="text-slate-700 mr-2">{">>>"}</span>
                                <span>{log}</span>
                            </div>
                        ))}
                        {isAnalyzing && <div className="animate-pulse text-amber-400/50">Processing mission nodes...</div>}
                    </div>
                </div>
            </FadeIn>
        </div>

        {/* Results Comparison */}
        <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
                {proposals.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white"
                    >
                        <div className="bg-slate-50 border-b border-slate-100 p-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Proposed Strategy Results</h3>
                                <p className="text-xs text-slate-500">Agent analysis across {proposals.length} monetized items.</p>
                            </div>
                            <button 
                                onClick={handleApplyAll}
                                disabled={isApplying}
                                className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center hover:bg-slate-800 transition-all shadow-md disabled:opacity-50"
                            >
                                {isApplying ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save className="mr-2" size={16} />}
                                Apply To Content
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Current</th>
                                        <th className="px-6 py-4">AI Proposed</th>
                                        <th className="px-6 py-4">AI Reasoning</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {proposals.map(proposal => {
                                        const item = items.find(i => i.id === proposal.id);
                                        // Standardize price retrieval: priceValue for Agent, price for Post
                                        const currentPriceValue = item ? ('type' in item ? (item as Post).price : (item as Agent).priceValue) : 0;
                                        
                                        // Use safe numeric conversion to ensure .toFixed() never fails with NaN
                                        const currentPrice = safeParsePrice(currentPriceValue);
                                        const proposedPrice = safeParsePrice(proposal.proposedPrice);
                                        const change = proposedPrice - currentPrice;
                                        
                                        return (
                                            <tr key={proposal.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 text-sm">{item ? ('title' in item ? item.title : item.name) : 'Unknown'}</div>
                                                    <div className="text-[10px] text-slate-400 capitalize">{item ? ('type' in item ? (item as Post).type : 'Expert') : 'Unknown'}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                                    ${currentPrice.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-bold text-rose-600 font-mono text-sm">${proposedPrice.toFixed(2)}</span>
                                                        <span className={`text-[10px] font-bold ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {change >= 0 ? '+' : ''}{change.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-slate-500 italic leading-relaxed max-w-xs">
                                                    {proposal.reasoning || "No reasoning provided."}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {appliedCount > 0 && (
                            <div className="p-4 bg-emerald-50 border-t border-emerald-100 text-emerald-700 text-sm font-bold flex items-center justify-center">
                                <CheckCircle2 size={16} className="mr-2" />
                                Updated {appliedCount} items successfully.
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-3xl h-[500px] flex flex-col items-center justify-center text-center p-12">
                         <BarChart4 size={48} className="text-slate-700 mb-4" />
                         <h3 className="text-xl font-bold text-slate-500">Analysis Engine Idle</h3>
                         <p className="text-slate-600 max-w-md mt-2">Execute a mission to let our AI agents analyze your directory and suggest competitive monetization rates.</p>
                    </div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminPriceStrategy;
