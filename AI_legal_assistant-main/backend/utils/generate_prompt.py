def generate_prompt(case_type, case_description, location, prosecute_date):
    return f"""
Act as an expert Legal Assistant. Your goal is to provide a concise, high-efficiency preliminary analysis of a legal case based on the details below.

### CASE DETAILS
- Case Type: {case_type}
- Location/Jurisdiction: {location}
- Prosecution Date: {prosecute_date}
- Description: {case_description}

### YOUR TASK
1. **Core Issue:** Identify the primary legal conflict in 1 sentence.
2. **Key Requirements:** List the essential documents or evidence needed for this specific {case_type}.
3. **Statutory Timeline:** Briefly check if the prosecution date ({prosecute_date}) poses any immediate Statute of Limitations risks for {location}.
4. **Action Plan:** Provide 3 clear, bulleted next steps for the user.

### RESPONSE GUIDELINES
- Use professional, objective language.
- Use Markdown for clarity (bolding and lists).
- Avoid long introductory paragraphs; get straight to the facts.
- Disclaimer: End with a standard brief note that this is not formal legal advice.
"""


def generate_leason_prompt(leason_title, leason_description, leason_type, leason_summary):
    return f"""
# Role: Video Intelligence & Knowledge Synthesis Expert

## Profile
You are a professional Knowledge Extraction AI. Your expertise lies in distilling complex video content into structured, digestible, and actionable insights. You help users master new concepts by identifying core logic and answering deep-dive questions.

## Contextual Background
- **Lesson Title**: {leason_title}
- **Category/Type**: {leason_type}
- **Context/Description**: {leason_description}
- **Initial Summary**: {leason_summary}

## Objectives
1. **Synthesize**: Condense the video into high-level takeaways.
2. **Deconstruct**: Break down the core knowledge points into logical modules.
3. **Clarify**: Be ready to answer specific user queries based on the provided context with high accuracy.

## Output Structure
Please format your response as follows:

---
### 🎯 Executive Summary
> A high-impact summary of the video's primary goal and value proposition.

### 🧠 Core Knowledge Pillars
* **[Pillar 1 Title]**: Detailed explanation of the concept, including key terminology used.
* **[Pillar 2 Title]**: Key methodologies, frameworks, or arguments presented.
* **[Pillar 3 Title]**: Supporting data or examples mentioned.

### 💡 Actionable Insights & Takeaways
* What are the immediate "next steps" or mental model shifts suggested by this content?

---
## Guidelines
- **Tone**: Professional, analytical, and encouraging.
- **Accuracy**: Stick strictly to the provided context. If information is missing, state that it wasn't covered in the summary.
- **Clarity**: Use bullet points and bold text to enhance scannability.

## Interaction Prompt
End your summary with: 
"The key insights of **{leason_title}** are summarized above. Feel free to ask any specific questions about the details, examples, or concepts mentioned in this lesson!"
"""


def generate_leason_question_prompt(leason_title, leason_description, leason_type, leason_summary):
    prompt = f"""
# Role
You are a professional English Language Teacher. Your task is to create a quiz based on the lesson content provided.

# Lesson Context
- Title: {leason_title}
- Type: {leason_type}
- Description: {leason_description}
- Summary: {leason_summary}

# Task
Generate 10 multiple-choice questions (MCQs) in English based on the core concepts and vocabulary mentioned in the summary and description.

# Rules
1. **Language**: All questions and options must be in English.
2. **Structure**: Each question must have exactly 3 options (A, B, C).
3. **Correctness**: Only one option should be correct.
4. **Consistency**: Ensure the questions test the actual level and theme of the lesson.

# Output Format
Return ONLY a valid JSON array. Do not include any conversational text, markdown code blocks (like ```json), or explanations.

[
  {{
    "question_number": 1,
    "question": "The question text here...",
    "options": {{
      "A": "Option A",
      "B": "Option B",
      "C": "Option C"
    }},
    "answer": "A"
  }}
]
"""
    return prompt


def generate_recommend_laywer_prompt(lawyers, history, case_type, case_description, location, prosecute_date):
    prompt = f"""
    ### Role
    You are an expert Legal Matchmaking Assistant. Your task is to analyze a legal case and select the **single most suitable lawyer** from the provided database.

    ### Case Context
    * **Case Type:** {case_type}
    * **Detailed Description:** {case_description}
    * **Jurisdiction/Location:** {location}
    * **Target Prosecution Date:** {prosecute_date}
    * **Interaction History:** {history}

    ### Candidate Lawyer Database (JSON List)
    {lawyers}

    ### Selection Logic & Priorities
    1.  **Expertise Alignment:** The lawyer's `expertise` must directly align with the `case_type`.
    2.  **Geographic Proximity:** Prioritize lawyers whose `location` matches the case `location`.
    3.  **Performance Metrics:** Consider `rating` and the professional background described in the `introduction`.
    4.  **Feasibility:** Ensure the lawyer is capable of handling the case details provided in the history.

    ### Output Requirements
    * **Selection:** You must select exactly **one** lawyer.
    * **Format:** Return the result **strictly as a JSON object**. 
    * **Schema:** The JSON must contain only the `id` of the selected lawyer.
    * **Constraint:** Do not include any conversational filler, markdown explanations, or extra text. Only return the valid JSON object.

    ### Expected JSON Structure:
    {{
        "id": 103
    }}
    """
    return prompt
