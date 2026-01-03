import { motion } from 'framer-motion';
import { Scale, Zap, User } from 'lucide-react';
import { Button, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import useStore from '@/store/store.ts';
import { postUserLogout } from '@/services/api/userApi.ts';

export default function Header() {
    const navigate = useNavigate();
    const { userInfo, resetUserInfo } = useStore();
    const isLoggedIn = !!userInfo.email;



    const handleLogout = () => {
        postUserLogout();
        resetUserInfo();
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            label: 'Profile',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'logout',
            label: 'Logout',
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#020617]/70 backdrop-blur-xl px-6 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/')}
                    className="flex items-center space-x-3 group cursor-pointer"
                >
                    <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                        <Scale className="text-blue-500 w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                        LegalAI Assistant
                    </span>
                </motion.div>

                <div className="hidden md:flex items-center gap-10 text-sm font-medium">
                    {[
                        { label: 'Legal Learning', path: '/legal-learning' },
                        { label: 'Risk Analysis', path: '/risk-analysis' },
                        { label: 'AI Consultation', path: '/case-info' }
                    ].map((item) => (
                        <button
                            key={item.label}
                            onClick={() => navigate(item.path)}
                            className="text-slate-400 hover:text-white transition-all hover:scale-105 bg-transparent border-none cursor-pointer"
                        >
                            {item.label}
                        </button>
                    ))}
                    {isLoggedIn ? (
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                            <Button
                                type="text"
                                className="text-slate-200 hover:text-white flex items-center gap-2 font-medium"
                            >
                                <User className="w-4 h-4" />
                                <span>{userInfo.username || userInfo.email}</span>
                            </Button>
                        </Dropdown>
                    ) : (
                        <Button
                            onClick={() => navigate('/login')}
                            type="primary"
                            className="bg-blue-600 border-none hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 transition-all rounded-full px-8 h-10 font-semibold"
                        >
                            Sign In
                        </Button>
                    )}
                </div>

                {/* Mobile Menu Button (Placeholder for better UI) */}
                <div className="md:hidden">
                    <Button type="text" className="text-slate-300">
                        <Zap className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
