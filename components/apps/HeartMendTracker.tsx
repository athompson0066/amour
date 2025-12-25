import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { FadeIn } from '../Animated';
import { Heart, Calendar, Smile, Frown, Meh, Sun, CloudRain, PenTool, CheckCircle, Trophy, ArrowRight, Lock } from 'lucide-react';

interface HeartMendProps {
    user: User | null;
    onBack: () => void;
}

type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface CheckIn {
    date: string;
    mood: Mood;
    tags: string[];
    note: string;
}

interface UserSettings {
    breakupDate: string;
    partnerName: string;
    onboardingComplete: boolean;
}

const HeartMendTracker: React.FC<HeartMendProps> = ({ user, onBack }) => {
    // State
    const [view, setView] = useState<'onboarding' | 'dashboard' | 'checkin' | 'journal'>('dashboard');
    const [settings, setSettings] = useState<UserSettings>({
        breakupDate: '',
        partnerName: '',
        onboardingComplete: false
    });
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [journalEntry, setJournalEntry] = useState('');

    // Load Data
    useEffect(() => {
        const savedSettings = localStorage.getItem('heartmend_settings');
        const savedCheckIns = localStorage.getItem('heartmend_checkins');
        
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
            if (!parsed.onboardingComplete) setView('onboarding');
        } else {
            setView('onboarding');
        }

        if (savedCheckIns) {
            setCheckIns(JSON.parse(savedCheckIns));
        }
    }, []);

    const saveSettings = (newSettings: UserSettings) => {
        setSettings(newSettings);
        localStorage.setItem('heartmend_settings', JSON.stringify(newSettings));
    };

    const handleCheckIn = (mood: Mood, tags: string[], note: string) => {
        const newCheckIn: CheckIn = {
            date: new Date().toISOString(),
            mood,
            tags,
            note
        };
        const updatedCheckIns = [...checkIns, newCheckIn];
        setCheckIns(updatedCheckIns);
        localStorage.setItem('heartmend_checkins', JSON.stringify(updatedCheckIns));
        setView('dashboard');
    };

    // Calculate Stats
    const daysSinceBreakup = settings.breakupDate 
        ? Math.floor((new Date().getTime() - new Date(settings.breakupDate).getTime()) / (1000 * 3600 * 24))
        : 0;

    const streak = checkIns.length; // Simplified streak for MVP

    // Render Helpers
    const getMoodIcon = (mood: Mood, size = 24) => {
        switch(mood) {
            case 'great': return <Sun size={size} className="text-yellow-500" />;
            case 'good': return <Smile size={size} className="text-green-500" />;
            case 'neutral': return <Meh size={size} className="text-slate-400" />;
            case 'bad': return <Frown size={size} className="text-orange-500" />;
            case 'terrible': return <CloudRain size={size} className="text-blue-600" />;
        }
    };

    // --- VIEWS ---

    if (view === 'onboarding') {
        return (
            <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Heart className="text-rose-500 fill-current" size={32} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Healing Starts Here</h2>
                    <p className="text-slate-500 mb-8">We'll help you track your journey back to yourself.</p>
                    
                    <div className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">When did the breakup happen?</label>
                            <input 
                                type="date" 
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                                onChange={(e) => setSettings({...settings, breakupDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ex's Name (Optional)</label>
                            <input 
                                type="text" 
                                placeholder="For journaling context..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                                onChange={(e) => setSettings({...settings, partnerName: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        disabled={!settings.breakupDate}
                        onClick={() => {
                            saveSettings({...settings, onboardingComplete: true});
                            setView('dashboard');
                        }}
                        className="mt-8 w-full bg-rose-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-rose-700 transition-all disabled:opacity-50"
                    >
                        Start My Journey
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'checkin') {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                 <div className="bg-white max-w-lg w-full rounded-3xl shadow-xl p-8">
                    <button onClick={() => setView('dashboard')} className="text-slate-400 hover:text-slate-600 mb-4">Cancel</button>
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">How are you feeling today?</h2>
                    
                    <div className="flex justify-between mb-8">
                        {(['terrible', 'bad', 'neutral', 'good', 'great'] as Mood[]).map(m => (
                            <button 
                                key={m}
                                onClick={() => handleCheckIn(m, [], '')}
                                className="flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50 transition-colors group"
                            >
                                <div className="transform group-hover:scale-110 transition-transform">{getMoodIcon(m, 40)}</div>
                                <span className="text-xs font-medium text-slate-500 mt-2 capitalize">{m}</span>
                            </button>
                        ))}
                    </div>
                 </div>
            </div>
        );
    }

    // DASHBOARD
    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white px-6 py-6 border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex justify-between items-center">
                    <button onClick={onBack} className="text-slate-500 hover:text-rose-600 text-sm font-medium">← Back to Tools</button>
                    <h1 className="text-lg font-bold text-slate-800">Heart Mend Tracker</h1>
                    <div className="w-8"></div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                
                {/* Hero Stats */}
                <FadeIn>
                    <div className="bg-gradient-to-br from-rose-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-rose-100 font-medium mb-1">Time Heals</p>
                            <h2 className="text-4xl font-serif font-bold mb-4">{daysSinceBreakup} Days</h2>
                            <p className="opacity-90">since you started your new chapter.</p>
                            
                            <div className="mt-8 flex space-x-4">
                                <button onClick={() => setView('checkin')} className="bg-white text-rose-600 px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform">
                                    Log Mood
                                </button>
                                <button className="bg-rose-600/50 border border-white/30 text-white px-6 py-3 rounded-full font-bold hover:bg-rose-600/70 transition-colors">
                                    Journal
                                </button>
                            </div>
                        </div>
                        {/* Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                </FadeIn>

                {/* Mood Graph Placeholder (SVG) */}
                <FadeIn delay={0.1}>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-900 flex items-center">
                                <Trophy className="mr-2 text-yellow-500" size={18} />
                                Your Emotional Trend
                            </h3>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{streak} Day Streak</span>
                        </div>
                        
                        <div className="h-48 w-full bg-slate-50 rounded-xl flex items-end justify-between px-4 pb-4 pt-8 relative overflow-hidden">
                            {/* Simple visualization of random bars for demo if no data, else real data mapping would go here */}
                            {checkIns.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                                    Log your first mood to see trends
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-end space-x-1">
                                    {checkIns.slice(-7).map((c, i) => {
                                        const heights = { 'terrible': '20%', 'bad': '40%', 'neutral': '60%', 'good': '80%', 'great': '100%' };
                                        return (
                                            <div key={i} className="flex-1 bg-rose-200 rounded-t-md relative group hover:bg-rose-400 transition-colors" style={{ height: heights[c.mood] }}>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {getMoodIcon(c.mood, 16)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </FadeIn>

                {/* Milestones */}
                <FadeIn delay={0.2}>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                         <h3 className="font-bold text-slate-900 mb-4">Milestones</h3>
                         <div className="space-y-3">
                             <div className={`p-4 rounded-xl border flex items-center ${daysSinceBreakup >= 1 ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${daysSinceBreakup >= 1 ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-400'}`}>
                                     <CheckCircle size={16} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-sm text-slate-900">Survive Day 1</h4>
                                     <p className="text-xs text-slate-500">The hardest step is the first.</p>
                                 </div>
                             </div>
                             
                             <div className={`p-4 rounded-xl border flex items-center ${daysSinceBreakup >= 30 ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${daysSinceBreakup >= 30 ? 'bg-green-200 text-green-700' : 'bg-slate-200 text-slate-400'}`}>
                                     <CheckCircle size={16} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-sm text-slate-900">30 Days No Contact</h4>
                                     <p className="text-xs text-slate-500">Reclaiming your independence.</p>
                                 </div>
                             </div>
                         </div>
                    </div>
                </FadeIn>
            </div>
        </div>
    );
};

export default HeartMendTracker;