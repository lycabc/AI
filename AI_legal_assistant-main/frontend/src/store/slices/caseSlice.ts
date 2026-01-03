import type { StateCreator } from "zustand";

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date | string; // Allow string for persistence
    status?: 'sending' | 'sent' | 'error';
}

interface CaseInfo {
    case_type: string;
    case_description: string;
    location: string;
    prosecute_date: string;
    history_conversation: Array<Message>;
    session_id: string;
    case_id: string;
}

export interface CaseSlice {
    caseInfo: CaseInfo;
    changeCaseInfo: (caseInfo: CaseInfo) => void;
    addMessage: (message: Message) => void;
    resetCaseInfo: () => void;
}

const initialState: CaseInfo = {
    case_type: "",
    case_description: "",
    location: "",
    prosecute_date: "",
    history_conversation: [],
    session_id: "",
    case_id: "",
};

export const createCaseSlice: StateCreator<CaseSlice> = (set) => ({
    caseInfo: initialState,
    changeCaseInfo: (caseInfo: CaseInfo) => set({ caseInfo }),
    addMessage: (message: Message) => set((state) => ({
        caseInfo: {
            ...state.caseInfo,
            history_conversation: [...state.caseInfo.history_conversation, message]
        }
    })),
    resetCaseInfo: () => set({ caseInfo: initialState }),
});
