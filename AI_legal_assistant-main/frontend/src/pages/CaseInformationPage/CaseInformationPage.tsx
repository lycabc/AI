import { motion } from 'framer-motion';
import { Form, Input, Button, Select, Card, Divider, ConfigProvider, theme } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Scale, Info, ShieldAlert, Rocket, MapPin, CalendarDays, History } from 'lucide-react';
import { DatePicker, message } from 'antd';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import useStore from '@/store/store';
import { postAiInitModel } from '@/services/api/aiApi';

const { TextArea } = Input;

export default function CaseInformationPage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const changeCaseInfo = useStore((state) => state.changeCaseInfo);

    const onFinish = async (values: any) => {
        try {
            console.log('Case Data:', values);
            const prosecute_date = values.date ? values.date.toISOString() : new Date().toISOString();

            const res = await postAiInitModel(
                values.category,
                values.description,
                values.location,
                prosecute_date
            );

            // Assuming response structure is { session_id, case_id } based on backend
            // But postRequest returns the Axios response.data if configured, or response object.
            // Let's assume standard axios response format here unless intercepted.
            // instance.ts interceptor returns "response", so we get full Axios response.
            // Wait, instance.ts interceptor returns `response` (the object). 
            // So we need `res.data`.

            if (res.status === 200) {
                changeCaseInfo({
                    case_type: values.category,
                    case_description: values.description,
                    location: values.location,
                    prosecute_date: prosecute_date,
                    history_conversation: [],
                    session_id: res.data.session_id,
                    case_id: res.data.case_id
                });
                navigate('/consultation');
            }
        } catch (error) {
            console.error(error);
            message.error("Failed to initialize consultation. Please try again.");
        }
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
            <div className="min-h-screen bg-[#020617] text-slate-200 font-sans">
                <Header />

                <main className="pt-32 pb-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-12 text-center relative"
                        >
                            <Button
                                type="text"
                                icon={<History className="w-4 h-4" />}
                                onClick={() => navigate('/consultation')}
                                className="absolute right-0 top-0 text-slate-400 hover:text-white flex items-center gap-2"
                            >
                                History
                            </Button>
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                                <Scale className="w-4 h-4" />
                                <span>Confidential AI Analysis</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-4">Case Information</h1>
                            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                                Provide the details of your legal matter. Our AI will analyze the facts
                                and prepare a comprehensive consultation strategy.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <Card
                                className="glass-card rounded-[2.5rem] border-white/10 overflow-hidden"
                                styles={{ body: { padding: '2rem' } }}
                                bordered={false}
                            >
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    requiredMark={false}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                                        <Form.Item
                                            label={<span className="text-slate-300 font-semibold flex items-center"><Info className="w-4 h-4 mr-2" /> Case Category</span>}
                                            name="category"
                                            rules={[{ required: true, message: 'Please select a category' }]}
                                        >
                                            <Select
                                                placeholder="Select case type"
                                                size="large"
                                                className="custom-select"
                                                dropdownStyle={{ backgroundColor: '#0B192C' }}
                                                options={[
                                                    { value: 'contract', label: 'Contract Law & Agreements' },
                                                    { value: 'intellectual_property', label: 'Intellectual Property (IP)' },
                                                    { value: 'employment', label: 'Employment & Labor Law' },
                                                    { value: 'litigation', label: 'Civil Litigation & Dispute Resolution' },
                                                    { value: 'corporate', label: 'Corporate, Startup & Business Law' },
                                                    { value: 'real_estate', label: 'Real Estate & Property' },
                                                    { value: 'family', label: 'Family Law & Divorce' },
                                                    { value: 'criminal', label: 'Criminal Defense' },
                                                    { value: 'personal_injury', label: 'Personal Injury & Torts' },
                                                    { value: 'immigration', label: 'Immigration Law' },
                                                    { value: 'tax', label: 'Tax Law' },
                                                    { value: 'consumer', label: 'Consumer Protection' },
                                                    { value: 'cybersecurity', label: 'Cybersecurity & Data Privacy' },
                                                    { value: 'others', label: 'Other Legal Matters' },
                                                ]}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="text-slate-300 font-semibold flex items-center"><MapPin className="w-4 h-4 mr-2" /> Location</span>}
                                            name="location"
                                            rules={[{ required: true, message: 'Please enter location' }]}
                                        >
                                            <Input placeholder="e.g. New York, NY" size="large" />
                                        </Form.Item>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-4">
                                        <Form.Item
                                            label={<span className="text-slate-300 font-semibold flex items-center"><CalendarDays className="w-4 h-4 mr-2" />Prosecute Date</span>}
                                            name="date"
                                            rules={[{ required: true, message: 'Please select date' }]}
                                        >
                                            <DatePicker
                                                size="large"
                                                className="w-full"
                                                popupClassName="custom-datepicker"
                                            />
                                        </Form.Item>
                                    </div>

                                    <Divider className="border-white/5 my-8" />

                                    <Form.Item
                                        label={<span className="text-slate-300 font-semibold flex items-center"><ShieldAlert className="w-4 h-4 mr-2" /> Detailed Description</span>}
                                        name="description"
                                        rules={[{ required: true, message: 'Please provide details' }]}
                                    >
                                        <TextArea
                                            rows={8}
                                            placeholder="Describe the facts, key parties involved, and your primary concerns..."
                                            className="rounded-2xl"
                                        />
                                    </Form.Item>

                                    <div className="mt-12 flex justify-center">
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            className="bg-blue-600 border-none hover:bg-blue-500 h-16 px-12 rounded-2xl text-xl font-bold flex items-center group shadow-xl shadow-blue-500/20"
                                        >
                                            Start AI Consultation <Rocket className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </Form>
                            </Card>
                        </motion.div>
                    </div>
                </main>

                <Footer />

                <style>{`
                    .glass-card {
                        background: rgba(255, 255, 255, 0.03) !important;
                        backdrop-filter: blur(12px) !important;
                        -webkit-backdrop-filter: blur(12px) !important;
                    }
                    .ant-card {
                        background: transparent !important;
                    }
                    .ant-select-selector, .ant-input {
                        background-color: rgba(255, 255, 255, 0.05) !important;
                        border-color: rgba(255, 255, 255, 0.1) !important;
                        color: white !important;
                    }
                    .ant-select-selection-placeholder {
                        color: rgba(255, 255, 255, 0.3) !important;
                    }
                `}</style>
            </div>
        </ConfigProvider>
    );
}