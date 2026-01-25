
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic2, Play, Pause, Save, ArrowLeft, Loader2, Sparkles, Headphones, 
    User, Globe, Volume2, Trash2, Rocket, FileText, ChevronRight, CheckCircle2,
    Music, Users, Radio, ToggleLeft, ToggleRight, Mic, Layout, Terminal, Settings2, Sliders, Disc, AlertTriangle, Image as ImageIcon, Volume1, VolumeX, Upload, FileAudio, CircleDollarSign, ExternalLink, Key
} from 'lucide-react';
import { generateNarration, runAudioCrewMission } from '../services/geminiService';
import { savePost, DEFAULT_AUTHOR } from '../services/storage';
import { Post, ContentType } from '../types';
import { FadeIn } from './Animated';

interface AdminAudioStudioProps {
  onBack: () => void;
  onPublished: () => void;
}

const PRESET_MUSIC = [
    { id: 'none', label: 'No Music', url: '' },
    { id: 'lofi', label: 'Lofi Chill', url: 'https://archive.org/download/LofiHipHopFreeUse/Lofi%20Hip%20Hop%20-%20Free%20Use.mp3' },
    { id: 'ambient', label: 'Deep Ambient', url: 'https://archive.org/download/ambient-music-collection/Deep%20Space%20Atmosphere.mp3' },
    { id: 'romantic', label: 'Romantic Piano', url: 'https://archive.org/download/romantic-piano-music/Romantic%20Piano.mp3' },
    { id: 'inspirational', label: 'Inspirational', url: 'https://archive.org/download/inspirational-music-collection/Inspirational%20Journey.mp3' }
];

const BACKGROUNDS = [
    "General / Neutral",
    "African-American",
    "Hispanic / Latino",
    "East Asian",
    "South Asian",
    "Middle Eastern",
    "European / British",
    "Australian"
];

const VOICES = [
    { id: 'Puck', label: 'Puck', gender: 'female', desc: 'Friendly & Warm' },
    { id: 'Kore', label: 'Kore', gender: 'male', desc: 'Professional & Neutral' },
    { id: 'Charon', label: 'Charon', gender: 'male', desc: 'Deep & Authoritative' },
    { id: 'Fenrir', label: 'Fenrir', gender: 'male', desc: 'Rugged & Earthy' },
    { id: 'Zephyr', label: 'Zephyr', gender: 'male', desc: 'Light & Youthful' }
];

const audioBufferCache: Record<string, AudioBuffer> = {};

const resamplePCM = (dataInt16: Int16Array, fromRate: number, toRate: number): Float32Array => {
    if (fromRate === toRate) {
        const floatData = new Float32Array(dataInt16.length);
        for (let i = 0; i < dataInt16.length; i++) {
            floatData[i] = dataInt16[i] / 32768.0;
        }
        return floatData;
    }
    const ratio = fromRate / toRate;
    const newLength = Math.round(dataInt16.length / ratio);
    const result = new Float32Array(newLength);
    for (let i = 0; i < newLength; i++) {
        const position = i * ratio;
        const idx = Math.floor(position);
        const fraction = position - idx;
        if (idx + 1 < dataInt16.length) {
            const sample1 = dataInt16[idx] / 32768.0;
            const sample2 = dataInt16[idx + 1] / 32768.0;
            result[i] = sample1 + (sample2 - sample1) * fraction;
        } else if (idx < dataInt16.length) {
            result[i] = dataInt16[idx] / 32768.0;
        }
    }
    return result;
};

const AdminAudioStudio: React.FC<AdminAudioStudioProps> = ({ onBack, onPublished }) => {
    const [title, setTitle] = useState('');
    const [featureImageUrl, setFeatureImageUrl] = useState('');
    const [crewInstructions, setCrewInstructions] = useState('');
    const [script, setScript] = useState('');
    const [isDuoMode, setIsDuoMode] = useState(false);
    const [selectedVoiceA, setSelectedVoiceA] = useState('Puck');
    const [selectedVoiceB, setSelectedVoiceB] = useState('Kore');
    const [selectedBackground, setSelectedBackground] = useState('General / Neutral');
    const [tone, setTone] = useState('Warm and Empathetic');
    const [selectedMusic, setSelectedMusic] = useState('none');
    const [musicVolume, setMusicVolume] = useState(0.15);

    // Monetization States
    const [isPremium, setIsPremium] = useState(false);
    const [price, setPrice] = useState('9.99');
    const [payhipUrl, setPayhipUrl] = useState('');
    const [unlockPassword, setUnlockPassword] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [audioBase64, setAudioBase64] = useState<string | null>(null);
    const [isMissionRunning, setIsMissionRunning] = useState(false);
    const [missionLog, setMissionLog] = useState<string[]>([]);
    const [quotaError, setQuotaError] = useState(false);

    // Custom Audio States
    const [customTracks, setCustomTracks] = useState<{ id: string, label: string, url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mixed Output Refs
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    // Preview Track Refs
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const [playingAtmosId, setPlayingAtmosId] = useState<string | null>(null);

    const combinedMusicList = [...PRESET_MUSIC, ...customTracks];

    const stopAllAudio = () => {
        try {
            voiceSourceRef.current?.stop();
            voiceSourceRef.current = null;
            musicSourceRef.current?.stop();
            musicSourceRef.current = null;
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            audioContextRef.current = null;
        } catch (e) {}

        if (previewAudioRef.current) {
            previewAudioRef.current.pause();
            previewAudioRef.current.src = "";
            previewAudioRef.current = null;
        }

        setIsPlaying(false);
        setPlayingAtmosId(null);
    };

    const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('audio/')) {
            alert("Please select a valid audio file (MP3, WAV, etc.)");
            return;
        }

        const url = URL.createObjectURL(file);
        const newTrack = {
            id: `custom_${Date.now()}`,
            label: file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name,
            url: url
        };

        setCustomTracks(prev => [...prev, newTrack]);
        setSelectedMusic(newTrack.id);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeCustomTrack = (id: string) => {
        const track = customTracks.find(t => t.id === id);
        if (track) URL.revokeObjectURL(track.url);
        setCustomTracks(prev => prev.filter(t => t.id !== id));
        if (selectedMusic === id) setSelectedMusic('none');
    };

    const previewAtmos = (track: { id: string, url: string }) => {
        if (playingAtmosId === track.id) {
            stopAllAudio();
            return;
        }

        stopAllAudio();
        setPlayingAtmosId(track.id);

        const audio = new Audio(track.url);
        audio.loop = true;
        audio.play().catch(e => {
            console.error("Audio preview blocked by browser:", e);
            alert("Please interact with the page first to allow audio playback.");
            setPlayingAtmosId(null);
        });
        
        audio.onended = () => setPlayingAtmosId(null);
        previewAudioRef.current = audio;
    };

    const handleRunCrewMission = async () => {
        if (!title) return alert("Enter a title first.");
        setIsMissionRunning(true);
        setQuotaError(false);
        setMissionLog(["Initializing Audio Script Crew..."]);
        
        const personaPrompt = `${selectedBackground} narrator with a ${tone} tone.`;
        
        try {
            await new Promise(r => setTimeout(r, 600));
            setMissionLog(prev => [...prev, "The Researcher: Analyzing title resonance..."]);
            await new Promise(r => setTimeout(r, 800));
            setMissionLog(prev => [...prev, "The Scriptwriter: Architecting narrative beats..."]);
            await new Promise(r => setTimeout(r, 600));
            setMissionLog(prev => [...prev, "The Critic: Polishing for vocal naturalism..."]);

            const result = await runAudioCrewMission(title, isDuoMode, personaPrompt, crewInstructions);
            
            if (result.startsWith("ERROR:")) {
              if (result.includes("Quota")) setQuotaError(true);
              throw new Error(result);
            }
            
            setScript(result);
            setMissionLog(prev => [...prev, "Mission Complete: Script successfully manifested."]);
        } catch (e: any) {
            console.error(e);
            setMissionLog(prev => [...prev, e.message || "CRITICAL ERROR: Communication lost."]);
        } finally {
            setIsMissionRunning(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!script) return alert("Script is empty.");
        setIsGenerating(true);
        setAudioBase64(null);
        setQuotaError(false);
        setMissionLog(prev => [...prev, "Synthesizer: Connecting to neural voice cloud..."]);
        
        const personaPrompt = `${selectedBackground} narrator with a ${tone} tone.`;
        const voices = isDuoMode 
            ? [
                { name: selectedVoiceA, label: VOICES.find(v => v.id === selectedVoiceA)?.label || 'SpeakerA' },
                { name: selectedVoiceB, label: VOICES.find(v => v.id === selectedVoiceB)?.label || 'SpeakerB' }
              ]
            : [{ name: selectedVoiceA, label: 'Narrator' }];
        
        try {
            const result = await generateNarration(script, voices, personaPrompt);
            if (result) {
                if (typeof result === 'string' && result.startsWith("ERROR:")) {
                     setMissionLog(prev => [...prev, result]);
                     if (result.includes("Quota")) setQuotaError(true);
                     return;
                }
                setAudioBase64(result);
                setMissionLog(prev => [...prev, "Synthesizer: Audio manifestation success."]);
            }
        } catch (e: any) {
            console.error(e);
            const msg = e?.message || "Generation failed.";
            if (msg.includes("quota") || msg.includes("429")) setQuotaError(true);
            setMissionLog(prev => [...prev, `ERROR: ${msg}`]);
            alert(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const playMixedAudio = async () => {
        if (!audioBase64) return;
        
        if (isPlaying) {
            stopAllAudio();
            return;
        }

        stopAllAudio();
        setIsPreviewLoading(true);

        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;
            if (ctx.state === 'suspended') await ctx.resume();

            const voiceBinary = atob(audioBase64);
            const vLen = voiceBinary.length;
            const voiceBytes = new Uint8Array(vLen);
            for (let i = 0; i < vLen; i++) voiceBytes[i] = voiceBinary.charCodeAt(i);
            const voiceInt16 = new Int16Array(voiceBytes.buffer, 0, Math.floor(vLen / 2));
            const resampledVoice = resamplePCM(voiceInt16, 24000, ctx.sampleRate);
            const voiceBuffer = ctx.createBuffer(1, resampledVoice.length, ctx.sampleRate);
            voiceBuffer.getChannelData(0).set(resampledVoice);
            const voiceSource = ctx.createBufferSource();
            voiceSource.buffer = voiceBuffer;
            
            let musicBufferToPlay: AudioBuffer | null = null;
            const musicTrack = combinedMusicList.find(m => m.id === selectedMusic);
            
            if (musicTrack && musicTrack.url) {
                try {
                    if (audioBufferCache[musicTrack.url]) {
                        musicBufferToPlay = audioBufferCache[musicTrack.url];
                    } else {
                        const musicResponse = await fetch(musicTrack.url, { 
                          method: 'GET',
                          mode: 'cors',
                          credentials: 'omit'
                        });
                        
                        if (!musicResponse.ok) throw new Error("Atmos fetch failed");
                        const musicArrayBuffer = await musicResponse.arrayBuffer();
                        musicBufferToPlay = await ctx.decodeAudioData(musicArrayBuffer);
                        audioBufferCache[musicTrack.url] = musicBufferToPlay;
                    }
                } catch (musicErr) {
                    console.warn("Background music failed to load/decode, playing narration only", musicErr);
                }
            }

            if (musicBufferToPlay) {
                const musicSource = ctx.createBufferSource();
                musicSource.buffer = musicBufferToPlay;
                musicSource.loop = true;
                const musicGain = ctx.createGain();
                musicGain.gain.value = musicVolume;
                musicSource.connect(musicGain);
                musicGain.connect(ctx.destination);
                musicSourceRef.current = musicSource;
                musicSource.start(0);
            }

            voiceSource.connect(ctx.destination);
            voiceSource.onended = () => {
                try { musicSourceRef.current?.stop(); } catch (e) {}
                setIsPlaying(false);
            };
            
            voiceSourceRef.current = voiceSource;
            voiceSource.start(0);
            setIsPlaying(true);
        } catch (e) {
            console.error("Mixed playback failed:", e);
            alert("Audio engine error. Please ensure your browser supports Web Audio API.");
        } finally {
            setIsPreviewLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            stopAllAudio();
            customTracks.forEach(t => URL.revokeObjectURL(t.url));
        };
    }, []);

    const handlePublish = async () => {
        if (!audioBase64 || !title) return;
        setIsPublishing(true);
        try {
            const voiceNames = isDuoMode 
                ? `${VOICES.find(v => v.id === selectedVoiceA)?.label} & ${VOICES.find(v => v.id === selectedVoiceB)?.label}` 
                : VOICES.find(v => v.id === selectedVoiceA)?.label || selectedVoiceA;

            const newPost: Post = {
                id: `audio_blog_${Date.now()}`,
                title: title,
                subtitle: isDuoMode ? `AI Duo Podcast (${voiceNames})` : `Produced Narration (${voiceNames})`,
                type: 'podcast',
                coverImage: featureImageUrl || 'https://images.unsplash.com/photo-1478737270239-2fccd2c78621?auto=format&fit=crop&q=80&w=800&h=400',
                author: DEFAULT_AUTHOR,
                publishedAt: new Date().toISOString(),
                readTime: `${Math.ceil(script.split(' ').length / 150)} min audio`,
                isPremium: isPremium,
                price: isPremium ? parseFloat(price) : undefined,
                payhipProductUrl: isPremium ? payhipUrl : undefined,
                unlockPassword: isPremium ? unlockPassword : undefined,
                tags: ['Audio Production', 'AI Voice', 'Mixed'],
                blocks: [
                    {
                        id: 'audio_block',
                        type: 'audio',
                        content: audioBase64,
                        meta: {
                            audioTitle: title,
                            voiceName: voiceNames,
                            bgMusicTrack: selectedMusic !== 'none' ? selectedMusic : undefined,
                            bgMusicVolume: musicVolume
                        }
                    },
                    {
                        id: 'text_block',
                        type: 'text',
                        content: script
                    }
                ]
            };
            await savePost(newPost);
            onPublished();
            onBack();
        } catch (e) {
            console.error(e);
            alert("Failed to publish content.");
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold flex items-center text-slate-800">
                        <Mic2 className="mr-2 text-rose-500" size={20} />
                        Audio Production Studio
                    </h2>
                </div>
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={handlePublish}
                        disabled={!audioBase64 || isPublishing || !title}
                        className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-bold flex items-center hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10"
                    >
                        {isPublishing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Rocket className="mr-2" size={18} />}
                        Publish Production
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <FadeIn className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                                <Users className="mr-2 text-rose-500" size={14} />
                                Cast & Mood
                            </h3>
                            <button 
                                onClick={() => setIsDuoMode(!isDuoMode)}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${isDuoMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}
                            >
                                {isDuoMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                <span>{isDuoMode ? 'Podcast Duo' : 'Solo'}</span>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Vocal Profile</label>
                                <div className="space-y-1.5">
                                    {VOICES.map(v => (
                                        <button 
                                            key={v.id} 
                                            onClick={() => setSelectedVoiceA(v.id)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedVoiceA === v.id ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'}`}
                                        >
                                            <div className="text-left">
                                                <div>{v.label}</div>
                                                <div className={`text-[8px] font-normal uppercase ${selectedVoiceA === v.id ? 'text-rose-100' : 'text-slate-400'}`}>{v.desc}</div>
                                            </div>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${selectedVoiceA === v.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>{v.gender}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {isDuoMode && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2 border-t border-slate-100">
                                    <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-2 ml-1">Guest Voice</label>
                                    <div className="space-y-1.5">
                                        {VOICES.map(v => (
                                            <button 
                                                key={v.id} 
                                                onClick={() => setSelectedVoiceB(v.id)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${selectedVoiceB === v.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                                            >
                                                <span>{v.label}</span>
                                                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${selectedVoiceB === v.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>{v.gender}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <Disc className="text-indigo-500" size={16} />
                                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest">Atmospheric Mixing</label>
                                        </div>
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                                            title="Upload custom MP3"
                                        >
                                            <Upload size={14} />
                                        </button>
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            accept="audio/mp3,audio/mpeg,audio/wav" 
                                            onChange={handleCustomFileUpload} 
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mb-4">
                                        {combinedMusicList.map(m => (
                                            <div key={m.id} className="flex items-center space-x-1 w-full group/track">
                                                <button 
                                                    onClick={() => setSelectedMusic(m.id)}
                                                    className={`flex-grow text-left py-2 px-3 rounded-xl text-[10px] font-bold border transition-all flex items-center ${selectedMusic === m.id ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'}`}
                                                >
                                                    {m.id.startsWith('custom_') && <FileAudio size={12} className="mr-1.5 opacity-60" />}
                                                    <span className="truncate">{m.label}</span>
                                                </button>
                                                {m.id !== 'none' && (
                                                    <div className="flex space-x-0.5">
                                                        <button 
                                                            onClick={() => previewAtmos(m)}
                                                            className={`p-2 rounded-lg border transition-all ${playingAtmosId === m.id ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-400 border-slate-200 hover:bg-rose-50 hover:text-rose-500'}`}
                                                            title="Listen to preview"
                                                        >
                                                            {playingAtmosId === m.id ? <VolumeX size={14} /> : <Volume1 size={14} />}
                                                        </button>
                                                        {m.id.startsWith('custom_') && (
                                                            <button 
                                                                onClick={() => removeCustomTrack(m.id)}
                                                                className="p-2 bg-white text-slate-300 border border-slate-200 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/track:opacity-100"
                                                                title="Remove track"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedMusic !== 'none' && (
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase">
                                                <span>Music Volume</span>
                                                <span>{Math.round(musicVolume * 100)}%</span>
                                            </div>
                                            <input 
                                                type="range" min="0" max="0.5" step="0.01" 
                                                value={musicVolume} 
                                                onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                                className="w-full h-1 bg-indigo-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    <FadeIn className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                            <CircleDollarSign className="text-amber-500" size={18} />
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Monetization</h3>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="flex items-center justify-between cursor-pointer">
                                <div>
                                    <span className="block text-xs font-bold text-slate-700">Premium Production</span>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Requires Payment</span>
                                </div>
                                <input 
                                    type="checkbox" 
                                    checked={isPremium} 
                                    onChange={(e) => setIsPremium(e.target.checked)} 
                                    className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 border-slate-300 shadow-sm" 
                                />
                            </label>
                            <AnimatePresence>
                                {isPremium && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                        <div className="mt-6 space-y-4 pt-4 border-t border-slate-200">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pricing (USD)</label>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-slate-400 font-mono text-sm">$</span>
                                                    <input 
                                                        type="number" 
                                                        value={price} 
                                                        onChange={(e) => setPrice(e.target.value)} 
                                                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-amber-500 outline-none" 
                                                        step="0.01" 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center">
                                                    <ExternalLink size={10} className="mr-1" />
                                                    Payhip Product Link
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={payhipUrl} 
                                                    onChange={(e) => setPayhipUrl(e.target.value)} 
                                                    placeholder="https://payhip.com/b/XXXX"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-amber-500 outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-rose-500 uppercase mb-1 flex items-center">
                                                    <Key size={10} className="mr-1" />
                                                    Access Unlock Code
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={unlockPassword} 
                                                    onChange={(e) => setUnlockPassword(e.target.value)} 
                                                    placeholder="Secret code for customers"
                                                    className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-rose-500 outline-none" 
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </FadeIn>

                    {audioBase64 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-rose-600 p-8 rounded-[2rem] text-white shadow-2xl shadow-rose-900/20">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="p-3 bg-white/20 rounded-2xl"><Disc className="text-white animate-spin-slow" size={24} /></div>
                                <div>
                                    <h4 className="font-bold text-lg">Production Mix Ready</h4>
                                    <p className="text-rose-200 text-xs uppercase tracking-widest font-bold">Narration + Music synced</p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={playMixedAudio}
                                disabled={isPreviewLoading}
                                className="w-full bg-white text-rose-600 py-4 rounded-2xl font-black shadow-lg hover:bg-rose-50 transition-all flex items-center justify-center group disabled:opacity-50"
                            >
                                {isPreviewLoading ? (
                                    <Loader2 className="animate-spin mr-2" size={20} />
                                ) : (
                                    isPlaying ? <Pause className="mr-2" size={20} /> : <Play className="mr-2 fill-current" size={20} />
                                )}
                                {isPreviewLoading ? 'Synthesizing...' : isPlaying ? 'Stop Preview' : 'Preview Final Mix'}
                            </button>
                        </motion.div>
                    )}
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Production Title</label>
                              <input 
                                  type="text" 
                                  value={title} 
                                  onChange={(e) => setTitle(e.target.value)}
                                  placeholder="The Healing Power of Music..."
                                  className="w-full text-2xl font-serif font-bold text-slate-900 border-b border-slate-100 focus:border-rose-300 py-2 placeholder-slate-200 outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 flex items-center">
                                <ImageIcon size={12} className="mr-1" /> Featured Image URL
                              </label>
                              <input 
                                  type="text" 
                                  value={featureImageUrl} 
                                  /* FIX: Change setHeaderImageUrl to setFeatureImageUrl */
                                  onChange={(e) => setFeatureImageUrl(e.target.value)}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full text-sm font-bold text-slate-700 border-b border-slate-100 focus:border-indigo-300 py-2 placeholder-slate-200 outline-none"
                              />
                          </div>
                        </div>

                        {featureImageUrl && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 overflow-hidden rounded-2xl shadow-inner border border-slate-100">
                                <img src={featureImageUrl} className="w-full h-32 object-cover opacity-80" alt="Preview" />
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 mb-6">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 flex items-center">
                                <Settings2 size={12} className="mr-1" /> Production Focus
                            </label>
                            <input 
                                type="text" 
                                value={crewInstructions} 
                                onChange={(e) => setCrewInstructions(e.target.value)}
                                placeholder="e.g. Deep insight into modern loneliness..."
                                className="w-full text-sm font-bold text-slate-700 border-b border-slate-100 focus:border-indigo-300 py-2 placeholder-slate-200 outline-none"
                            />
                        </div>

                        <div className="bg-slate-900 rounded-3xl p-6 mb-6 font-mono text-[10px] text-slate-400 overflow-hidden relative shadow-inner">
                            <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2">
                                <Terminal size={12} className="text-rose-500" />
                                <span className="uppercase font-bold tracking-[0.2em] text-rose-500">Live_Production_Stream</span>
                            </div>
                            <div className="space-y-1.5 h-[120px] overflow-y-auto custom-scrollbar">
                                {missionLog.map((log, i) => (
                                    <div key={i} className="flex">
                                        <span className="text-slate-700 mr-2">{">"}</span>
                                        <span className={log.includes("ERROR") ? "text-red-400 font-bold" : ""}>{log}</span>
                                    </div>
                                ))}
                                {isMissionRunning && <div className="animate-pulse text-indigo-400 italic">Crew collaborating in the cloud veil...</div>}
                                {isGenerating && <div className="animate-pulse text-rose-400 italic">Synthesizing vocal layers...</div>}
                                {quotaError && <div className="text-amber-500 font-bold mt-2">AGENT_INTERRUPTED: Quota Reached. Standby for sync.</div>}
                            </div>
                        </div>

                        <div className="flex-grow flex flex-col min-h-[400px]">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Narration Script</label>
                                <button 
                                    onClick={handleRunCrewMission}
                                    disabled={isMissionRunning || !title}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 disabled:opacity-50"
                                >
                                    {isMissionRunning ? <Loader2 size={12} className="animate-spin mr-2" /> : <Sparkles size={12} className="mr-2" />}
                                    Deploy Script Crew
                                </button>
                            </div>
                            <textarea 
                                value={script} 
                                onChange={(e) => setScript(e.target.value)}
                                placeholder={isDuoMode ? "SpeakerA: Welcome to the show!\nSpeakerB: Great to be here..." : "Start writing or deploy the crew to generate a script..."}
                                className="flex-grow w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-lg font-light leading-relaxed text-slate-700 focus:ring-4 focus:ring-rose-500/5 outline-none resize-none transition-all"
                            />
                        </div>

                        <div className="mt-8 flex justify-center">
                            <button 
                                onClick={handleGenerateAudio}
                                disabled={isGenerating || !script}
                                className="group relative bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl shadow-slate-900/20 transition-all flex items-center transform active:scale-95 disabled:opacity-50"
                            >
                                {isGenerating ? <Loader2 className="animate-spin mr-3" /> : <Volume2 className="mr-3" />}
                                {isGenerating ? 'Synthesizing Voices...' : 'Manifest AI Audio'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAudioStudio;
