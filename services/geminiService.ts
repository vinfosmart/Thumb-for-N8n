import { GoogleGenAI, Type } from "@google/genai";
import { AICreatedConcept, AIFullConcept } from '../types';

// FIX: Pass API key as an argument to use the user-provided key from the UI, ensuring consistency.
export const generateSubtitleAndColors = async (topic: string, apiKey: string): Promise<AICreatedConcept> => {
  if (!apiKey) {
    throw new Error("A chave de API do Google não foi fornecida.");
  }
  try {
    const ai = new GoogleGenAI({ apiKey });

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            subtitle: { type: Type.STRING, description: 'Um subtítulo muito curto e complementar para a thumbnail (máx 6 palavras).' },
            titleColor: { type: Type.STRING, description: 'Um código de cor hexadecimal de alto contraste para o texto do título principal, que funcione bem sobre um fundo dinâmico. Ex: #FFFFFF' },
            subtitleColor: { type: Type.STRING, description: 'Um código de cor hexadecimal para o texto do subtítulo que complemente a cor do título. Ex: #00D1FF' },
        },
        required: ['subtitle', 'titleColor', 'subtitleColor']
    };

    const prompt = `O título de um vídeo do YouTube é "${topic}". Gere um subtítulo curto e impactante e duas cores de texto (para título e subtítulo) que sejam visualmente atraentes para uma thumbnail.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erro ao chamar a API Gemini para geração de conceito:", error);
    throw error;
  }
};

// FIX: Pass API key as an argument to use the user-provided key from the UI.
export const generateFullConceptFromTitle = async (topic: string, apiKey: string): Promise<AIFullConcept> => {
  if (!apiKey) {
    throw new Error("A chave de API do Google não foi fornecida.");
  }
  try {
    const ai = new GoogleGenAI({ apiKey });

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            subtitle: { type: Type.STRING, description: 'Um subtítulo muito curto e complementar para a thumbnail (máx 6 palavras).' },
            titleColor: { type: Type.STRING, description: 'Um código de cor hexadecimal de alto contraste para o texto do título principal. Ex: #FFFFFF' },
            subtitleColor: { type: Type.STRING, description: 'Um código de cor hexadecimal para o texto do subtítulo que complemente a cor do título. Ex: #00D1FF' },
            imagePrompt: { 
                type: Type.STRING, 
                description: `Um prompt detalhado para um gerador de imagens (DALL-E, Midjourney). O prompt deve descrever uma cena fotorrealista e cinematográfica. A imagem DEVE incluir uma ou mais pessoas reais e ser relevante para o título. Componha a cena de forma que a área central da imagem seja visualmente menos complexa, deixando espaço para sobreposição de texto. Evite colocar rostos ou elementos cruciais no centro exato da imagem. O estilo deve ser vibrante e de alta qualidade.` 
            },
        },
        required: ['subtitle', 'titleColor', 'subtitleColor', 'imagePrompt']
    };

    const prompt = `O título de um vídeo do YouTube é "${topic}". Gere um conceito completo para uma thumbnail: um subtítulo curto e impactante, duas cores de texto atraentes e um prompt detalhado para gerar a imagem de fundo.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Erro ao chamar a API Gemini para geração de conceito completo:", error);
    throw error;
  }
};
