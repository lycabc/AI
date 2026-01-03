import { Scale } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-20 border-t border-white/5 bg-[#020617] relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center space-x-3">
                        <Scale className="text-blue-500 w-6 h-6" />
                        <span className="text-lg font-bold text-white">LegalAI Assistant</span>
                    </div>
                    <div className="flex space-x-8 text-sm text-slate-500 font-medium">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                    <p className="text-slate-500 text-sm">
                        &copy; 2025 LegalAI Assistant. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
