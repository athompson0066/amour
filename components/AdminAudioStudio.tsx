
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Mic2, Play, Pause, Save, ArrowLeft, Loader2, Sparkles, Headphones, 
    User, Globe, Volume2, Trash2, Rocket, FileText, ChevronRight, CheckCircle2,
    Music, Users, Radio, ToggleLeft, ToggleRight, Mic, Layout, Terminal, Settings2, Sliders, Disc, AlertTriangle, Image as ImageIcon, Volume1, VolumeX, Upload, FileAudio, CircleDollarSign, ExternalLink, Key, Search
} from 'lucide-react';
import { generateNarration, runAudioCrewMission, generateSEOMetadata } from '../services/geminiService';
import { savePost, DEFAULT_AUTHOR } from '../services/storage';
import { Post, ContentType, SEOMetadata } from '../types';
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

    // SEO States
    const [seo, setSeo] = useState<SEOMetadata>({
        metaTitle: '',
        metaDescription: '',
        focusKeywords: '',
    });
    const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

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

    const [customTracks, setCustomTracks] = useState<{ id: string, label: string, url: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const voiceSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const musicSourceRef = useRef<AudioBufferSourceNode | null>(null);
    
    const previewAudioRef = useRef<HTMLAudioElement | null>(null);
    const [playingAtmosId, setPlayingAtmosId] = useState<string | null>(null);

    const combinedMusicList = [...PRESET_MUSIC, ...customTracks];

    const handleMagicSEO = async () => {
        if (!title) return alert("Title required.");
        setIsGeneratingSEO(true);
        try {
            const data = await generateSEOMetadata(title, script.substring(0, 300), "Podcast Episode");
            if (data) setSeo(data);
        } catch (e) {} finally {
            setIsGeneratingSEO(false);
        }
    };

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

    const previewAtmos = (track: { id: string, url: string }) => {
        if (playingAtmosId === track.id) {
            stopAllAudio();
            return;
        }
        stopAllAudio();
        setPlayingAtmosId(track.id);
        const audio = new Audio(track.url);
        audio.loop = true;
        audio.play().catch(e => setPlayingAtmosId(null));
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
            const result = await runAudioCrewMission(title, isDuoMode, personaPrompt, crewInstructions);
            if (result.startsWith("ERROR:")) {
              if (result.includes("Quota")) setQuotaError(true);
              throw new Error(result);
            }
            setScript(result);
            setMissionLog(prev => [...prev, "Mission Complete: Script successfully manifested."]);
        } catch (e: any) {
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
                     if (result.includes("Quota")) setQuotaError(true);
                     return;
                }
                setAudioBase64(result);
                setMissionLog(prev => [...prev, "Synthesizer: Audio manifestation success."]);
            }
        } catch (e: any) {
            const msg = e?.message || "Generation failed.";
            setMissionLog(prev => [...prev, `ERROR: ${msg}`]);
        } finally {
            setIsGenerating(false);
        }
    };

    const playMixedAudio = async () => {
        if (!audioBase64) return;
        if (isPlaying) { stopAllAudio(); return; }
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
                        const musicResponse = await fetch(musicTrack.url, { method: 'GET', mode: 'cors', credentials: 'omit' });
                        const musicArrayBuffer = await musicResponse.arrayBuffer();
                        musicBufferToPlay = await ctx.decodeAudioData(musicArrayBuffer);
                        audioBufferCache[musicTrack.url] = musicBufferToPlay;
                    }
                } catch (musicErr) {}
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
            voiceSource.onended = () => { setIsPlaying(false); };
            voiceSourceRef.current = voiceSource;
            voiceSource.start(0);
            setIsPlaying(true);
        } catch (e) {} finally {
            setIsPreviewLoading(false);
        }
    };

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
                    { id: 'audio_block', type: 'audio', content: audioBase64, meta: { audioTitle: title, voiceName: voiceNames, bgMusicTrack: selectedMusic !== 'none' ? selectedMusic : undefined, bgMusicVolume: musicVolume } },
                    { id: 'text_block', type: 'text', content: script }
                ],
                seo: (seo.metaTitle || seo.metaDescription) ? seo : undefined
            };
            await savePost(newPost);
            onPublished();
            onBack();
        } catch (e) {
            console.error(e);
        } finally {
            setIsPublishing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="bg-white border-b border-slate-200 sticky top-16 z-40 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ArrowLeft size={20} /></button>
                    <h2 className="text-xl font-bold flex items-center text-slate-800"><Mic2 className="mr-2 text-rose-500" size={20} />Audio Studio</h2>
                </div>
                <button onClick={handlePublish} disabled={!audioBase64 || isPublishing || !title} className="bg-slate-900 text-white px-8 py-2.5 rounded-full font-bold flex items-center hover:bg-slate-800 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10">
                    {isPublishing ? <Loader2 className="animate-spin mr-2" size={18} /> : <Rocket className="mr-2" size={18} />}Publish
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    {/* SEO for Podcast */}
                    <FadeIn className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center"><Search size={14} className="mr-2 text-indigo-500" /> Podcast Visibility</h3>
                            <button onClick={handleMagicSEO} disabled={isGeneratingSEO || !title} className="text-indigo-600">
                                {isGeneratingSEO ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input type="text" value={seo.metaTitle} onChange={(e) => setSeo({...seo, metaTitle: e.target.value})} placeholder="SEO Episode Title..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-400 outline-none" />
                            <textarea value={seo.metaDescription} onChange={(e) => setSeo({...seo, metaDescription: e.target.value})} placeholder="Episode search description..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-400 outline-none h-16 resize-none" />
                        </div>
                    </FadeIn>

                    <FadeIn className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center"><Users className="mr-2 text-rose-500" size={14} />Cast & Mood</h3>
                            <button onClick={() => setIsDuoMode(!isDuoMode)} className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${isDuoMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                                {isDuoMode ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}<span>{isDuoMode ? 'Duo' : 'Solo'}</span>
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Narrator</label>
                                <div className="space-y-1.5">
                                    {VOICES.map(v => (
                                        <button key={v.id} onClick={() => setSelectedVoiceA(v.id)} className={`w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedVoiceA === v.id ? 'bg-rose-600 border-rose-600 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-rose-300'}`}>
                                            <div className="text-left"><div>{v.label}</div><div className={`text-[8px] font-normal uppercase ${selectedVoiceA === v.id ? 'text-rose-100' : 'text-slate-400'}`}>{v.desc}</div></div>
                                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${selectedVoiceA === v.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>{v.gender}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>

                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm h-full flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1">Production Title</label>
                              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The Healing Power of Music..." className="w-full text-2xl font-serif font-bold text-slate-900 border-b border-slate-100 focus:border-rose-300 py-2 placeholder-slate-200 outline-none" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1 flex items-center"><ImageIcon size={12} className="mr-1" /> Cover Image URL</label>
                              <input type="text" value={featureImageUrl} onChange={(e) => setFeatureImageUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="w-full text-sm font-bold text-slate-700 border-b border-slate-100 focus:border-indigo-300 py-2 placeholder-slate-200 outline-none" />
                          </div>
                        </div>
                        <div className="bg-slate-900 rounded-3xl p-6 mb-6 font-mono text-[10px] text-slate-400 h-[150px] overflow-y-auto custom-scrollbar shadow-inner">
                            <div className="flex items-center space-x-2 mb-4 border-b border-white/5 pb-2"><Terminal size={12} className="text-rose-500" /><span className="uppercase font-bold tracking-[0.2em] text-rose-500">Live_Production_Stream</span></div>
                            {missionLog.map((log, i) => <div key={i} className="flex"><span className="text-slate-700 mr-2">{">"}</span>{log}</div>)}
                        </div>
                        <div className="flex-grow flex flex-col min-h-[400px]">
                            <div className="flex items-center justify-between mb-4">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Narration Script</label>
                                <button onClick={handleRunCrewMission} disabled={isMissionRunning || !title} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest flex items-center hover:bg-indigo-700 shadow-lg disabled:opacity-50">
                                    {isMissionRunning ? <Loader2 size={12} className="animate-spin mr-2" /> : <Sparkles size={12} className="mr-2" />}Deploy Script Crew
                                </button>
                            </div>
                            <textarea value={script} onChange={(e) => setScript(e.target.value)} placeholder="Start writing or deploy the crew..." className="flex-grow w-full bg-slate-50 border border-slate-100 rounded-3xl p-8 text-lg font-light leading-relaxed text-slate-700 outline-none resize-none transition-all" />
                        </div>
                        <div className="mt-8 flex justify-center">
                            <button onClick={handleGenerateAudio} disabled={isGenerating || !script} className="group relative bg-slate-900 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl transition-all flex items-center transform active:scale-95 disabled:opacity-50">
                                {isGenerating ? <Loader2 className="animate-spin mr-3" /> : <Volume2 className="mr-3" />}Manifest AI Audio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAudioStudio;
