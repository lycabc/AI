import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Mic,
    Send,
    Paperclip,
    User,
    Bot,
    MoreHorizontal,
    RotateCcw,
    Trash2,
    Headphones,
    AlertTriangle,
    BrainCircuit,
    Star,
    MapPin,
    CreditCard,
    Briefcase,
    Mail,
    Copy
} from 'lucide-react';
import { Button, Input, ConfigProvider, theme, Tooltip, message, Modal } from 'antd';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/Header/Header';
import useStore from '@/store/store';
import {
    postAiChat,
    postAiSpeechToText,
    getAiCaseList,
    getAiCaseDetail,
    postAiTextToSpeech,
    postAiCaseDelete,
    postAiRecommendLawyer
} from '@/services/api/aiApi';

import type { Message } from '@/store/slices/caseSlice';

interface LocalMessage extends Omit<Message, 'timestamp'> {
    timestamp: Date;
}

interface CaseItem {
    id: string;
    case_type: string;
    created_at: string;
}

const { TextArea } = Input;

interface Lawyer {
    id: number;
    name: string;
    email: string;
    expertise: string;
    price: string;
    rating: string;
    introduction: string;
    location: string;
    law_firm: string;
    firm_address: string;
}

export default function AIConsultationPage() {
    const { session_id, case_id, history_conversation } = useStore((state) => state.caseInfo);
    const addMessage = useStore((state) => state.addMessage);
    const changeCaseInfo = useStore((state) => state.changeCaseInfo);
    const navigate = useNavigate();

    const [messages, setMessages] = useState<LocalMessage[]>(() => {
        if (history_conversation && history_conversation.length > 0) {
            return history_conversation.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }) as LocalMessage);
        }
        return [{
            id: '1',
            role: 'assistant',
            content: "Hello! I've analyzed your case information regarding the contract dispute. I'm ready to provide a detailed legal consultation. How would you like to proceed?",
            timestamp: new Date(),
        }];
    });

    const [inputValue, setInputValue] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isVoiceMode, setIsVoiceMode] = useState(false);
    const [caseList, setCaseList] = useState<CaseItem[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Recommended Lawyer State
    const [recommendedLawyer, setRecommendedLawyer] = useState<Lawyer | null>(null);
    const [isRecommending, setIsRecommending] = useState(false);
    const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);

    // Fetch case list on mount
    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await getAiCaseList();
                if (res.status === 200) {
                    setCaseList(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch case list:", error);
            }
        };
        fetchCases();
    }, []);

    const handleLoadCase = async (id: string) => {
        try {
            const res = await getAiCaseDetail(id);
            if (res.status === 200) {
                const data = res.data;
                const backendHistory = data.history_conversation || [];
                const mappedMessages: LocalMessage[] = backendHistory.map((item: any, index: number) => ({
                    id: `history-${index}`,
                    role: item.role === 'model' ? 'assistant' : 'user',
                    content: item.parts && item.parts[0] ? item.parts[0].text : '',
                    timestamp: new Date(data.created_at) // Approximate timestamp
                }));

                setMessages(mappedMessages);

                // Update global store with the loaded case info
                // Note: We might be missing a valid session_id for old cases if it wasn't persisted.
                // This updates the view but chatting might need a new session init logic if we want to resume.
                changeCaseInfo({
                    ...useStore.getState().caseInfo,
                    case_id: id,
                    case_type: data.case_type,
                    case_description: data.case_description,
                    location: data.location,
                    prosecute_date: data.prosecute_date,
                    history_conversation: mappedMessages.map(msg => ({
                        ...msg,
                        timestamp: msg.timestamp.toISOString()
                    }))
                });
            }
        } catch (error) {
            console.error("Failed to load case:", error);
            message.error("Failed to load conversation history");
        }
    };

    const handleDeleteCase = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setCaseToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!caseToDelete) return;

        try {
            const res = await postAiCaseDelete(caseToDelete);
            if (res.status === 200) {
                // Remove from list
                setCaseList(prev => prev.filter(c => c.id !== caseToDelete));

                // If current case is deleted, reset to new consultation
                if (case_id === caseToDelete) {
                    useStore.getState().resetCaseInfo();
                    setMessages([{
                        id: '1',
                        role: 'assistant',
                        content: "The previous case has been deleted. I'm ready to start a new consultation.",
                        timestamp: new Date(),
                    }]);
                    navigate('/consultation');
                }
                message.success("Case deleted successfully");
            }
        } catch (error) {
            console.error("Failed to delete case:", error);
            message.error("Failed to delete case");
        } finally {
            setDeleteModalOpen(false);
            setCaseToDelete(null);
        }
    };

    // Sync initial message to store if store is empty
    useEffect(() => {
        if (history_conversation && history_conversation.length === 0 && messages.length > 0) {
            const now = new Date();
            addMessage({
                ...messages[0],
                timestamp: now.toISOString()
            });
        }
    }, []);

    // Safety check - if no case data, might want to redirect (omitted for brevity)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isThinking]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const now = new Date();
        const userMessage: LocalMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: now,
        };

        setMessages(prev => [...prev, userMessage]);
        addMessage({
            ...userMessage,
            timestamp: now.toISOString()
        });
        setInputValue('');
        setIsThinking(true);

        try {
            const res = await postAiChat(session_id, case_id, userMessage.content);
            if (res.status === 200) {
                const now = new Date();
                const aiMessage: LocalMessage = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: res.data.message,
                    timestamp: now,
                };
                setMessages(prev => [...prev, aiMessage]);
                addMessage({
                    ...aiMessage,
                    timestamp: now.toISOString()
                });

                // Clear thinking state immediately so text is visible while audio loads
                setIsThinking(false);

                // Voice Mode: Text to Speech
                if (isVoiceMode) {
                    try {
                        const audioRes = await postAiTextToSpeech(res.data.message);
                        if (audioRes.status === 200) {
                            // Blob response handling
                            const audioBlob = new Blob([audioRes.data], { type: 'audio/wav' });
                            const audioUrl = URL.createObjectURL(audioBlob);
                            const audio = new Audio(audioUrl);
                            audio.play();
                        }
                    } catch (audioErr) {
                        console.error("TTS failed", audioErr);
                    }
                }
            }
        } catch (error) {
            console.error(error);
            const errorMessage: LocalMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I encountered an error receiving the response.",
                timestamp: new Date(),
                status: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
            message.error("Failed to get AI response.");
        } finally {
            setIsThinking(false);
        }
    };

    const toggleVoice = async () => {
        if (isListening) {
            // Stop recording
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
                setIsListening(false);
            }
        } else {
            // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); // or 'audio/webm' depending on browser
                    const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });

                    try {
                        const res = await postAiSpeechToText(audioFile);
                        if (res.status === 200 && res.data.text) {
                            setInputValue(prev => prev + (prev ? ' ' : '') + res.data.text);
                        }
                    } catch (error) {
                        console.error("Transcription failed", error);
                        message.error("Failed to transcribe audio.");
                    } finally {
                        stream.getTracks().forEach(track => track.stop()); // Stop stream
                    }
                };

                mediaRecorder.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                message.error("Could not access microphone.");
            }
        }
    };

    const handleGetRecommendation = async () => {
        if (!case_id) {
            message.warning("Please start a consultation first.");
            return;
        }

        setIsRecommending(true);
        try {
            const res = await postAiRecommendLawyer(case_id);
            if (res.status === 200 && res.data.lawyer) {
                setRecommendedLawyer(res.data.lawyer);
                setIsLawyerModalOpen(true);
            } else {
                message.error("Failed to get lawyer recommendation.");
            }
        } catch (error) {
            console.error("Recommendation failed:", error);
            message.error("An error occurred while fetching the recommendation.");
        } finally {
            setIsRecommending(false);
        }
    };

    const renderLawyerModal = () => {
        if (!recommendedLawyer) return null;

        return (
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        colorBgElevated: 'transparent',
                    },
                }}
            >
                <Modal
                    title={null}
                    open={isLawyerModalOpen}
                    onCancel={() => setIsLawyerModalOpen(false)}
                    footer={null}
                    width={560}
                    centered
                    styles={{
                        mask: { backdropFilter: 'blur(10px)', backgroundColor: 'rgba(0,0,0,0.6)' },
                        body: { padding: 0, backgroundColor: 'transparent' }
                    }}
                    className="lawyer-modal"
                    closeIcon={null}
                >
                    <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl relative">
                        {/* Close Button Trigger */}
                        <div
                            onClick={() => setIsLawyerModalOpen(false)}
                            className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-all z-20"
                        >
                            <AlertTriangle size={16} className="rotate-180" /> {/* Using AlertTriangle as a placeholder for simpler X if I don't want to import X again, but I should probably just check if X is available or use a simple div */}
                        </div>

                        {/* Header with Gradient */}
                        <div className="h-40 bg-gradient-to-br from-blue-600/30 via-indigo-600/10 to-transparent p-10 flex items-end">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl border border-white/20">
                                    <Briefcase size={40} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{recommendedLawyer.name}</h3>
                                    <p className="text-blue-400 text-base flex items-center gap-2 font-medium">
                                        <Star size={18} fill="currentColor" />
                                        {recommendedLawyer.rating} <span className="text-slate-600">|</span> {recommendedLawyer.law_firm}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 pt-8 space-y-10">
                            {/* Tags / Info Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                                        <BrainCircuit size={14} className="text-blue-500" />
                                        Expertise Area
                                    </p>
                                    <p className="text-base text-slate-200 font-medium italic">{recommendedLawyer.expertise.split(',').join(' · ')}</p>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold flex items-center gap-2 group-hover:text-emerald-400 transition-colors">
                                        <CreditCard size={14} className="text-emerald-500" />
                                        Rate Estimate
                                    </p>
                                    <p className="text-base text-slate-200 font-medium">{recommendedLawyer.price}</p>
                                </div>
                            </div>

                            {/* Introduction */}
                            <div className="relative group">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4 font-bold">Professional Profile</p>
                                <div className="text-slate-300 text-base leading-relaxed bg-white/5 p-6 rounded-3xl border border-white/5 group-hover:border-white/10 transition-colors">
                                    {recommendedLawyer.introduction}
                                </div>
                            </div>

                            {/* Contact & Location Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-white/10 transition-colors group">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold flex items-center gap-2 group-hover:text-red-400 transition-colors">
                                        <MapPin size={14} className="text-red-400" />
                                        Location
                                    </p>
                                    <p className="text-base text-slate-200 font-medium">{recommendedLawyer.location}</p>
                                    <p className="text-xs text-slate-500 truncate mt-1">{recommendedLawyer.firm_address}</p>
                                </div>
                                <Tooltip title="Click to copy email">
                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(recommendedLawyer.email);
                                            message.success("Email copied to clipboard");
                                        }}
                                        className="bg-white/5 rounded-3xl p-6 border border-white/5 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all group cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4 text-slate-600 group-hover:text-blue-400 transition-colors">
                                            <Copy size={14} />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-3 font-bold flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                                            <Mail size={14} className="text-indigo-400" />
                                            Contact Email
                                        </p>
                                        <p className="text-sm text-slate-200 font-medium break-all">{recommendedLawyer.email}</p>
                                        <p className="text-xs text-slate-500 mt-1">Direct Communication</p>
                                    </div>
                                </Tooltip>
                            </div>

                            {/* Footer Action */}
                            <div className="flex gap-4 pt-6 pb-2">
                                <Button
                                    onClick={() => setIsLawyerModalOpen(false)}
                                    className="flex-1 h-14 rounded-2xl bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 font-bold transition-all"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<Copy size={20} />}
                                    onClick={() => {
                                        navigator.clipboard.writeText(recommendedLawyer.email);
                                        message.success("Email address copied to clipboard!");
                                    }}
                                    className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 border-none font-extrabold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                                >
                                    Copy Email Address
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </ConfigProvider>
        );
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#3b82f6',
                    borderRadius: 16,
                },
            }}
        >
            <div className="flex flex-col h-screen bg-[#020617] text-slate-200 overflow-hidden">
                <Header />

                <div className="flex flex-1 pt-20 overflow-hidden">
                    {/* Sidebar - Desktop Only */}
                    <aside className="hidden lg:flex w-72 border-r border-white/5 bg-[#0b192c]/30 flex-col p-6 space-y-6">
                        <Button
                            className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-600/10 border-blue-500/20 text-blue-400 font-bold hover:bg-blue-600/20 transition-all"
                            icon={<RotateCcw size={18} />}
                            onClick={() => {
                                useStore.getState().resetCaseInfo();
                                navigate('/case-info');
                            }}
                        >
                            New Consultation
                        </Button>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold px-2 mb-4">Recent Sessions</p>
                            {caseList.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleLoadCase(item.id)}
                                    className={`p-3 rounded-xl hover:bg-white/5 cursor-pointer text-sm text-slate-400 flex items-center gap-3 transition-colors group relative ${case_id === item.id ? 'bg-white/5' : ''}`}
                                >
                                    <MessageSquare size={16} className="text-slate-600 group-hover:text-blue-500 transition-colors shrink-0" />
                                    <div className="flex-1 truncate pr-8">
                                        <div className="truncate">{item.case_type}</div>
                                        <div className="text-xs text-slate-600">{new Date(item.created_at).toLocaleDateString()}</div>
                                    </div>
                                    <div
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                                        onClick={(e) => handleDeleteCase(e, item.id)}
                                    >
                                        <Trash2 size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </aside>

                    {/* Chat Area */}
                    <main className="flex-1 flex flex-col relative border-l border-white/5 bg-[#0b192c]/10">
                        {/* Status Bar */}
                        <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-slate-300">AI Legal Engine Active</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <Tooltip title={isVoiceMode ? "Disable Voice Mode" : "Enable Voice Mode"}>
                                    <div
                                        className={`cursor-pointer transition-colors p-2 rounded-full ${isVoiceMode ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
                                        onClick={() => setIsVoiceMode(!isVoiceMode)}
                                    >
                                        <Headphones size={18} />
                                    </div>
                                </Tooltip>
                                <Button
                                    type="text"
                                    loading={isRecommending}
                                    onClick={handleGetRecommendation}
                                    className="flex items-center gap-2 h-9 px-4 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold hover:bg-blue-600/20 transition-all"
                                    icon={<BrainCircuit size={14} />}
                                >
                                    Recommend Lawyer
                                </Button>
                                <MoreHorizontal size={18} className="text-slate-500 cursor-pointer hover:text-white" />
                            </div>
                        </div>

                        {/* Messages Content */}
                        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-8 custom-scrollbar">
                            <div className="max-w-3xl mx-auto space-y-10 pb-32">
                                <AnimatePresence initial={false}>
                                    {messages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'assistant'
                                                ? 'bg-blue-600/10 text-blue-500'
                                                : 'bg-indigo-600/10 text-indigo-400'
                                                }`}>
                                                {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
                                            </div>
                                            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div className={`p-4 md:p-6 rounded-[2rem] text-sm md:text-base leading-relaxed shadow-sm ${msg.role === 'assistant'
                                                    ? 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-none'
                                                    : 'bg-blue-600 border-none text-white rounded-tr-none'
                                                    }`}>
                                                    {msg.role === 'assistant' ? (
                                                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 prose-strong:text-white max-w-none text-sm md:text-base">
                                                            <ReactMarkdown>
                                                                {msg.content}
                                                            </ReactMarkdown>
                                                        </div>
                                                    ) : (
                                                        msg.content
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 mt-2 font-mono px-2">
                                                    {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {isThinking && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-6"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center shrink-0">
                                            <Bot size={20} />
                                        </div>
                                        <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] rounded-tl-none">
                                            <div className="flex gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
                            <div className="max-w-3xl mx-auto relative group">
                                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-[2rem] -z-10 group-hover:bg-blue-500/15 transition-all duration-500" />

                                <div className="glass-card flex items-end gap-3 p-4 rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
                                    <Tooltip title="Attach File">
                                        <Button
                                            type="text"
                                            className="text-slate-400 hover:text-white flex items-center justify-center h-10 w-10 rounded-full"
                                            icon={<Paperclip size={20} />}
                                        />
                                    </Tooltip>
                                    <TextArea
                                        autoSize={{ minRows: 1, maxRows: 6 }}
                                        placeholder="Discuss your case details..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onPressEnter={(e) => {
                                            if (!e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        className="bg-transparent border-none text-white focus:shadow-none placeholder:text-slate-400 py-2 text-base resize-none"
                                    />
                                    <div className="flex gap-3 items-center pb-1">
                                        <Tooltip title={isListening ? 'Stop Listening' : 'Start Voice'}>
                                            <button
                                                onClick={toggleVoice}
                                                className={`flex items-center justify-center h-10 w-10 rounded-full transition-all duration-200 border border-white/5 ${isListening
                                                    ? 'bg-red-500/20 text-red-400 animate-pulse border-red-500/30'
                                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white hover:border-white/20'
                                                    }`}
                                            >
                                                {isListening ? <MoreHorizontal size={20} /> : <Mic size={20} />}
                                            </button>
                                        </Tooltip>
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim()}
                                            className={`flex items-center justify-center h-10 w-10 rounded-full shadow-lg transition-all duration-200 ${inputValue.trim()
                                                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                                                : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                                }`}
                                        >
                                            <Send size={18} className={inputValue.trim() ? "ml-0.5" : ""} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-center text-[10px] text-slate-600 mt-4 uppercase tracking-[0.1em] font-medium">
                                    AI may produce inaccurate information about legal statutes.
                                </p>
                            </div>
                        </div>
                    </main>
                </div>

                {/* Delete Confirmation Modal */}
                <AnimatePresence>
                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setDeleteModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-sm bg-[#0b192c] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-red-500 to-red-500/50" />

                                <div className="flex flex-col items-center text-center space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                                        <AlertTriangle size={24} />
                                    </div>

                                    <h3 className="text-xl font-bold text-white">Delete Conversation?</h3>
                                    <p className="text-slate-400 text-sm">
                                        This action cannot be undone. The consultation history will be permanently removed.
                                    </p>

                                    <div className="flex gap-3 w-full mt-6">
                                        <Button
                                            onClick={() => setDeleteModalOpen(false)}
                                            className="flex-1 h-11 rounded-xl bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={confirmDelete}
                                            className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white border-none font-medium shadow-lg shadow-red-500/20"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {renderLawyerModal()}

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(255, 255, 255, 0.1);
                    }
                    .ant-input:focus, .ant-input-focused {
                        background: transparent !important;
                        box-shadow: none !important;
                    }
                    .lawyer-modal .ant-modal-content {
                        background-color: transparent !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                    .lawyer-modal .ant-modal-body {
                        background-color: transparent !important;
                        padding: 0 !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
}
