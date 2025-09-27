import { ApiConfig } from '../types';
import { GoogleGenAI } from '@google/genai';

/**
 * Generates an image using Google's Gemini API.
 * @param prompt The text prompt for image generation.
 * @param apiKey The Google API key.
 * @param model The specific model to use for generation.
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
const generateWithGoogle = async (prompt: string, apiKey: string, model: string): Promise<string> => {
    // This model is for editing and will fail on generation. Provide a clear error.
    if (model === 'gemini-2.5-flash-image-preview') {
        throw new Error('O modelo "Gemini 2.5 Flash" é para EDIÇÃO de imagens, não para geração. Por favor, selecione outro modelo.');
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '16:9', // Correct aspect ratio for YouTube thumbnails
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("A API do Google não retornou nenhuma imagem.");
    }
    
    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
};

/**
 * Generates an image using OpenAI's DALL-E API.
 * @param prompt The text prompt for image generation.
 * @param apiKey The OpenAI API key.
 * @param model The specific model to use (e.g., 'dall-e-3').
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
const generateWithOpenAI = async (prompt: string, apiKey: string, model: string): Promise<string> => {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            prompt: prompt,
            n: 1,
            // DALL-E 3 supports widescreen, DALL-E 2 supports only square.
            // The API supports 1792x1024 for DALL-E 3 which is close to 16:9
            size: model === 'dall-e-2' ? '1024x1024' : '1792x1024',
            quality: (model === 'dall-e-3' || model === 'gpt-image-1') ? 'hd' : 'standard',
            response_format: 'b64_json', // Request base64 directly to avoid CORS issues
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API OpenAI: ${errorData.error.message}`);
    }

    const data = await response.json();
    const base64Json = data.data[0].b64_json;
    return `data:image/png;base64,${base64Json}`;
};

/**
 * Generates an image using a custom provider API.
 * @param prompt The text prompt for image generation.
 * @param config The full API configuration.
 * @returns A promise that resolves to a base64 data URL of the generated image.
 */
const generateWithCustomProvider = async (prompt: string, config: ApiConfig): Promise<string> => {
    const customProvider = config.customProviders.find(p => p.id === config.provider);
    if (!customProvider) {
        throw new Error(`Provedor customizado com ID "${config.provider}" não encontrado.`);
    }

    const response = await fetch(customProvider.endpointUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Assuming Bearer token authentication, common for these services
            'Authorization': `Bearer ${customProvider.apiKey}`,
        },
        // This body is a guess and should match the custom provider's API spec
        body: JSON.stringify({
            model: customProvider.model,
            prompt: prompt,
            n: 1,
            size: '1280x720',
            response_format: 'b64_json',
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API do provedor customizado (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    // Assuming the API returns a base64 string in a similar format to OpenAI
    if (!data.data || !data.data[0] || !data.data[0].b64_json) {
        throw new Error("Resposta do provedor customizado em formato inesperado.");
    }
    const base64Json = data.data[0].b64_json; 
    return `data:image/png;base64,${base64Json}`;
};

/**
 * Main function to generate a background image based on the selected provider.
 * @param prompt The text prompt for image generation.
 * @param config The API configuration containing the provider and keys.
 * @returns A promise that resolves to a base64 data URL of the image.
 */
export const generateBackgroundImage = async (prompt: string, config: ApiConfig): Promise<string> => {
    try {
        switch (config.provider) {
            case 'google':
                if (!config.googleApiKey) throw new Error("A chave de API do Google não foi configurada.");
                return await generateWithGoogle(prompt, config.googleApiKey, config.googleModel);
            case 'openai':
                if (!config.openAIApiKey) throw new Error("A chave de API da OpenAI não foi configurada.");
                return await generateWithOpenAI(prompt, config.openAIApiKey, config.openAIModel);
            default:
                 if (!config.customProviders.some(p => p.id === config.provider)) {
                    throw new Error(`Provedor "${config.provider}" desconhecido.`);
                }
                return await generateWithCustomProvider(prompt, config);
        }
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Falha na requisição (CORS?). APIs externas geralmente bloqueiam chamadas diretas do navegador. Use um proxy (como um Google Apps Script) como intermediário.');
        }
        throw error;
    }
};

/**
 * Tests the connection to the currently configured API provider.
 * @param config The API configuration.
 * @returns An object with a success flag and a message.
 */
export const testApiConnection = async (config: ApiConfig): Promise<{ success: boolean; message: string }> => {
    // A simple, low-cost prompt for testing
    const testPrompt = "um único cubo azul"; 
    try {
        let apiKey: string | undefined;
        let providerName: string = config.provider;

        if (config.provider === 'google') {
            apiKey = config.googleApiKey;
            providerName = 'Google';
        } else if (config.provider === 'openai') {
            apiKey = config.openAIApiKey;
            providerName = 'OpenAI';
        } else {
            const customProvider = config.customProviders.find(p => p.id === config.provider);
            if (customProvider) {
                apiKey = customProvider.apiKey;
                providerName = customProvider.name;
            }
        }
        
        if (!apiKey) {
             return { success: false, message: `Chave de API não configurada para ${providerName}.` };
        }

        // For Google test, use the faster model to save time and cost
        const testConfig = config.provider === 'google' 
            ? { ...config, googleModel: 'imagen-4.0-fast-generate-001' } 
            : config;

        await generateBackgroundImage(testPrompt, testConfig);
        return { success: true, message: `Conexão com ${providerName} bem-sucedida!` };
    } catch (error) {
        console.error("Falha no teste de conexão com a API:", error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             return { success: false, message: `Falha na conexão: Erro de CORS. APIs externas geralmente bloqueiam chamadas diretas do navegador. Use um proxy.` };
        }
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
        return { success: false, message: `Falha na conexão: ${errorMessage}` };
    }
};