import { getRequest, postRequest } from "../instance";

// API Methods

/**
 * Initialize the AI model with case details
 */
export const postAiInitModel = (
    case_type: string,
    case_description: string,
    location: string,
    prosecute_date: string
) => {
    return postRequest("/ai/init_model", {
        case_type,
        case_description,
        location,
        prosecute_date
    });
};

/**
 * Send a chat message to the AI
 */
export const postAiChat = (
    session_id: string,
    case_id: string,
    prompt: string
) => {
    return postRequest("/ai/chat", {
        session_id,
        case_id,
        prompt
    });
};

/**
 * Get the list of cases for the current user
 */
export const getAiCaseList = () => {
    return getRequest("/ai/case_list");
};

/**
 * Get details of a specific case
 */
export const getAiCaseDetail = (caseId: string) => {
    return getRequest(`/ai/case_detail/${caseId}`);
};

/**
 * Convert speech file to text
 */
export const postAiSpeechToText = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return postRequest("/ai/speech_to_text", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

/**
 * Convert text to speech
 */
export const postAiTextToSpeech = (text: string) => {
    return postRequest(
        "/ai/text_to_speech",
        { text },
        {
            responseType: "blob"
        }
    );
};

/**
 * Delete a case
 */
export const postAiCaseDelete = (caseId: string) => {
    return postRequest(
        "/ai/case_delete",
        {
            case_id: caseId
        }
    );
};

export const postAiDocumentAnalysis = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return postRequest("/ai/document_analysis", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const postAiInitLeasonModel = (
    leason_id: string
) => {
    return postRequest("/ai/init_leason_model", {
        leason_id
    });
};

export const postAiLeasonChat = (
    session_id: string,
    prompt: string
) => {
    return postRequest("/ai/leason_chat", {
        session_id,
        prompt
    });
};

export const postAiLeasonQuestion = (
    leason_id: string
) => {
    return postRequest("/ai/leason_question", {
        leason_id
    });
};


export const postAiRecommendLawyer = (
    case_id: string,
) => {
    // response type json
    //     {
    //   "lawyer": {
    //     "id": 103,
    //     "name": "Russell-Cooke Solicitors",
    //     "email": "Not Available",
    //     "expertise": "real_estate, family, personal_injury, consumer",
    //     "price": "£180-£480/hr",
    //     "rating": "4.4",
    //     "introduction": "Full-service firm with property, family, personal injury and consumer expertise.",
    //     "location": "London, UK",
    //     "law_firm": "Russell-Cooke Solicitors",
    //     "firm_address": "The Point, London"
    //   }
    // }
    return postRequest("/ai/recommend_laywer", {
        case_id
    });
};