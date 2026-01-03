import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
    ShieldCheck,
    Zap,
    Search,
    MessageSquare,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import { Button } from 'antd';
import heroBg from '@/assets/hero_bg.png';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import { useNavigate, useLocation } from 'react-router-dom';

export default function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
            <Header />

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.2 }}
                        transition={{ duration: 1.5 }}
                        src={heroBg}
                        alt="Hero Background"
                        className="w-full h-full object-cover mask-image-gradient"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/0 via-[#020617]/40 to-[#020617]"></div>
                    <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                    >
                        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
                            <Zap className="w-4 h-4" />
                            <span>v2.0 is now live</span>
                        </div>

                        <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
                            The Future of <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Legal Intelligence</span>
                        </h1>
                        <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                            Empowering legal professionals with AI-driven contract analysis,
                            instant document drafting, and multi-jurisdictional legal research.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/case-info')}
                                className="bg-blue-600 border-none hover:bg-blue-500 h-16 px-10 rounded-2xl text-xl font-bold flex items-center group shadow-xl shadow-blue-500/20"
                            >
                                Get Started <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-32 bg-[#020617]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
                <div className="max-w-7xl mx-auto px-6 relative">
                    <div className="text-center mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold mb-6"
                        >
                            Precision-Engineered Capability
                        </motion.h2>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: 80 }}
                            viewport={{ once: true }}
                            className="h-1.5 bg-blue-500 mx-auto rounded-full"
                        ></motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldCheck className="w-12 h-12 text-blue-400" />,
                                title: "Risk Mitigation",
                                desc: "Advanced AI identifies hidden liabilities and non-compliant clauses in real-time."
                            },
                            {
                                icon: <Zap className="w-12 h-12 text-blue-400" />,
                                title: "Instant Drafting",
                                desc: "Generate professional legal documents from plain language prompts in seconds."
                            },
                            {
                                icon: <Search className="w-12 h-12 text-blue-400" />,
                                title: "Smart Discovery",
                                desc: "Find precedence and relevant case law across thousands of databases instantly."
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -12, scale: 1.02 }}
                                className="glass-card p-10 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all cursor-default group glow-border"
                            >
                                <div className="mb-8 p-4 bg-blue-500/5 rounded-2xl w-fit group-hover:bg-blue-500/10 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works Section */}
            <section id="how-it-works" className="py-32 bg-gradient-to-b from-[#020617] to-[#0B192C]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1">
                            <motion.h2
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="text-4xl md:text-5xl font-bold mb-10 leading-tight"
                            >
                                Streamlined Workflow for the <span className="text-blue-500">Modern Firm</span>
                            </motion.h2>
                            <div className="space-y-10">
                                {[
                                    { step: "01", title: "Upload & Contextualize", desc: "Securely upload documents or provide case details via our encrypted gateway." },
                                    { step: "02", title: "AI Analysis", desc: "Our neural engines process the data based on current legal standards and precedents." },
                                    { step: "03", title: "Actionable Insights", desc: "Receive structured summaries, highlighted risks, and auto-generated drafts." }
                                ].map((step, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.2 }}
                                        className="flex gap-8 group"
                                    >
                                        <div className="text-4xl font-black text-blue-500/10 group-hover:text-blue-500/30 transition-colors tabular-nums">
                                            {step.step}
                                        </div>
                                        <div>
                                            <h4 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{step.title}</h4>
                                            <p className="text-slate-400 text-lg leading-relaxed">{step.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 relative w-full">
                            <div className="aspect-square rounded-full bg-blue-500/5 absolute -top-20 -right-20 blur-[100px] animate-pulse"></div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="glass-card p-8 md:p-12 rounded-[3rem] shadow-2xl relative border border-white/10"
                            >
                                <div className="flex items-center justify-between mb-10">
                                    <div className="flex space-x-3">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.2)]"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
                                    </div>
                                    <div className="flex items-center space-x-2 text-slate-500">
                                        <MessageSquare className="w-5 h-5" />
                                        <span className="text-xs font-mono uppercase tracking-widest">Console.v2</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white/5 p-5 rounded-2xl text-sm md:text-base border border-white/5 text-slate-300">
                                        "Analyze the indemnity clause in Section 4.2..."
                                    </div>
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        className="bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20 text-blue-100 shadow-inner"
                                    >
                                        <div className="flex items-center mb-3 font-bold text-blue-400">
                                            <ShieldCheck className="w-5 h-5 mr-3" /> AI Analysis
                                        </div>
                                        <p className="leading-relaxed">
                                            The clause currently lacks a liability cap, which poses a significant risk.
                                            Recommended revision: <span className="text-white font-semibold">'Liability capped at 1.5x Annual Fees...'</span>
                                        </p>
                                    </motion.div>
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <div className="flex items-center text-xs text-slate-500 font-medium">
                                            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
                                            System optimized
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-tighter">
                                            Secure
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}