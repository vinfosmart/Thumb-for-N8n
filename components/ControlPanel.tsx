import React, { useState } from 'react';
import { ApiConfig, ThumbnailState } from '../types';
import { GOOGLE_IMAGE_MODELS, OPENAI_IMAGE_MODELS, TEXT_STYLE_PRESETS } from '../constants';

interface ControlPanelProps {
  onGenerate: (topic: string, imagePrompt: string) => Promise<void>;
  onQuickTestGenerate: (topic: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  topic: string;
  imagePrompt: string;
  apiConfig: ApiConfig;
  onApiConfigChange: (config: Partial<ApiConfig>) => void;
  triggerWebhookRef: React.MutableRefObject<() => Promise<void>>;
  thumbnailState: ThumbnailState;
}

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { onGenerate, onQuickTestGenerate, loading, error, topic, imagePrompt, apiConfig, onApiConfigChange } = props;
    const [testTopic, setTestTopic] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim() && imagePrompt.trim() && !loading) {
            await onGenerate(topic, imagePrompt);
        }
    };
    
    const handleTestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (testTopic.trim() && !loading) {
            await onQuickTestGenerate(testTopic);
        }
    };
    
    const renderModelSelector = () => {
        if (apiConfig.provider === 'google') {
            return (
                <select value={apiConfig.googleModel} onChange={(e) => onApiConfigChange({ googleModel: e.target.value })} className="input-field">
                    {GOOGLE_IMAGE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
            );
        }
        if (apiConfig.provider === 'openai') {
            return (
                <select value={apiConfig.openAIModel} onChange={(e) => onApiConfigChange({ openAIModel: e.target.value })} className="input-field">
                    {OPENAI_IMAGE_MODELS.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                </select>
            );
        }
        const customProvider = apiConfig.customProviders.find(p => p.id === apiConfig.provider);
        if (customProvider) {
            // For custom providers, the model is often a string input, not a dropdown.
            // Here we show it as a read-only field for clarity. It's edited in settings.
            return <div className="input-field bg-gray-700/50 cursor-default">{customProvider.model}</div>;
        }
        return null;
    };

    return (
        <div className="h-full flex flex-col">
            <style>{`.input-field { width: 100%; background-color: #374151; border: 1px solid #4B5563; color: #F3F4F6; padding: 0.75rem; border-radius: 0.5rem; } .input-field:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4); }`}</style>
            <div className="flex-shrink-0 bg-gray-700 p-4 rounded-t-2xl">
                <h2 className="text-xl font-bold text-white">Painel de Geração</h2>
            </div>
            <div className="flex-grow overflow-y-auto bg-gray-800 rounded-b-2xl p-6 space-y-8">
                
                <section>
                    <h3 className="text-lg font-semibold text-indigo-300">Configuração Rápida</h3>
                    <div className="space-y-4 mt-2">
                        <InputGroup label="Provedor de Imagem">
                             <select value={apiConfig.provider} onChange={(e) => onApiConfigChange({ provider: e.target.value })} className="input-field">
                                <option value="google">Google (Imagen 4)</option>
                                <option value="openai">OpenAI (DALL-E)</option>
                                {apiConfig.customProviders.length > 0 && <option disabled>──────────</option>}
                                {apiConfig.customProviders.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                            </select>
                        </InputGroup>
                        <InputGroup label="Modelo de IA">
                           {renderModelSelector()}
                        </InputGroup>
                        <InputGroup label="Estilo de Texto">
                           <select value={apiConfig.selectedStyleId || ''} onChange={(e) => onApiConfigChange({ selectedStyleId: e.target.value })} className="input-field">
                                {TEXT_STYLE_PRESETS.map(preset => (
                                    <option key={preset.id} value={preset.id}>{preset.name}</option>
                                ))}
                            </select>
                        </InputGroup>
                    </div>
                </section>
                
                <section className="pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">Geração via n8n</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <InputGroup label="Título do Vídeo (recebido do n8n)">
                            <input type="text" value={topic} readOnly className="input-field bg-gray-900/50 border-gray-700 cursor-default" />
                        </InputGroup>
                         <InputGroup label="Prompt da Imagem (recebido do n8n)">
                            <textarea value={imagePrompt} readOnly className="input-field bg-gray-900/50 border-gray-700 cursor-default h-24" />
                        </InputGroup>
                        <button type="submit" disabled={loading || !topic.trim() || !imagePrompt.trim()} className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200">
                            {loading ? 'Gerando Arte com IA...' : 'Gerar Thumbnail (via n8n)'}
                        </button>
                    </form>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </section>

                <section className="pt-6 border-t border-gray-700">
                    <h3 className="text-lg font-semibold text-indigo-300">Teste Rápido da Ferramenta</h3>
                     <form onSubmit={handleTestSubmit} className="space-y-4 mt-3">
                        <InputGroup label="Título para Teste">
                            <input type="text" value={testTopic} onChange={(e) => setTestTopic(e.target.value)} placeholder="Ex: 5 Hábitos para um Dia Produtivo" className="input-field" />
                        </InputGroup>
                        <button type="submit" disabled={loading || !testTopic.trim()} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg">
                            {loading ? 'Gerando Teste...' : 'Gerar Teste Rápido'}
                        </button>
                    </form>
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
