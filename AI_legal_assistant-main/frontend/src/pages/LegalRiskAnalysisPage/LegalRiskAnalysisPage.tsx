import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertTriangle, Sparkles, X } from 'lucide-react';
import { Button, message, Upload as AntUpload } from 'antd';
import type { UploadProps } from 'antd';
import ReactMarkdown from 'react-markdown';
import { postAiDocumentAnalysis } from '@/services/api/aiApi';
import Header from '@/components/Header/Header';
import heroBg from '@/assets/hero_bg.png';

const { Dragger } = AntUpload;

export default function LegalRiskAnalysisPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleAnalyze = async () => {
        if (!file) {
            message.warning("Please upload a document to proceed.");
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const res = await postAiDocumentAnalysis(file);
            if (res.data && res.data.text) {
                setAnalysisResult(res.data.text);
                message.success("Analysis complete.");
            } else {
                setAnalysisResult("Analysis completed but no details returned.");
                message.warning("Empty response from server.");
            }
        } catch (error) {
            console.error("Analysis failed:", error);
            message.error("Analysis failed. Please check your connection or try again later.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        beforeUpload: (file) => {
            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error('File must be smaller than 5MB!');
                return AntUpload.LIST_IGNORE;
            }
            setFile(file);
            return false;
        },
    };

    return (
        <div className="h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col overflow-hidden">
            <Header />

            <main className="flex-1 relative pt-20 overflow-hidden">
                {/* Ambient Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[#020617]"></div>
                    <img
                        src={heroBg}
                        alt=""
                        className="absolute top-0 right-0 w-full h-[800px] object-cover opacity-20 mask-image-gradient"
                    />
                    <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 h-full max-w-7xl mx-auto px-6 py-6 flex flex-col min-h-0">
                    {/* Header Section */}
                    <div className="text-center mb-6 shrink-0">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight"
                        >
                            AI Risk Analysis
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-sm text-slate-400 max-w-2xl mx-auto"
                        >
                            Identify potential risks, missing clauses, and compliance issues in your legal documents instantly.
                        </motion.p>
                    </div>

                    {/* Main Layout Container */}
                    <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 min-h-0 overflow-hidden mb-4">

                        {/* Left Column: Source / Upload */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="lg:w-[380px] shrink-0 flex flex-col"
                        >
                            <div className="flex-1 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl p-6 flex flex-col relative overflow-hidden group">
                                {/* Simplified background deco to avoid weird lines */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/30"></div>

                                <h2 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2 shrink-0">
                                    <Upload className="w-5 h-5 text-blue-400" /> Source Document
                                </h2>

                                <div className="flex-1 min-h-0 flex flex-col">
                                    {!file ? (
                                        <Dragger
                                            {...uploadProps}
                                            className="flex-1 !border-dashed !border-2 !border-slate-700 !bg-slate-900/50 hover:!border-blue-500/50 transition-all rounded-2xl group/dragger overflow-hidden"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-4 text-center px-4 h-full py-12">
                                                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover/dragger:scale-110 group-hover/dragger:bg-blue-500/20 transition-all duration-300">
                                                    <Upload className="text-blue-400 w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-slate-200">Upload document</p>
                                                    <p className="text-sm text-slate-500 mt-1 uppercase tracking-wider">PDF, DOCX (Max 5MB)</p>
                                                </div>
                                            </div>
                                        </Dragger>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-2xl flex items-center gap-4 group/file">
                                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                                                    <FileText className="text-blue-400 w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-slate-200 truncate">{file.name}</h3>
                                                    <p className="text-xs text-slate-400 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                                                </div>
                                                <Button
                                                    type="text"
                                                    onClick={() => { setFile(null); setAnalysisResult(null); }}
                                                    className="hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-full h-8 w-8 p-0 flex items-center justify-center transition-colors"
                                                >
                                                    <X size={16} />
                                                </Button>
                                            </div>

                                            <Button
                                                type="primary"
                                                size="large"
                                                onClick={handleAnalyze}
                                                loading={isAnalyzing}
                                                className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 border-none rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                                icon={!isAnalyzing && <Sparkles size={20} />}
                                            >
                                                {isAnalyzing ? "Analyzing..." : "Analyze Now"}
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 text-[10px] text-slate-500 flex items-center gap-2 shrink-0 uppercase tracking-widest font-semibold">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Secure encryption active
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column: Results */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex-1 min-w-0 h-full flex flex-col"
                            ref={resultRef}
                        >
                            <div className="flex-1 rounded-[2rem] bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative">
                                {/* Top Decoration Bar */}
                                <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shrink-0 opacity-80"></div>

                                {/* Report Header */}
                                <div className="p-6 md:px-8 py-5 shrink-0 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                                            <CheckCircle className="text-emerald-400 w-5 h-5" />
                                        </div>
                                        Analysis Report
                                    </h2>
                                    {analysisResult && (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                                                AI Generated
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Scrollable Area */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                                    <div className="p-8 md:p-10">
                                        <AnimatePresence mode="wait">
                                            {isAnalyzing ? (
                                                <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 text-slate-500">
                                                    <div className="relative">
                                                        <div className="w-16 h-16 rounded-full border-2 border-blue-500/10 border-t-blue-500 animate-spin"></div>
                                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/50 w-6 h-6 animate-pulse" />
                                                    </div>
                                                    <p className="text-slate-400 font-medium animate-pulse">Running advanced risk assessment...</p>
                                                </div>
                                            ) : analysisResult ? (
                                                <motion.div
                                                    key="result"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="prose prose-invert prose-blue max-w-none 
                                                        prose-headings:text-white prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-blue-200
                                                        prose-li:text-slate-300 prose-code:text-blue-300"
                                                >
                                                    <ReactMarkdown>{analysisResult}</ReactMarkdown>
                                                </motion.div>
                                            ) : (
                                                <div className="min-h-[400px] flex flex-col items-center justify-center gap-8 text-center text-slate-500">
                                                    <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center rotate-3 shadow-inner">
                                                        <Sparkles className="w-10 h-10 text-slate-700" />
                                                    </div>
                                                    <div className="max-w-xs">
                                                        <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready to Analyze</h3>
                                                        <p className="text-sm text-slate-500 leading-relaxed">
                                                            Upload a legal document on the left and our AI will scan for risks, compliance issues, and key clauses.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Disclaimer Footer */}
                                <div className="shrink-0 bg-white/[0.03] border-t border-white/5 p-4 px-8 flex gap-3 text-[10px] text-slate-500 leading-normal">
                                    <AlertTriangle className="w-4 h-4 text-amber-500/50 shrink-0 mt-0.5" />
                                    <p className="max-w-3xl">
                                        Disclaimer: This AI analysis is for informational purposes only and does not constitute professional legal advice.
                                        Results should be verified by a qualified legal professional.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Enhanced Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    margin: 20px 0;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.15);
                    background-clip: content-box;
                }
            `}</style>
        </div>
    );
}