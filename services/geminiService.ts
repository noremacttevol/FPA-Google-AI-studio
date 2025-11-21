import { GoogleGenAI, Type } from "@google/genai";
import { PendingAction } from "../types";

const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("No API Key found");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are FPAi, the Future Preparedness Alliance Intelligence.
You are a neighborhood preparedness assistant owned by the community.
Your goals:
1. Help users prepare for disasters (earthquakes, floods, grid down).
2. Be concise, practical, and encouraging. Use tactical but friendly language.
3. You learn by watching.
4. IF the user provides personal info, accept it, but do not explicitly confirm "I have saved this" unless asked. The system handles the saving.
`;

export const chatWithFPAi = async (
    history: { role: string; parts: { text: string }[] }[],
    message: string,
    isOffline: boolean
): Promise<string> => {
    if (isOffline) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(
                    "OFFLINE MODE: I'm running from local storage. I can access your saved checklists and squad maps, but I cannot browse the web or sync with the cloud right now."
                );
            }, 500);
        });
    }

    const client = getClient();
    if (!client) return "Error: API Key missing.";

    try {
        // Construct the full history for the stateless generateContent call
        const contents = history.map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts,
        }));

        // Add the new message
        contents.push({
            role: 'user',
            parts: [{ text: message }],
        });

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
            },
        });

        return response.text || "System error: No response text.";
    } catch (error) {
        console.error("FPAi Chat Error:", error);
        return "Connection failed. Ensure your API key is valid.";
    }
};

export const analyzeInputForData = async (userMessage: string): Promise<PendingAction | null> => {
    const client = getClient();
    if (!client) return null;

    try {
        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this user message for preparedness data: "${userMessage}".
            Did the user mention possessing a specific survival skill or owning specific inventory?
            
            Examples:
            "I have a ham radio license" -> ADD_SKILL (Ham Radio, Expert)
            "Bought 5 gallons of water" -> ADD_INVENTORY (Water, 5, gallons)
            "I live in Seattle" -> UPDATE_INFO (Location: Seattle)
            "What should I buy?" -> detected: false
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        detected: { type: Type.BOOLEAN },
                        type: {
                            type: Type.STRING,
                            enum: ["ADD_SKILL", "ADD_INVENTORY", "UPDATE_INFO"],
                        },
                        description: { type: Type.STRING },
                        data: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                level: { type: Type.STRING },
                                quantity: { type: Type.NUMBER },
                                category: { type: Type.STRING },
                                value: { type: Type.STRING }
                            }
                        },
                        confidence: { type: Type.NUMBER },
                    },
                    required: ["detected"],
                },
            },
        });

        const text = response.text;
        if (!text) return null;
        
        const result = JSON.parse(text);

        if (result.detected && result.type) {
            return {
                id: crypto.randomUUID(),
                type: result.type as any,
                description: result.description || "New data detected",
                data: result.data || {},
                confidence: result.confidence || 0.8,
            };
        }
        return null;

    } catch (error) {
        console.error("Observer Error:", error);
        return null;
    }
};