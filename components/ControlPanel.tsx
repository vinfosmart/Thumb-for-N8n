
import React, { useState, useEffect } from 'react';
import { ApiConfig, ThumbnailState } from '../types';
import { testApiConnection } from '../services/imageService';
import { TEXT_STYLE_PRESETS, GOOGLE_IMAGE_MODELS, OPENAI_IMAGE_MODELS } from '../constants';

interface ControlPanelProps {
  onGenerate: (topic: string, imagePrompt: string) => Promise<void>;
  onQuickTestGenerate: (topic: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  topic: string;
  imagePrompt: string;
  apiConfig: ApiConfig;
  onApiConfigChange: (config: Partial<ApiConfig>) => void;
  onManageProvidersClick: () => void;
  triggerWebhookRef: React.MutableRefObject<() => Promise<void>>;
  thumbnailState: ThumbnailState;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { onGenerate, onQuickTestGenerate, loading, error, topic, imagePrompt, apiConfig, onApiConfigChange, onManageProvidersClick, triggerWebhookRef, thumbnailState } = props;

    const [testTopic, setTestTopic] = useState('');
    const [generatedData, setGeneratedData] = useState<string | null>(null);
    
    const [isSending, setIsSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState<string | null>(null);
    const [sendError, setSendError] = useState<string | null>(null);

    const [testingApi, setTestingApi] = useState(false);
    const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

    const [styleJustSaved, setStyleJustSaved] = useState<string | null>(null);

    useEffect(() => {
      const canvas = document.querySelector('canvas');
      if (canvas && thumbnailState.backgroundImageUrl && !loading) {
        const imageUrl = canvas.toDataURL('image/jpeg', 0.9);
        const payload = {
          title: thumbnailState.title,
          subtitle: thumbnailState.subtitle,
          backgroundImageBase64: imageUrl.split(',')[1]
        };
        setGeneratedData(JSON.stringify(payload, null, 2));
      }
    }, [thumbnailState, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && imagePrompt.trim() && !loading) {
            setGeneratedData(null); setSendSuccess(null); setSendError(null);
            await onGenerate(topic, imagePrompt);
        }
    };
    
    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (testTopic.trim() && !loading) {
            setGeneratedData(null); setSendSuccess(null); setSendError(null);
            await onQuickTestGenerate(testTopic);
        }
    };

    const handleTriggerWorkflow = async () => {
        if (!apiConfig.webhookUrl || !generatedData) {
            setSendError("URL do Webhook e dados gerados são obrigatórios.");
            return;
        }
        setIsSending(true); setSendSuccess(null); setSendError(null);
        try {
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (apiConfig.n8nApiKey) headers['X-API-KEY'] = apiConfig.n8nApiKey;

            const response = await fetch(apiConfig.webhookUrl, { method: 'POST', headers, body: generatedData });
            if (!response.ok) throw new Error(`Requisição falhou: ${response.status} ${response.statusText}`);
            setSendSuccess("Workflow do n8n acionado com sucesso!");
        } catch (err) {
            setSendError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
        } finally {
            setIsSending(false);
        }
    };
    
    useEffect(() => {
        triggerWebhookRef.current = handleTriggerWorkflow;
    }, [apiConfig.webhookUrl, generatedData, apiConfig.n8nApiKey]);


    const handleTestConnection = async () => {
        setTestingApi(true);
        setTestResult(null);
        const result = await testApiConnection(apiConfig);
        setTestResult(result);
        setTestingApi(false);
    };
    
    const handleStyleSelect = (styleId: string) => {
        onApiConfigChange({ selectedStyleId: styleId });
        const style = TEXT_STYLE_PRESETS.find(s => s.id === styleId);
        if (style) {
            onApiConfigChange({
                selectedStyleId: styleId,
            });
        }
        setStyleJustSaved(styleId);
        setTimeout(() => setStyleJustSaved(null), 2000);
    };

    const googleAppsScriptCode = `function doPost(e) { /* ... (código inalterado) ... */ }`;
    
    const isCustomProvider = apiConfig.provider !== 'google' && apiConfig.provider !== 'openai';
    const currentCustomProvider = isCustomProvider ? apiConfig.customProviders.find(p => p.id === apiConfig.provider) : null;
    
    const getApiKeyForCurrentProvider = () => {
        if(apiConfig.provider === 'google') return apiConfig.googleApiKey;
        if(apiConfig.provider === 'openai') return apiConfig.openAIApiKey;
        return currentCustomProvider?.apiKey || '';
    }

    return (
        <div className="h-full flex flex-col">
            <style>{`.input-field { width: 100%; background-color: #374151; border: 1px solid #4B5563; color: #F3F4F6; padding: 0.75rem; border-radius: 0.5rem; } .input-field:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4); } .code-block { white-space: pre-wrap; background-color: #1f2937; padding: 0.5rem 0.75rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; color: #d1d5db; word-break: break-all; }`}</style>
            <div className="flex-shrink-0 bg-gray-700 p-4 rounded-t-2xl"><h2 className="text-xl font-bold text-white">Painel de Automação n8n</h2></div>
            <div className="flex-grow p-6 overflow-y-auto bg-gray-800 rounded-b-2xl space-y-8">
                {/* Seções 1, 2, 3, 4, 5 e "Como Integrar" usam onApiConfigChange para salvar dados */}
                <section>
                    <h3 className="text-lg font-semibold text-indigo-300">1. Geração da Thumbnail</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <InputGroup label="Título do Vídeo (recebido do n8n)">
                            <input type="text" value={topic} readOnly className="input-field bg-gray-800 border-gray-700 cursor-default" />
                        </InputGroup>
                         <InputGroup label="Prompt da Imagem (recebido do n8n)">
                            <textarea value={imagePrompt} readOnly className="input-field bg-gray-800 border-gray-700 cursor-default h-24" />
                        </InputGroup>
                        <button type="submit" disabled={loading || !topic.trim() || !imagePrompt.trim()} className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                            {loading ? 'Gerando Arte com IA...' : 'Gerar Thumbnail (via n8n)'}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <h4 className="text-md font-semibold text-gray-200">Teste Rápido da Ferramenta</h4>
                         <form onSubmit={handleTestSubmit} className="space-y-4 mt-3">
                            <InputGroup label="Título para Teste">
                                <input type="text" value={testTopic} onChange={(e) => setTestTopic(e.target.value)} placeholder="Ex: 5 Hábitos para um Dia Produtivo" className="input-field" />
                            </InputGroup>
                            <button type="submit" disabled={loading || !testTopic.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">
                                {loading ? 'Gerando Teste...' : 'Gerar Teste Rápido'}
                            </button>
                        </form>
                    </div>
                </section>
                
                <section className="space-y-6 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">2. Configurações da API</h3>
                    <div className='space-y-4'>
                         <InputGroup label="Provedor de Imagem">
                            <div className="flex gap-2">
                                <select value={apiConfig.provider} onChange={(e) => { onApiConfigChange({ provider: e.target.value }); setTestResult(null); }} className="input-field flex-grow">
                                    <option value="google">Google Gemini</option>
                                    <option value="openai">OpenAI DALL-E</option>
                                    {apiConfig.customProviders.length > 0 && <option disabled>──────────</option>}
                                    {apiConfig.customProviders.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                                </select>
                                <button onClick={onManageProvidersClick} className="bg-gray-600 hover:bg-gray-500 text-white font-bold p-3 rounded-lg" title="Adicionar/Gerenciar Provedores">+</button>
                            </div>
                        </InputGroup>
                        {/* Seletor de modelos e campo de API Key... */}
                        {apiConfig.provider === 'google' && ( <InputGroup label="Chave de API (Google)"><input type="password" value={apiConfig.googleApiKey} onChange={(e) => onApiConfigChange({ googleApiKey: e.target.value })} className="input-field" /></InputGroup> )}
                        {apiConfig.provider === 'openai' && ( <InputGroup label="Chave de API (OpenAI)"><input type="password" value={apiConfig.openAIApiKey} onChange={(e) => onApiConfigChange({ openAIApiKey: e.target.value })} className="input-field" /></InputGroup> )}
                        <button onClick={handleTestConnection} disabled={testingApi || !getApiKeyForCurrentProvider()} className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">Testar Conexão</button>
                        {testResult && <p className={`text-sm mt-2 ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>{testResult.message}</p>}
                    </div>
                </section>

                <section className="space-y-6 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">3. Envio para o n8n</h3>
                    <div className='space-y-4'>
                        <InputGroup label="Modo Autônomo">
                            <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
                                <span className="text-gray-300">Enviar para n8n automaticamente</span>
                                <button onClick={() => onApiConfigChange({ isAutonomous: !apiConfig.isAutonomous })} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${apiConfig.isAutonomous ? 'bg-teal-500' : 'bg-gray-600'}`}>
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${apiConfig.isAutonomous ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>
                        </InputGroup>
                         <InputGroup label="URL do Webhook n8n">
                            <input type="text" value={apiConfig.webhookUrl} onChange={(e) => onApiConfigChange({ webhookUrl: e.target.value })} placeholder="Cole a URL do seu nó Webhook" className="input-field" />
                        </InputGroup>
                        <InputGroup label="API Key do n8n (Opcional)">
                            <input type="password" value={apiConfig.n8nApiKey} onChange={(e) => onApiConfigChange({ n8nApiKey: e.target.value })} placeholder="Se o seu webhook for protegido" className="input-field" />
                        </InputGroup>
                        {generatedData && !apiConfig.isAutonomous && (
                             <button onClick={handleTriggerWorkflow} disabled={isSending || !apiConfig.webhookUrl} className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">
                                {isSending ? 'Enviando...' : 'Enviar para o n8n Manualmente'}
                            </button>
                        )}
                        {sendSuccess && <p className="text-green-400 text-sm mt-2">{sendSuccess}</p>}
                        {sendError && <p className="text-red-400 text-sm mt-2">Erro: {sendError}</p>}
                    </div>
                </section>

                <section className="space-y-6 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">4. Salvar no Google Drive</h3>
                     <InputGroup label="URL do Web App (Google Apps Script)">
                        <input type="text" value={apiConfig.googleDriveScriptUrl} onChange={(e) => onApiConfigChange({ googleDriveScriptUrl: e.target.value })} placeholder="Cole a URL do seu Web App implantado" className="input-field" />
                    </InputGroup>
                </section>
                
                <section className="space-y-4 pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">5. Estilo de Texto Padrão</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {TEXT_STYLE_PRESETS.map((preset) => (
                            <div key={preset.id} onClick={() => handleStyleSelect(preset.id)} className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${apiConfig.selectedStyleId === preset.id ? 'border-indigo-500 bg-indigo-900/50' : 'border-gray-600 bg-gray-700 hover:border-indigo-600'}`}>
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">{preset.name}</h4>
                                    {styleJustSaved === preset.id && <span className="text-green-400 text-sm">Salvo! ✓</span>}
                                </div>
                                <div className="text-center bg-gray-800 p-2 rounded">
                                    <p style={{ fontFamily: preset.titleFont, color: preset.titleColor, fontSize: '1.5rem', fontWeight: 900, lineHeight: 1.1 }}>TÍTULO</p>
                                    <p style={{ fontFamily: preset.subtitleFont, color: preset.subtitleColor, fontSize: '0.875rem', fontWeight: 700, marginTop: '4px' }}>Subtítulo</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

export default ControlPanel;
