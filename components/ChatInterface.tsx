
import React, { useState, useRef, useEffect } from 'react';
import { Agent, User } from '../types';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Loader2, Globe, Eye, Brain, Search, Database, Zap, AlertCircle } from 'lucide-react';
import { getAgentChatResponse } from '../services/geminiService';
import { getCurrentUser, updateUser } from '../services/authService';

interface ChatInterfaceProps {
  agent: Agent;
  onBack: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agent, onBack }) => {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello, I'm ${agent.name}. I specialize in ${agent.role.toLowerCase()}. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    if (!user || user.tokens < agent.tokenCost) {
        setError(`Insufficient tokens. This session costs ${agent.tokenCost} tokens per message.`);
        return;
    }

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const responseText = await getAgentChatResponse(agent, userMessage.text, history);

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentResponse]);
      
      // Deduct Tokens
      const updatedUser = { ...user, tokens: user.tokens - agent.tokenCost };
      await updateUser(updatedUser);
      setUser(updatedUser);

    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-50">
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3 text-slate-500 hover:text-slate-800 p-1 rounded-full hover:bg-slate-100">
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
            {agent.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
            <div className="flex items-center space-x-2">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{agent.role}</p>
                <div className="flex items-center bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <Zap size={8} className="text-amber-500 fill-current mr-1" />
                    <span className="text-[8px] font-black text-amber-700 uppercase tracking-tighter">{agent.tokenCost} / Msg</span>
                </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
           <div className="hidden sm:flex flex-col items-end">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available</span>
               <span className="text-xs font-bold text-slate-700">{user?.tokens || 0} Tokens</span>
           </div>
           <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><MoreVertical size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] md:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm ${
                isUser 
                  ? 'bg-rose-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div className={`text-[10px] mt-1 text-right ${isUser ? 'text-rose-200' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          );
        })}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center space-x-1">
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="px-4 py-2 bg-amber-50 border-t border-amber-100 flex items-center text-amber-700 text-xs font-bold justify-center space-x-2">
            <AlertCircle size={14} />
            <span>{error}</span>
            <button onClick={onBack} className="underline text-amber-800 ml-2">Recharge Now</button>
        </div>
      )}

      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-slate-100 rounded-3xl p-2 border border-slate-200 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Ask ${agent.name.split(' ')[0]} for advice...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 py-3 px-4"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping || (user ? user.tokens < agent.tokenCost : true)}
            className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-30 transition-colors shadow-md flex items-center justify-center min-w-[48px]"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
