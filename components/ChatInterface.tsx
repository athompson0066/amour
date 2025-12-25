import React, { useState, useRef, useEffect } from 'react';
import { Agent } from '../types';
import { Send, ArrowLeft, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';
import { getAgentChatResponse } from '../services/geminiService';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

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
      // Prepare history for API (excluding the welcome message if it was hardcoded/not part of context, 
      // but for simplicity we include the conversation flow)
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
      {/* Chat Header */}
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
            <p className="text-xs text-rose-500 font-medium">{agent.role}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-slate-400">
           <button className="p-2 hover:bg-slate-100 rounded-full"><Phone size={18} /></button>
           <button className="p-2 hover:bg-slate-100 rounded-full"><Video size={18} /></button>
           <button className="p-2 hover:bg-slate-100 rounded-full"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
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
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
               <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto flex items-end space-x-2 bg-slate-100 rounded-3xl p-2 border border-slate-200 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={`Message ${agent.name}...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 resize-none max-h-32 py-3 px-4"
            rows={1}
            style={{ minHeight: '44px' }}
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
          >
            {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-xs text-slate-400">
             <span className="font-semibold text-rose-500">{agent.price}</span> applies per response. By chatting, you agree to our Terms.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
