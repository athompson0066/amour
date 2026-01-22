
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Stars, Lock, Download, RefreshCcw, ArrowLeft, Loader2, BrainCircuit, PenTool, CheckCircle2, ShieldAlert, Heart, User, Calendar, Compass, Eye, Shield, Smile, Frown, Target, MessageSquare, Mail, HelpCircle, ChevronRight, ChevronLeft, Map, Flag, Plane, Briefcase, Rocket, Landmark, Users } from 'lucide-react';
import { generateSoulmateSketch } from '../services/geminiService';
import { FadeIn } from './Animated';

interface SoulmateSketchProps {
  onBack: () => void;
  isUnlocked: boolean;
  onUnlock: () => void;
}

const ZODIACS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", 
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

const ETHNICITIES = ["No Preference", "Caucasian", "Black/African", "East Asian", "South Asian", "Hispanic/Latino", "Middle Eastern", "Mixed"];
const QUALITIES = [
    { id: 'Kindness', icon: '😇', label: 'Kindness' },
    { id: 'Loyalty', icon: '🥹', label: 'Loyalty' },
    { id: 'Intelligence', icon: '🧐', label: 'Intelligence' },
    { id: 'Creativity', icon: '🤩', label: 'Creativity' },
    { id: 'Passion', icon: '🤗', label: 'Passion' },
    { id: 'Empathy', icon: '😊', label: 'Empathy' }
];

const RED_FLAGS = [
    { id: 'Lack of trust', icon: '🙁', label: 'Lack of trust' },
    { id: 'Poor communication', icon: '😶', label: 'Poor communication' },
    { id: 'Jealousy', icon: '🫣', label: 'Jealousy' },
    { id: 'Disrespect', icon: '😢', label: 'Disrespect' },
    { id: 'Inconsistency', icon: '🤯', label: 'Inconsistency' },
    { id: 'Self-centeredness', icon: '😎', label: 'Self-centeredness' }
];

const CHALLENGES = [
    { id: 'Building trust', icon: '🤲', label: 'Building trust' },
    { id: 'Finding the right person', icon: '👩', label: 'Finding the right person' },
    { id: 'Keeping the spark alive', icon: '🔥', label: 'Keeping the spark alive' },
    { id: 'Understanding my needs', icon: '🧘', label: 'Understanding my needs' },
    { id: 'Letting go of the past', icon: '🌈', label: 'Letting go of the past' },
    { id: 'Dealing with uncertainty', icon: '⛅', label: 'Dealing with uncertainty' }
];

const FEARS = [
    { id: 'Losing trust', icon: '💔', label: 'Losing trust' },
    { id: 'Growing apart', icon: '🏃', label: 'Growing apart' },
    { id: 'Not being understood', icon: '🤷', label: 'Not understood' },
    { id: 'Lack of commitment', icon: '🙅', label: 'Commitment' },
    { id: 'Being vulnerable', icon: '🥹', label: 'Vulnerability' },
    { id: 'Getting hurt again', icon: '😢', label: 'Getting hurt' }
];

const GOALS = [
    { id: 'Family', icon: '👨‍👩', label: 'Building a family' },
    { id: 'Travel', icon: '✈️', label: 'Traveling the world' },
    { id: 'Business', icon: '💼', label: 'Creating a business' },
    { id: 'Growth', icon: '🚀', label: 'Personal growth' },
    { id: 'Stability', icon: '💵', label: 'Financial stability' },
    { id: 'Impact', icon: '🎯', label: 'Positive impact' }
];

const SoulmateSketch: React.FC<SoulmateSketchProps> = ({ onBack, isUnlocked, onUnlock }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    genderPreference: 'Women',
    status: 'Single',
    zodiac: 'Scorpio',
    ageRange: '25-35',
    ethnicity: 'No Preference',
    appearanceImportance: 'Medium',
    keyQuality: 'Kindness',
    firstName: '',
    lastName: '',
    birthdate: '',
    email: '',
    element: 'Fire',
    decisionMaker: 'Heart',
    challenge: 'Finding the right person',
    redFlag: 'Poor communication',
    dynamic: 'Deep connection',
    loveLanguage: 'Words of affirmation',
    fear: 'Losing trust',
    goals: [] as string[]
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [sketchUrl, setSketchUrl] = useState<string | null>(null);
  const [missionLog, setMissionLog] = useState<string[]>([]);
  const [activeAgent, setActiveAgent] = useState<'strategist' | 'artist' | 'none'>('none');

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (id: string) => {
    const next = formData.goals.includes(id) 
        ? formData.goals.filter(g => g !== id)
        : [...formData.goals, id];
    updateForm('goals', next);
  };

  const handleNext = () => setStep(prev => Math.min(prev + 1, 7));
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGenerate = async () => {
    if (!isUnlocked) {
      onUnlock();
      return;
    }

    setIsGenerating(true);
    setSketchUrl(null);
    setMissionLog(["Initiating Psychic Connection..."]);
    setActiveAgent('strategist');

    await new Promise(r => setTimeout(r, 1200));
    setMissionLog(prev => [...prev, "Strategist: Mapping karmic nodes for " + formData.zodiac + "..."]);
    
    await new Promise(r => setTimeout(r, 1000));
    setActiveAgent('artist');
    setMissionLog(prev => [...prev, "Aethel: Visualizing features based on " + formData.keyQuality + "..."]);
    
    await new Promise(r => setTimeout(r, 1500));
    setMissionLog(prev => [...prev, "Aethel: Channeling the " + formData.element + " spirit into graphite..."]);

    try {
      const url = await generateSoulmateSketch(formData);
      if (url) {
        setSketchUrl(url);
        setMissionLog(prev => [...prev, "Manifestation Complete."]);
      } else {
        setMissionLog(prev => [...prev, "Error: The connection was severed."]);
      }
    } catch (e) {
      setMissionLog(prev => [...prev, "Critical Failure in the Veil."]);
    } finally {
      setIsGenerating(false);
      setActiveAgent('none');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <User className="mr-2 text-rose-500" size={20} />
                The Seeker's Foundation
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">First Name</label>
                    <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Birthdate</label>
                    <input 
                        type="date" 
                        value={formData.birthdate}
                        onChange={(e) => updateForm('birthdate', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">I Like</label>
                    <div className="flex space-x-2">
                        {['Men', 'Women'].map(g => (
                            <button 
                                key={g} 
                                onClick={() => updateForm('genderPreference', g)}
                                className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${formData.genderPreference === g ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status</label>
                    <select 
                        value={formData.status}
                        onChange={(e) => updateForm('status', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                        <option>Single</option>
                        <option>Divorced</option>
                        <option>Widowed</option>
                        <option>Separated</option>
                    </select>
                </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <Stars className="mr-2 text-rose-500" size={20} />
                Celestial Signature
            </h3>
            <div className="grid grid-cols-4 gap-2">
                {ZODIACS.map(z => (
                    <button 
                        key={z} 
                        onClick={() => updateForm('zodiac', z)}
                        className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.zodiac === z ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        {z}
                    </button>
                ))}
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Your Elemental Spirit</label>
                <div className="grid grid-cols-5 gap-2">
                    {['Fire', 'Water', 'Earth', 'Air', 'Quintessence'].map(e => (
                        <button 
                            key={e} 
                            onClick={() => updateForm('element', e)}
                            className={`py-3 rounded-xl text-[10px] font-bold border transition-all text-center ${formData.element === e ? 'bg-amber-600 border-amber-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <Eye className="mr-2 text-rose-500" size={20} />
                Physical Visualization
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Age Range</label>
                    <select 
                        value={formData.ageRange}
                        onChange={(e) => updateForm('ageRange', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                        <option>18-24</option>
                        <option>25-35</option>
                        <option>36-45</option>
                        <option>46-60</option>
                        <option>60+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Ethnic Background</label>
                    <select 
                        value={formData.ethnicity}
                        onChange={(e) => updateForm('ethnicity', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                    >
                        {ETHNICITIES.map(e => <option key={e}>{e}</option>)}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Appearance Importance</label>
                <div className="flex space-x-2">
                    {['Low', 'Medium', 'High'].map(imp => (
                        <button 
                            key={imp} 
                            onClick={() => updateForm('appearanceImportance', imp)}
                            className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${formData.appearanceImportance === imp ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                        >
                            {imp}
                        </button>
                    ))}
                </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <Heart className="mr-2 text-rose-500" size={20} />
                The Core Quality
            </h3>
            <div className="grid grid-cols-3 gap-3">
                {QUALITIES.map(q => (
                    <button 
                        key={q.id} 
                        onClick={() => updateForm('keyQuality', q.id)}
                        className={`p-4 rounded-2xl text-[10px] font-bold border transition-all flex flex-col items-center justify-center ${formData.keyQuality === q.id ? 'bg-rose-600 border-rose-500 text-white shadow-lg scale-105' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        <span className="text-2xl mb-2">{q.icon}</span>
                        <span>{q.label}</span>
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                    onClick={() => updateForm('decisionMaker', 'Head')}
                    className={`py-4 rounded-xl text-xs font-bold border transition-all ${formData.decisionMaker === 'Head' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                    🧠 Decisions with Head
                </button>
                <button 
                    onClick={() => updateForm('decisionMaker', 'Heart')}
                    className={`py-4 rounded-xl text-xs font-bold border transition-all ${formData.decisionMaker === 'Heart' ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                >
                    ❤️ Decisions with Heart
                </button>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <Flag className="mr-2 text-rose-500" size={20} />
                Shadow Profile
            </h3>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Your Biggest Relationship Fear</label>
            <div className="grid grid-cols-3 gap-2">
                {FEARS.map(f => (
                    <button 
                        key={f.id} 
                        onClick={() => updateForm('fear', f.id)}
                        className={`p-3 rounded-xl text-[8px] font-bold border transition-all flex flex-col items-center text-center ${formData.fear === f.id ? 'bg-rose-600 border-rose-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        <span className="text-xl mb-1">{f.icon}</span>
                        <span>{f.label}</span>
                    </button>
                ))}
            </div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mt-4">The Red Flag You Can't Ignore</label>
            <div className="grid grid-cols-3 gap-2">
                {RED_FLAGS.map(rf => (
                    <button 
                        key={rf.id} 
                        onClick={() => updateForm('redFlag', rf.id)}
                        className={`p-3 rounded-xl text-[8px] font-bold border transition-all flex flex-col items-center text-center ${formData.redFlag === rf.id ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        <span className="text-xl mb-1">{rf.icon}</span>
                        <span>{rf.label}</span>
                    </button>
                ))}
            </div>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h3 className="text-xl font-serif font-bold text-slate-100 mb-6 flex items-center">
                <Target className="mr-2 text-rose-500" size={20} />
                Shared Life Goals
            </h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold text-center tracking-widest">Select as many as you want</p>
            <div className="grid grid-cols-3 gap-3">
                {GOALS.map(g => (
                    <button 
                        key={g.id} 
                        onClick={() => toggleGoal(g.id)}
                        className={`p-4 rounded-2xl text-[8px] font-bold border transition-all flex flex-col items-center text-center ${formData.goals.includes(g.id) ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                        <span className="text-2xl mb-2">{g.icon}</span>
                        <span>{g.label}</span>
                    </button>
                ))}
            </div>
            <div className="pt-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 text-center">Ideal Love Language</label>
                <select 
                    value={formData.loveLanguage}
                    onChange={(e) => updateForm('loveLanguage', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-sm focus:ring-1 focus:ring-rose-500 outline-none text-center"
                >
                    <option>Words of affirmation</option>
                    <option>Acts of service</option>
                    <option>Physical touch</option>
                    <option>Receiving gifts</option>
                    <option>Quality time</option>
                </select>
            </div>
          </motion.div>
        );
      case 7:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-rose-500" size={32} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-100">The Veil is Thinning</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                Aethel has completed the celestial alignment. Your fated match is ready to be manifest.
            </p>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 text-left space-y-3 mb-6 shadow-inner">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Psychic Synthesis Log</div>
                <div className="flex items-center text-xs text-rose-300">
                    <CheckCircle2 size={12} className="mr-2" /> {formData.zodiac} node mapped
                </div>
                <div className="flex items-center text-xs text-rose-300">
                    <CheckCircle2 size={12} className="mr-2" /> {formData.element} essence resonant
                </div>
                <div className="flex items-center text-xs text-rose-300">
                    <CheckCircle2 size={12} className="mr-2" /> Targeting {formData.ageRange} timeline
                </div>
                <div className="flex items-center text-xs text-rose-300">
                    <CheckCircle2 size={12} className="mr-2" /> Goals: {formData.goals.length > 0 ? formData.goals.join(', ') : 'Universal'}
                </div>
            </div>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Where should we send your sketch?</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-center text-sm focus:ring-1 focus:ring-rose-500 outline-none"
                        placeholder="your@email.com"
                    />
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !formData.email}
                    className="w-full group relative bg-rose-600 hover:bg-rose-500 text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-rose-900/40 transition-all flex items-center justify-center overflow-hidden"
                >
                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                    {isUnlocked ? 'Get Your Soulmate Drawing' : 'Unlock Sketch for $29.99'}
                </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-rose-500/30">
      {/* Mystical Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12">
        <button onClick={onBack} className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} />
          <span className="font-medium">Return to Directory</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Main Content (Forms/Results) */}
          <div className="lg:col-span-7 space-y-8">
            <FadeIn>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <Stars className="text-rose-500" size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-100 to-slate-400">
                    Aethel's Vision
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Channeling your match...</p>
                </div>
              </div>
            </FadeIn>

            <AnimatePresence mode="wait">
                {!sketchUrl ? (
                    <motion.div 
                        key="form"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
                    >
                        {/* Progress Indicator */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
                            <motion.div 
                                className="h-full bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]"
                                animate={{ width: `${(step / 7) * 100}%` }}
                            />
                        </div>

                        {renderStep()}

                        {step < 7 && (
                            <div className="pt-8 flex justify-between items-center border-t border-slate-800 mt-8">
                                <button 
                                    onClick={handleBack}
                                    disabled={step === 1}
                                    className="flex items-center space-x-2 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
                                >
                                    <ChevronLeft size={18} />
                                    <span>Previous</span>
                                </button>
                                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    Alignment Step {step} of 7
                                </div>
                                <button 
                                    onClick={handleNext}
                                    className="flex items-center space-x-2 text-rose-500 hover:text-rose-400 transition-colors text-sm font-bold"
                                >
                                    <span>Continue</span>
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div 
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-white p-6 rounded-3xl shadow-2xl shadow-rose-900/20 border border-slate-100"
                    >
                        <div className="relative aspect-[3/4] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-inner group">
                            <img src={sketchUrl} alt="Soulmate Sketch" className="w-full h-full object-cover mix-blend-multiply opacity-95" />
                            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"></div>
                            
                            {/* Artist Signature Simulation */}
                            <div className="absolute bottom-6 right-8 font-serif italic text-slate-400 text-sm select-none opacity-40">
                                Aethel.
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-between">
                            <div>
                                <h3 className="font-serif font-bold text-slate-900 text-2xl tracking-tight italic">Your Destined Partner</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manifested for {formData.firstName} • {formData.zodiac} Match</p>
                            </div>
                            <div className="flex space-x-3">
                                <button className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors shadow-sm" title="Download">
                                    <Download size={20} />
                                </button>
                                <button onClick={() => { setSketchUrl(null); setStep(1); }} className="p-4 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors shadow-lg" title="New Session">
                                    <RefreshCcw size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                            <p className="text-xs text-rose-800 leading-relaxed italic">
                                "This portrait reflects the deep karmic alignment we identified. Their ${formData.keyQuality.toLowerCase()} and focus on ${formData.goals[0] || 'your shared future'} is the anchor you have been seeking."
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Right Column: Mission Log & Artist Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 font-mono text-[10px] h-60 overflow-hidden relative group shadow-inner">
              <div className="flex items-center space-x-2 mb-3 text-rose-500/70">
                <BrainCircuit size={14} />
                <span className="font-bold tracking-widest uppercase">The Psychic Engine</span>
              </div>
              <div className="space-y-2 opacity-60">
                {missionLog.length === 0 ? (
                    <div className="text-slate-700 italic">Waiting for alignment...</div>
                ) : (
                    missionLog.map((log, i) => (
                        <div key={i} className="flex">
                          <span className="text-slate-800 mr-2">»</span>
                          <span className={i === missionLog.length - 1 ? 'text-rose-400' : ''}>{log}</span>
                        </div>
                    ))
                )}
                {isGenerating && <div className="animate-pulse text-rose-400">Rendering the soul's essence...</div>}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
            </div>

            <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/50 flex flex-col items-center text-center">
               <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200" className="w-20 h-20 rounded-full border-2 border-rose-500/30 mb-4 shadow-xl" alt="Aethel" />
               <div className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Aethel</div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-4">Master Clairvoyant Artist</div>
               <p className="text-xs text-slate-400 leading-relaxed italic px-4">
                "I draw the face that belongs to the heartbeat you haven't heard yet."
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoulmateSketch;
