import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Input, Button, ConfigProvider, theme, Divider, Checkbox, message } from 'antd';
import { Mail, Lock, User, Chrome, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header/Header.tsx';
import Footer from '@/components/Footer/Footer.tsx';
import { postUserLogin, postUserRegister, getUserInfo } from '@/services/api/userApi.ts';
import useStore from '@/store/store.ts';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { changeUserInfo } = useStore();

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            let res;
            if (mode === 'login') {
                res = await postUserLogin(values.email, values.password);
            } else {
                res = await postUserRegister(values.email, values.password, values.username);
            }

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                message.success(`${mode === 'login' ? 'Login' : 'Registration'} successful!`);

                // Fetch user info after login/register
                const userRes = await getUserInfo();
                changeUserInfo(userRes.data);

                navigate('/');
            } else {
                message.error(res.data.message || 'Operation failed');
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            message.error(error.response?.data?.detail || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        form.resetFields();
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#3b82f6',
                    borderRadius: 12,
                },
            }}
        >
            <div className="min-h-screen bg-[#020617] text-slate-200 font-sans flex flex-col">
                <Header />

                <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px] -z-10 animate-pulse" />
                    <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] -z-10" />

                    <div className="w-full max-w-[440px]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-10">
                                <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
                                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                                </h1>
                                <p className="text-slate-400">
                                    {mode === 'login'
                                        ? 'Access your AI-powered legal suite'
                                        : 'Join the community of modern legal tech'}
                                </p>
                            </div>

                            <div className="glass-card p-8 md:p-10 rounded-[2.5rem] border-white/10 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    requiredMark={false}
                                    autoComplete="off"
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={mode}
                                            initial={{ opacity: 0, x: mode === 'register' ? 20 : -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: mode === 'register' ? -20 : 20 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {mode === 'register' && (
                                                <Form.Item
                                                    label={<span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Username</span>}
                                                    name="username"
                                                    rules={[{ required: true, message: 'Please enter your username' }]}
                                                >
                                                    <Input
                                                        prefix={<User className="text-slate-500 mr-2" size={18} />}
                                                        placeholder="LegalExpert24"
                                                        size="large"
                                                        className="bg-white/5 border-white/10 hover:border-blue-500/50 focus:border-blue-500 rounded-xl h-12"
                                                    />
                                                </Form.Item>
                                            )}

                                            <Form.Item
                                                label={<span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Email Address</span>}
                                                name="email"
                                                rules={[
                                                    { required: true, message: 'Please enter your email' },
                                                    { type: 'email', message: 'Please enter a valid email' }
                                                ]}
                                            >
                                                <Input
                                                    prefix={<Mail className="text-slate-500 mr-2" size={18} />}
                                                    placeholder="name@company.com"
                                                    size="large"
                                                    className="bg-white/5 border-white/10 hover:border-blue-500/50 focus:border-blue-500 rounded-xl h-12"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                label={
                                                    <div className="w-full flex justify-between">
                                                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Password</span>
                                                        {mode === 'login' && (
                                                            <a href="#" className="text-xs text-blue-500 hover:text-blue-400 transition-colors">Forgot?</a>
                                                        )}
                                                    </div>
                                                }
                                                name="password"
                                                rules={[{ required: true, message: 'Please enter your password' }]}
                                            >
                                                <Input.Password
                                                    prefix={<Lock className="text-slate-500 mr-2" size={18} />}
                                                    placeholder="••••••••"
                                                    size="large"
                                                    className="bg-white/5 border-white/10 hover:border-blue-500/50 focus:border-blue-500 rounded-xl h-12 password-input"
                                                />
                                            </Form.Item>
                                        </motion.div>
                                    </AnimatePresence>

                                    {mode === 'login' && (
                                        <Form.Item name="remember" valuePropName="checked" className="mb-6">
                                            <Checkbox className="text-slate-400 text-sm">Remember me</Checkbox>
                                        </Form.Item>
                                    )}

                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        size="large"
                                        loading={loading}
                                        className="w-full h-12 rounded-xl bg-blue-600 border-none font-bold text-base hover:bg-blue-500 shadow-lg shadow-blue-500/20 group"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {mode === 'login' ? (
                                                <>Sign In <LogIn size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                            ) : (
                                                <>Create Account <UserPlus size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                            )}
                                        </div>
                                    </Button>
                                </Form>

                                <Divider className="border-white/5 my-8">
                                    <span className="text-slate-500 text-xs uppercase tracking-widest font-medium">Or continue with</span>
                                </Divider>

                                <div className="flex justify-center">
                                    <Button className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 rounded-xl flex items-center justify-center gap-3 group transition-all duration-300">
                                        <Chrome size={20} className="text-slate-300 group-hover:text-white group-hover:scale-110 transition-all" />
                                        <span className="text-slate-300 group-hover:text-white font-medium">Continue with Google</span>
                                    </Button>
                                </div>
                            </div>

                            <p className="text-center mt-8 text-slate-500">
                                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                                <button
                                    onClick={toggleMode}
                                    className="text-blue-500 font-bold hover:text-blue-400 transition-colors bg-transparent border-none cursor-pointer"
                                >
                                    {mode === 'login' ? 'Register Now' : 'Sign In'}
                                </button>
                            </p>
                        </motion.div>
                    </div>
                </main>

                <Footer />

                <style>{`
                    .password-input .ant-input-password-icon {
                        color: #64748b !important;
                    }
                    .password-input .ant-input-password-icon:hover {
                        color: #ffffff !important;
                    }
                    .ant-checkbox-wrapper:hover .ant-checkbox-inner,
                    .ant-checkbox:hover .ant-checkbox-inner {
                        border-color: #3b82f6 !important;
                    }
                    .ant-checkbox-checked .ant-checkbox-inner {
                        background-color: #3b82f6 !important;
                        border-color: #3b82f6 !important;
                    }
                    
                    /* Fix for browser autofill background */
                    input:-webkit-autofill,
                    input:-webkit-autofill:hover,
                    input:-webkit-autofill:focus,
                    input:-webkit-autofill:active {
                        -webkit-box-shadow: 0 0 0 30px #0b1120 inset !important;
                        -webkit-text-fill-color: #f1f5f9 !important;
                        transition: background-color 5000s ease-in-out 0s;
                    }

                    /* Wrapper styling */
                    .ant-input-affix-wrapper {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        border-color: rgba(255, 255, 255, 0.1) !important;
                        height: 48px !important;
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                    }

                    /* Internal input transparency */
                    .ant-input {
                        background-color: transparent !important;
                        border: none !important;
                    }

                    .ant-input:focus {
                        box-shadow: none !important;
                    }

                    /* Focus state */
                    .ant-input-affix-wrapper-focused,
                    .ant-input-affix-wrapper:focus-within {
                        background-color: rgba(255, 255, 255, 0.08) !important;
                        border-color: #3b82f6 !important;
                        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
}