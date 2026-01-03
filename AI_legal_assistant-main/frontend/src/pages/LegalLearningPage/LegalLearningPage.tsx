import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    User,
    Search,
    Filter,
    ArrowLeft,
    Share2,
    ThumbsUp,
    Info,
    CheckCircle2,
    Send,
    Bot,
    Loader2,
    BrainCircuit,
    CheckCircle,
    XCircle,
    ChevronRight,
    Trophy,
    RefreshCw
} from 'lucide-react';
import { Button, Empty, Pagination, Spin, Modal, message, ConfigProvider, theme } from 'antd';
import Header from '@/components/Header/Header';
import heroBg from '@/assets/hero_bg.png';
import { getLeasonList } from '@/services/api/learnApi';
import { postAiInitLeasonModel, postAiLeasonChat, postAiLeasonQuestion } from '@/services/api/aiApi';
import ReactMarkdown from 'react-markdown';

interface Video {
    id: number;
    title: string;
    video_url: string;
    leason_type: string;
    leason_description: string;
    created_at: string;
    updated_at: string;
}

interface ApiResponse {
    page: number;
    limit: number;
    total: number;
    leason_list: Video[];
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface QuizQuestion {
    question_number: number;
    question: string;
    options: {
        A: string;
        B: string;
        C: string;
    };
    answer: string;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80';
};

// Helper function to format date
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

// Hardcoded categories - known lesson types
const CATEGORIES = [
    "All",
    "UK Legal System",
    "Tort Law",
    "Property Law",
    "Human Rights & Constitutional Law"
];

export default function LegalLearningPage() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(12);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Chat state
    const [chatOpen, setChatOpen] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [initializingChat, setInitializingChat] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Quiz state
    const [quizOpen, setQuizOpen] = useState(false);
    const [quizLoading, setQuizLoading] = useState(false);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);

    // Fetch videos from API
    const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await getLeasonList(
                page,
                limit,
                activeCategory === "All" ? "" : activeCategory,
                searchQuery
            );
            const data: ApiResponse = response.data;
            setVideos(data.leason_list);
            setTotal(data.total);
        } catch (error) {
            console.error("Failed to fetch videos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize chat session when video is selected
    const initializeChat = async (videoId: number) => {
        setInitializingChat(true);
        setChatMessages([]);
        setSessionId(null);
        try {
            const response = await postAiInitLeasonModel(String(videoId));
            if (response.data.session_id) {
                setSessionId(response.data.session_id);
                setChatMessages([{
                    role: 'assistant',
                    content: `👋 Hi! I'm your AI assistant for this lesson. I can help you understand the key concepts, answer questions, and provide summaries about **"${selectedVideo?.title}"**. What would you like to know?`
                }]);
            }
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            setChatMessages([{
                role: 'assistant',
                content: "Sorry, I couldn't initialize the chat session. Please try again."
            }]);
        } finally {
            setInitializingChat(false);
        }
    };

    // Send chat message
    const sendMessage = async () => {
        if (!chatInput.trim() || !sessionId || chatLoading) return;

        const userMessage = chatInput.trim();
        setChatInput("");
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatLoading(true);

        try {
            const response = await postAiLeasonChat(sessionId, userMessage);
            if (response.data.message) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error. Please try again."
            }]);
        } finally {
            setChatLoading(false);
        }
    };

    // Generate Quiz
    const handleGenerateQuiz = async () => {
        if (!selectedVideo) return;
        setQuizLoading(true);
        setQuizOpen(true);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setScore(0);
        setQuizFinished(false);

        try {
            const response = await postAiLeasonQuestion(String(selectedVideo.id));
            if (response.data.questions) {
                setQuestions(response.data.questions);
            } else {
                message.error("Failed to generate questions. Please try again.");
                setQuizOpen(false);
            }
        } catch (error) {
            console.error("Failed to generate quiz:", error);
            message.error("An error occurred while generating the quiz.");
            setQuizOpen(false);
        } finally {
            setQuizLoading(false);
        }
    };

    const handleAnswerSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedAnswer(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentQuestionIndex];
        if (option === currentQuestion.answer) {
            setScore(prev => prev + 1);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setQuizFinished(true);
        }
    };

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // Initialize chat when opening
    useEffect(() => {
        if (chatOpen && selectedVideo && !sessionId) {
            initializeChat(selectedVideo.id);
        }
    }, [chatOpen, selectedVideo]);

    // Reset components when video changes
    useEffect(() => {
        setChatOpen(false);
        setSessionId(null);
        setChatMessages([]);
        setChatInput("");
        setQuizOpen(false);
    }, [selectedVideo]);

    // Fetch videos when page, category, or search changes
    useEffect(() => {
        fetchVideos();
    }, [page, activeCategory, searchQuery]);

    // Reset page when category or search changes
    useEffect(() => {
        setPage(1);
    }, [activeCategory, searchQuery]);

    // Reset scroll when switching views
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [selectedVideo]);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    };

    const renderQuizModal = () => {
        const currentQuestion = questions[currentQuestionIndex];

        return (
            <ConfigProvider
                theme={{
                    algorithm: theme.darkAlgorithm,
                    token: {
                        colorBgElevated: '#0f172a',
                    }
                }}
            >
                <Modal
                    open={quizOpen}
                    onCancel={() => setQuizOpen(false)}
                    footer={null}
                    width={720}
                    centered
                    closable={!quizLoading}
                    className="quiz-modal"
                    styles={{
                        mask: { backdropFilter: 'blur(8px)' },
                        body: { padding: 0 }
                    }}
                >
                    {/* Modal 容器 */}
                    <div className="flex flex-col bg-[#0f172a] rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[420px]">

                        {/* Loading */}
                        {quizLoading && (
                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                <RefreshCw size={48} className="text-blue-500 animate-spin mb-6" />
                                <h2 className="text-xl font-bold text-white mb-2">
                                    Generating Your Quiz
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    AI is creating questions based on this lesson
                                </p>
                            </div>
                        )}

                        {/* Finished */}
                        {!quizLoading && quizFinished && (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                                <Trophy size={72} className="text-yellow-400 mb-6" />
                                <h2 className="text-2xl font-black text-white mb-2">
                                    Quiz Completed
                                </h2>
                                <div className="text-5xl font-black text-blue-500 mb-4">
                                    {Math.round((score / questions.length) * 100)}%
                                </div>
                                <p className="text-slate-300 mb-8">
                                    You got <b>{score}</b> / <b>{questions.length}</b> correct
                                </p>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => setQuizOpen(false)}
                                    className="h-12 px-12 rounded-xl font-bold bg-blue-600 border-none"
                                >
                                    Close
                                </Button>
                            </div>
                        )}

                        {/* Question */}
                        {!quizLoading && !quizFinished && currentQuestion && (
                            <>
                                {/* Header */}
                                <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                            <BrainCircuit size={18} className="text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-sm">
                                                Knowledge Check
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                {selectedVideo?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">
                                        Question {currentQuestionIndex + 1} / {questions.length}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8">
                                    <h2 className="text-lg font-bold text-white mb-8 leading-relaxed">
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="space-y-4">
                                        {Object.entries(currentQuestion.options).map(([key, value]) => {
                                            const isCorrect = key === currentQuestion.answer;
                                            const isSelected = key === selectedAnswer;

                                            let classes =
                                                "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]";

                                            if (isAnswered) {
                                                if (isCorrect) {
                                                    classes = "bg-green-500/20 border-green-500/50 text-green-400";
                                                } else if (isSelected) {
                                                    classes = "bg-red-500/20 border-red-500/50 text-red-400";
                                                } else {
                                                    classes = "bg-white/[0.02] border-white/5 text-slate-500 opacity-60";
                                                }
                                            }

                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => handleAnswerSelect(key)}
                                                    disabled={isAnswered}
                                                    className={`w-full min-h-[64px] p-4 rounded-2xl border flex items-center gap-4 transition-all ${classes}`}
                                                >
                                                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm border border-white/20 shrink-0">
                                                        {key}
                                                    </div>
                                                    <span className="text-sm font-medium flex-1 text-left">
                                                        {value}
                                                    </span>
                                                    {isAnswered && isCorrect && (
                                                        <CheckCircle size={18} className="text-green-400" />
                                                    )}
                                                    {isAnswered && isSelected && !isCorrect && (
                                                        <XCircle size={18} className="text-red-400" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-white/[0.02]">
                                    <div className="text-xs font-medium px-3 py-1 rounded-lg bg-white/[0.04]">
                                        {isAnswered &&
                                            (selectedAnswer === currentQuestion.answer
                                                ? <span className="text-green-400">Correct answer</span>
                                                : <span className="text-red-400">
                                                    Correct: {currentQuestion.answer}
                                                </span>)
                                        }
                                    </div>

                                    <Button
                                        type="primary"
                                        disabled={!isAnswered}
                                        onClick={handleNextQuestion}
                                        className="h-11 px-8 rounded-xl font-bold bg-blue-600 border-none flex items-center gap-2"
                                    >
                                        {currentQuestionIndex === questions.length - 1
                                            ? 'Finish'
                                            : 'Next'}
                                        <ChevronRight size={16} />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </Modal>
            </ConfigProvider>
        );
    };


    const renderGrid = () => (
        <div className="flex flex-col h-full">
            {/* Categories */}
            <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-3 scrollbar-hide flex-shrink-0">
                <div className="flex items-center gap-2 mr-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                    <Filter size={14} /> Filter:
                </div>
                {CATEGORIES.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 border ${activeCategory === category
                            ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25 scale-105'
                            : 'bg-white/[0.03] text-slate-400 border-white/10 hover:bg-white/[0.06] hover:text-slate-200 hover:border-white/20'
                            }`}
                    >
                        {category}
                    </button>
                ))}
                <div className="w-full md:w-[400px] relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 text-slate-500 z-10" size={20} />
                        <input
                            type="text"
                            placeholder="Search tutorials, masterclasses..."
                            className="w-full h-10 pl-12 pr-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 hover:border-white/20 transition-all backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2" ref={scrollRef}>
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <Spin size="large" />
                        <p className="text-slate-500 mt-4">Loading videos...</p>
                    </div>
                ) : videos.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-8">
                            <AnimatePresence mode="popLayout">
                                {videos.map((video, index) => (
                                    <motion.div
                                        layout
                                        key={video.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        className="flex flex-col group cursor-pointer"
                                        onMouseEnter={() => setHoveredVideo(video.id)}
                                        onMouseLeave={() => setHoveredVideo(null)}
                                        onClick={() => setSelectedVideo(video)}
                                    >
                                        <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 shadow-xl bg-slate-800/50 border border-white/5">
                                            <img
                                                src={getYouTubeThumbnail(video.video_url)}
                                                alt={video.title}
                                                className={`w-full h-full object-cover transition-transform duration-700 ${hoveredVideo === video.id ? 'scale-110' : 'scale-100'}`}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                <div className="w-16 h-16 rounded-full bg-blue-600/90 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300 shadow-2xl shadow-blue-500/50">
                                                    <Play fill="white" className="text-white ml-1 w-7 h-7" />
                                                </div>
                                            </div>
                                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-blue-600/90 backdrop-blur-md rounded-lg text-xs font-bold text-white border border-blue-500/50 tracking-wide">
                                                {video.leason_type}
                                            </div>
                                        </div>
                                        <div className="flex gap-4 px-1">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                                                <User size={20} className="text-blue-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-slate-100 font-bold text-base leading-snug line-clamp-2 mb-1.5 group-hover:text-blue-400 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">
                                                    <span>{formatDate(video.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center py-8">
                            <Pagination
                                current={page}
                                total={total}
                                pageSize={limit}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                className="custom-pagination"
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <Empty description={<span className="text-slate-500">No masterclasses match your search</span>} />
                    </div>
                )}
            </div>
        </div>
    );

    const renderPlayer = (video: Video) => {
        const videoId = getYouTubeVideoId(video.video_url);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col lg:flex-row gap-8 h-full overflow-hidden relative"
            >
                {/* Left: Player + Details */}
                <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar lg:pr-4">
                    <Button
                        type="text"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => setSelectedVideo(null)}
                        className="mb-6 text-slate-400 hover:text-white flex items-center gap-2 font-bold px-0"
                    >
                        Back to browse
                    </Button>

                    {/* YouTube Embed Player */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-white/10 mb-8">
                        {videoId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={video.title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center group cursor-pointer">
                                <img src={getYouTubeThumbnail(video.video_url)} className="w-full h-full object-cover opacity-40 blur-sm" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
                                <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-3xl group-hover:scale-110 transition-transform duration-500">
                                    <Play fill="white" className="text-white ml-2 w-10 h-10" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h1 className="text-2xl md:text-3xl font-black text-white">{video.title}</h1>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={handleGenerateQuiz}
                                    className="rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-400 hover:text-white hover:border-blue-500 flex items-center gap-2 font-bold px-4"
                                >
                                    <BrainCircuit size={16} /> Generate Quiz
                                </Button>
                                <Button className="rounded-xl bg-white/5 border-white/10 text-slate-300 hover:text-white flex items-center gap-2">
                                    <ThumbsUp size={16} /> Like
                                </Button>
                                <Button className="rounded-xl bg-white/5 border-white/10 text-slate-300 hover:text-white flex items-center gap-2">
                                    <Share2 size={16} /> Share
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                                <User className="text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-bold">{video.leason_type}</span>
                                    <CheckCircle2 size={14} className="text-blue-400" />
                                </div>
                                <span className="text-xs text-slate-500 font-medium">Legal Education Course</span>
                            </div>
                            <Button type="primary" className="rounded-xl bg-blue-600 border-none font-bold">Follow</Button>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 space-y-4">
                            <div className="flex items-center gap-6 text-sm font-bold text-slate-300">
                                <span>{formatDate(video.created_at)}</span>
                                <span className="text-blue-400">#{video.leason_type.replace(/\s+/g, '')}</span>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-sm">
                                {video.leason_description}
                            </p>
                            <a
                                href={video.video_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 font-bold hover:text-blue-300 transition-colors"
                            >
                                Watch on YouTube <Info size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Right: Chat Panel or Up Next */}
                <div className="lg:w-[400px] shrink-0 flex flex-col h-full">
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setChatOpen(false)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${!chatOpen
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:bg-white/[0.06]'
                                }`}
                        >
                            <Play size={16} /> Up Next
                        </button>
                        <button
                            onClick={() => setChatOpen(true)}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${chatOpen
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:bg-white/[0.06]'
                                }`}
                        >
                            <Bot size={16} /> AI Assistant
                        </button>
                    </div>

                    {chatOpen ? (
                        /* Chat Panel */
                        <div className="flex-1 flex flex-col bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                                        <Bot size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">Video Summary AI</h4>
                                        <p className="text-xs text-slate-400">Ask me anything about this lesson</p>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div
                                ref={chatContainerRef}
                                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
                                style={{ maxHeight: 'calc(100vh - 400px)' }}
                            >
                                {initializingChat ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                        <span className="ml-2 text-slate-400 text-sm">Initializing AI...</span>
                                    </div>
                                ) : (
                                    chatMessages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] ${msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-md'
                                                : 'bg-white/[0.05] text-slate-200 rounded-2xl rounded-bl-md border border-white/10'
                                                } px-4 py-3`}>
                                                {msg.role === 'assistant' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm">{msg.content}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                {chatLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white/[0.05] text-slate-200 rounded-2xl rounded-bl-md border border-white/10 px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm text-slate-400">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="p-4 border-t border-white/10">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ask about the video..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                                        disabled={chatLoading || initializingChat}
                                        className="flex-1 h-10 px-4 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <Button
                                        type="primary"
                                        icon={<Send size={18} />}
                                        onClick={sendMessage}
                                        disabled={!chatInput.trim() || chatLoading || initializingChat}
                                        className="rounded-xl bg-blue-600 border-none h-10 w-10 flex items-center justify-center"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    AI can help summarize, explain concepts, and answer questions
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Up Next List */
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Play className="text-blue-500" size={18} /> Up Next
                            </h3>
                            <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pb-4">
                                {videos.filter(v => v.id !== video.id).map(nextVideo => (
                                    <div
                                        key={nextVideo.id}
                                        onClick={() => setSelectedVideo(nextVideo)}
                                        className="flex gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/[0.03] transition-colors"
                                    >
                                        <div className="relative w-32 aspect-video rounded-xl overflow-hidden shrink-0 shadow-lg">
                                            <img src={getYouTubeThumbnail(nextVideo.video_url)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[9px] font-bold text-white">
                                                {nextVideo.leason_type}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-bold text-slate-200 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                                                {nextVideo.title}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 mt-1 font-medium">{nextVideo.leason_type}</p>
                                            <div className="text-[10px] text-slate-600 mt-0.5">{formatDate(nextVideo.created_at)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
            <Header />

            <main className="flex-1 relative pt-24 pb-8 flex flex-col">
                {/* Ambient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-[#020617]"></div>
                    <img
                        src={heroBg}
                        alt=""
                        className="absolute top-0 right-0 w-full h-[800px] object-cover opacity-10 mask-image-gradient"
                    />
                    <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[150px]"></div>
                    <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[150px]"></div>
                </div>

                <div className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-8 flex flex-col">
                    <AnimatePresence mode="wait">
                        {selectedVideo ? renderPlayer(selectedVideo) : renderGrid()}
                    </AnimatePresence>
                </div>
            </main>

            {renderQuizModal()}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .custom-pagination .ant-pagination-item,
                .custom-pagination .ant-pagination-prev,
                .custom-pagination .ant-pagination-next {
                    background: rgba(255, 255, 255, 0.03);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .custom-pagination .ant-pagination-item a,
                .custom-pagination .ant-pagination-prev button,
                .custom-pagination .ant-pagination-next button {
                    color: #94a3b8;
                }
                .custom-pagination .ant-pagination-item-active {
                    background: #2563eb;
                    border-color: #2563eb;
                }
                .custom-pagination .ant-pagination-item-active a {
                    color: white;
                }
                .prose-invert {
                    color: #e2e8f0;
                }
                .prose-invert h1, .prose-invert h2, .prose-invert h3, .prose-invert h4 {
                    color: #f1f5f9;
                }
                .prose-invert strong {
                    color: #f1f5f9;
                }
                .prose-invert code {
                    color: #93c5fd;
                    background: rgba(59, 130, 246, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                .prose-invert ul, .prose-invert ol {
                    padding-left: 1.25em;
                }
                .prose-invert li {
                    margin: 0.25em 0;
                }
                .quiz-modal .ant-modal-content {
                    background: transparent !important;
                    box-shadow: none !important;
                    padding: 0 !important;
                }
                .quiz-modal .ant-modal-body {
                    padding: 0 !important;
                }
                .quiz-modal .ant-modal-close {
                    top: 24px !important;
                    right: 24px !important;
                    z-index: 50;
                }
            `}</style>
        </div>
    );
}
