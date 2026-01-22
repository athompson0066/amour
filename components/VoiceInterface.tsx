
import React, { useEffect, useRef, useState } from 'react';
import { Agent } from '../types';
import { Mic, MicOff, PhoneOff, Volume2, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { config } from '../config';

interface VoiceInterfaceProps {
  agent: Agent;
  onEndCall: () => void;
}

// --- Audio Utils from Gemini Documentation ---

function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    const u8 = new Uint8Array(int16.buffer);
    
    // Manual Base64 Encode since btoa expects string
    let binary = '';
    const len = u8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(u8[i]);
    }
    
    return {
        data: btoa(binary),
        mimeType: 'audio/pcm;rate=16000',
    } as any; // Cast to satisfy strict Blob type if needed, or adjust
}

function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

// --- Component ---

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ agent, onEndCall }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'ended'>('connecting');
    const [errorMsg, setErrorMsg] = useState('');
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    
    // Refs for Audio Contexts and Stream Management
    const inputContextRef = useRef<AudioContext | null>(null);
    const outputContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const sessionRef = useRef<any>(null); // To store the Gemini session object
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    useEffect(() => {
        let mounted = true;

        const startSession = async () => {
            try {
                // 1. Initialize Audio Contexts
                const InputContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const inputContext = new InputContextClass({ sampleRate: 16000 });
                inputContextRef.current = inputContext;

                const OutputContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const outputContext = new OutputContextClass({ sampleRate: 24000 });
                outputContextRef.current = outputContext;

                // 2. Get Microphone Stream
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                // 3. Connect to Gemini Live API
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                
                // Use custom instructions if defined, else fallback to auto-generated one
                const systemInstruction = agent.systemInstruction || `You are ${agent.name}, a ${agent.role}. ${agent.description}. Be empathetic, professional, and concise. This is a voice call, so keep responses relatively short and conversational.`;

                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: {
                            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // Choices: Puck, Charon, Kore, Fenrir, Zephyr
                        },
                        systemInstruction,
                    },
                    callbacks: {
                        onopen: () => {
                            if (!mounted) return;
                            setStatus('connected');
                            
                            // Setup Audio Input Processing
                            const source = inputContext.createMediaStreamSource(stream);
                            const scriptProcessor = inputContext.createScriptProcessor(4096, 1, 1);
                            
                            scriptProcessor.onaudioprocess = (e) => {
                                if (isMuted) return; // Don't send data if muted locally
                                
                                const inputData = e.inputBuffer.getChannelData(0);
                                const pcmBlob = createBlob(inputData);
                                
                                // CRITICAL: Solely rely on sessionPromise resolves and then call `session.sendRealtimeInput`
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };

                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputContext.destination);
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (!mounted) return;

                            // Handle Audio Output
                            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (base64Audio) {
                                setIsAgentSpeaking(true);
                                
                                // Reset "Agent Speaking" visual after a delay if no new audio comes
                                // (Simplistic visualizer logic)
                                setTimeout(() => { if(mounted) setIsAgentSpeaking(false); }, 1000);

                                const ctx = outputContextRef.current;
                                if (!ctx) return;

                                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                                
                                const audioBuffer = await decodeAudioData(
                                    decode(base64Audio),
                                    ctx,
                                    24000,
                                    1
                                );

                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);
                                
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    // if (sourcesRef.current.size === 0) setIsAgentSpeaking(false);
                                });

                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }
                            
                            // Handle Interruption
                            if (message.serverContent?.interrupted) {
                                sourcesRef.current.forEach(src => {
                                    try { src.stop(); } catch(e){}
                                });
                                sourcesRef.current.clear();
                                nextStartTimeRef.current = 0;
                                setIsAgentSpeaking(false);
                            }
                        },
                        onclose: () => {
                            if(mounted) setStatus('ended');
                        },
                        onerror: (e) => {
                            console.error("Gemini Live Error:", e);
                            if(mounted) {
                                setStatus('error');
                                setErrorMsg("Connection lost.");
                            }
                        }
                    }
                });

                sessionRef.current = sessionPromise;

            } catch (err: any) {
                console.error("Failed to start voice session:", err);
                if(mounted) {
                    setStatus('error');
                    setErrorMsg(err.message || "Could not access microphone or API.");
                }
            }
        };

        startSession();

        return () => {
            mounted = false;
            // Cleanup logic
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (inputContextRef.current) inputContextRef.current.close();
            if (outputContextRef.current) outputContextRef.current.close();
            
            // Note: The SDK doesn't expose a clean '.close()' on the session promise result easily 
            // without awaiting it, but browser cleanup of websocket usually handles it.
        };
    }, [agent, isMuted]);

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/30 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 w-full text-center">
                <h3 className="text-white/60 text-sm font-medium uppercase tracking-widest">Amour Audio Call</h3>
                {status === 'error' && (
                    <div className="mt-4 flex items-center justify-center text-red-400 bg-red-900/20 py-2 px-4 rounded-full mx-auto w-fit">
                        <AlertCircle size={16} className="mr-2" />
                        {errorMsg}
                    </div>
                )}
            </div>

            {/* Main Visual */}
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                    {/* Pulsing Rings (Visualizer) */}
                    {status === 'connected' && (
                        <>
                            <div className={`absolute inset-0 rounded-full bg-rose-500/20 blur-xl transition-all duration-300 ${isAgentSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}></div>
                            <div className={`absolute inset-0 rounded-full bg-rose-400/20 blur-2xl transition-all duration-500 delay-75 ${isAgentSpeaking ? 'scale-[2] opacity-80' : 'scale-100 opacity-10'}`}></div>
                        </>
                    )}
                    
                    {/* Avatar */}
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-20">
                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30">
                        {status === 'connecting' && (
                            <div className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-white/10">
                                <Loader2 className="animate-spin text-rose-500" size={12} />
                                <span>Connecting...</span>
                            </div>
                        )}
                         {status === 'connected' && (
                            <div className="flex items-center space-x-2 bg-emerald-900/80 text-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-emerald-500/30">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span>Live Audio</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <h2 className="text-3xl font-serif font-bold text-white mb-2">{agent.name}</h2>
                    <p className="text-rose-300 font-medium">{agent.role}</p>
                </div>
            </div>

            {/* Controls */}
            <div className="relative z-10 w-full max-w-sm">
                <div className="flex items-center justify-between px-8">
                     {/* Mute Button */}
                    <button 
                        onClick={handleToggleMute}
                        className={`p-4 rounded-full transition-all ${
                            isMuted 
                            ? 'bg-white text-slate-900' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    >
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>

                    {/* End Call Button */}
                    <button 
                        onClick={onEndCall}
                        className="p-6 bg-red-600 rounded-full text-white hover:bg-red-700 shadow-lg hover:scale-105 transition-all"
                    >
                        <PhoneOff size={32} />
                    </button>

                     {/* Placeholder Speaker Button */}
                    <button className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                        <Volume2 size={24} />
                    </button>
                </div>
                <p className="text-center text-slate-500 text-xs mt-8">
                    {agent.price} • Encrypted Connection
                </p>
            </div>
        </div>
    );
};

export default VoiceInterface;
