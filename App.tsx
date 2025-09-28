import React, { useState, useCallback, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { ThumbnailState, ApiConfig, HistoryItem } from './types';
import CanvasRenderer from './components/CanvasRenderer';
import ControlPanel from './components/ControlPanel';
import Header from './components/Header';
import SupabaseCredentials from './components/SupabaseCredentials';
import SettingsModal from './components/SettingsModal';
import { generateSubtitleAndColors, generateFullConceptFromTitle } from './services/geminiService';
import { generateBackgroundImage } from './services/imageService';
import { uploadImageToDrive } from './services/googleDriveService';
import * as db from './services/supabaseService';
import { TEXT_STYLE_PRESETS } from './constants';

const initialThumbnailState: ThumbnailState = {
  templateId: 'ai',
  title: 'GERADOR DE THUMBNAILS',
  subtitle: 'Automação com n8n e IA',
  titleFont: 'Montserrat',
  subtitleFont: 'Roboto',
  titleColor: '#FFFFFF',
  subtitleColor: '#00D1FF',
  backgroundColor1: '#1a1a1a',
  backgroundColor2: '#000000',
  showLogo: false,
  backgroundImageUrl: undefined,
};

const App: React.FC = () => {
  // FIX: Initialize state directly from localStorage to prevent reset on hot-reloads.
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(() => {
    try {
      const storedUrl = localStorage.getItem('supabaseUrl');
      const storedKey = localStorage.getItem('supabaseAnonKey');
      if (storedUrl && storedKey) {
        return db.createSupabaseClient(storedUrl, storedKey);
      }
    } catch (e) {
      console.error("Failed to initialize Supabase client from localStorage", e);
    }
    return null;
  });

  const [loadingApp, setLoadingApp] = useState(true);

  const [thumbnailState, setThumbnailState] = useState<ThumbnailState>(initialThumbnailState);
  const [topic, setTopic] = useState<string>('');
  const [imagePrompt, setImagePrompt] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'google',
    openAIApiKey: '',
    googleApiKey: '',
    googleModel: 'imagen-4.0-generate-001',
    openAIModel: 'dall-e-3',
    customProviders: [],
    isAutonomous: false,
    googleDriveScriptUrl: '',
    selectedStyleId: 'moderno',
    webhookUrl: '',
    n8nApiKey: '',
  });
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const triggerWebhookRef = React.useRef<() => Promise<void>>(async () => {});

  // Fetch user data once the client is available
  useEffect(() => {
    if (supabaseClient) {
        const fetchUserData = async () => {
            setLoadingApp(true);
            const [configData, historyData] = await Promise.all([
                db.getApiConfig(supabaseClient),
                db.getHistory(supabaseClient)
            ]);

            if (configData) {
                setApiConfig(prev => ({...prev, ...configData}));
                const style = TEXT_STYLE_PRESETS.find(s => s.id === configData.selectedStyleId);
                if (style) {
                  setThumbnailState(prev => ({ ...prev, titleFont: style.titleFont, subtitleFont: style.subtitleFont, titleColor: style.titleColor, subtitleColor: style.subtitleColor }));
                }
            }
            if (historyData) {
                setHistory(historyData);
            }
            setLoadingApp(false);
        };
        fetchUserData();

        const urlParams = new URLSearchParams(window.location.search);
        const topicFromUrl = urlParams.get('topic');
        const imagePromptFromUrl = urlParams.get('image_prompt');
        if (topicFromUrl) setTopic(decodeURIComponent(topicFromUrl));
        if (imagePromptFromUrl) setImagePrompt(decodeURIComponent(imagePromptFromUrl));
    } else {
        setLoadingApp(false);
    }
  }, [supabaseClient]);


  const updateHistoryAndTriggerActions = useCallback(async (item: Omit<HistoryItem, 'id' | 'created_at'>) => {
    if (!supabaseClient) return;
    const { title, imageUrl } = item;
    const newHistoryItem = await db.addHistoryItem(supabaseClient, item);
    if (newHistoryItem) {
        setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, 20));
    }

    if (apiConfig.googleDriveScriptUrl && imageUrl) {
        uploadImageToDrive(apiConfig.googleDriveScriptUrl, imageUrl, `${title.replace(/ /g, '_')}.jpg`)
          .catch(err => console.error("Falha ao enviar para o Google Drive:", err));
    }
    if (apiConfig.isAutonomous) {
      setTimeout(() => triggerWebhookRef.current(), 100); 
    }
  }, [apiConfig.googleDriveScriptUrl, apiConfig.isAutonomous, triggerWebhookRef, supabaseClient]);

  const handleGenerate = useCallback(async (currentTopic: string, currentImagePrompt: string) => {
    if (!apiConfig.googleApiKey) {
      setError("A chave de API do Google é necessária para gerar o subtítulo. Por favor, configure-a no menu de configurações (⚙️).");
      return;
    }
    const customProvider = apiConfig.provider !== 'google' && apiConfig.provider !== 'openai' ? apiConfig.customProviders.find(p => p.id === apiConfig.provider) : null;
    if ((apiConfig.provider === 'openai' && !apiConfig.openAIApiKey) || (apiConfig.provider === 'google' && !apiConfig.googleApiKey) || (customProvider && !customProvider.apiKey)) {
      setError("Chave de API não configurada para o provedor de imagem selecionado. Configure-a no menu de configurações (⚙️).");
      return;
    }
    setLoading(true); setError(null);
    try {
      const concept = await generateSubtitleAndColors(currentTopic, apiConfig.googleApiKey);
      const imageUrl = await generateBackgroundImage(currentImagePrompt, apiConfig);
      const selectedStyle = TEXT_STYLE_PRESETS.find(s => s.id === apiConfig.selectedStyleId);
      const finalState: ThumbnailState = {
        ...initialThumbnailState, title: currentTopic, subtitle: concept.subtitle,
        titleFont: selectedStyle?.titleFont || 'Montserrat', subtitleFont: selectedStyle?.subtitleFont || 'Roboto',
        titleColor: selectedStyle?.titleColor || concept.titleColor, subtitleColor: selectedStyle?.subtitleColor || concept.subtitleColor,
        backgroundImageUrl: imageUrl,
      };
      setThumbnailState(finalState);
      await updateHistoryAndTriggerActions({
        title: currentTopic,
        subtitle: concept.subtitle,
        imagePrompt: currentImagePrompt,
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Erro na geração:", error);
      setError(error instanceof Error ? error.message : "Falha ao gerar thumbnail.");
    } finally {
      setLoading(false);
    }
  }, [apiConfig, updateHistoryAndTriggerActions]);
  
  const handleQuickTestGenerate = useCallback(async (testTopic: string) => {
    if (!apiConfig.googleApiKey) {
      setError("A chave de API do Google é necessária para o teste rápido. Configure-a no menu de configurações (⚙️).");
      return;
    }
    const customProvider = apiConfig.provider !== 'google' && apiConfig.provider !== 'openai' ? apiConfig.customProviders.find(p => p.id === apiConfig.provider) : null;
    if ((apiConfig.provider === 'openai' && !apiConfig.openAIApiKey) || (apiConfig.provider === 'google' && !apiConfig.googleApiKey) || (customProvider && !customProvider.apiKey)) {
      setError("Chave de API não configurada para o provedor de imagem selecionado. Configure-a no menu de configurações (⚙️).");
      return;
    }
    setLoading(true); setError(null);
    try {
      const concept = await generateFullConceptFromTitle(testTopic, apiConfig.googleApiKey);
      setTopic(testTopic); setImagePrompt(concept.imagePrompt);
      const imageUrl = await generateBackgroundImage(concept.imagePrompt, apiConfig);
      const selectedStyle = TEXT_STYLE_PRESETS.find(s => s.id === apiConfig.selectedStyleId);
      const finalState: ThumbnailState = {
        ...initialThumbnailState, title: testTopic, subtitle: concept.subtitle,
        titleFont: selectedStyle?.titleFont || 'Montserrat', subtitleFont: selectedStyle?.subtitleFont || 'Roboto',
        titleColor: selectedStyle?.titleColor || concept.titleColor, subtitleColor: selectedStyle?.subtitleColor || concept.subtitleColor,
        backgroundImageUrl: imageUrl,
      };
      setThumbnailState(finalState);
      await updateHistoryAndTriggerActions({
        title: testTopic,
        subtitle: concept.subtitle,
        imagePrompt: concept.imagePrompt,
        imageUrl: imageUrl,
      });
    } catch (error) {
      console.error("Erro na geração de teste:", error);
      setError(error instanceof Error ? error.message : "Falha ao gerar thumbnail de teste.");
    } finally {
      setLoading(false);
    }
  }, [apiConfig, updateHistoryAndTriggerActions]);

  const handleApiConfigChange = (newConfig: Partial<ApiConfig>) => {
    if (!supabaseClient) return;
    const updatedConfig = { ...apiConfig, ...newConfig };
    setApiConfig(updatedConfig);
    db.saveApiConfig(supabaseClient, updatedConfig);
     // If the style changes, update the canvas preview immediately
    if (newConfig.selectedStyleId) {
      const style = TEXT_STYLE_PRESETS.find(s => s.id === newConfig.selectedStyleId);
      if (style) {
        setThumbnailState(prev => ({
          ...prev,
          titleFont: style.titleFont,
          subtitleFont: style.subtitleFont,
          titleColor: style.titleColor,
          subtitleColor: style.subtitleColor,
        }));
      }
    }
  };
  
  const clearHistory = async () => {
    if (!supabaseClient) return;
    await db.clearHistory(supabaseClient);
    setHistory([]);
  }

  const handleConnectSupabase = (url: string, key: string) => {
    localStorage.setItem('supabaseUrl', url);
    localStorage.setItem('supabaseAnonKey', key);
    const client = db.createSupabaseClient(url, key);
    setSupabaseClient(client);
  };

  const handleDisconnectSupabase = () => {
    localStorage.removeItem('supabaseUrl');
    localStorage.removeItem('supabaseAnonKey');
    setSupabaseClient(null);
    setApiConfig({ // Reset config to default
      provider: 'google', openAIApiKey: '', googleApiKey: '',
      googleModel: 'imagen-4.0-generate-001', openAIModel: 'dall-e-3',
      customProviders: [], isAutonomous: false, googleDriveScriptUrl: '',
      selectedStyleId: 'moderno', webhookUrl: '', n8nApiKey: '',
    });
    setHistory([]);
    setIsSettingsModalOpen(false);
  };

  if (loadingApp) {
      return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  if (!supabaseClient) {
      return <SupabaseCredentials onConnect={handleConnectSupabase} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="flex-grow p-4 md:p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden">
                <ControlPanel
                    onGenerate={handleGenerate}
                    onQuickTestGenerate={handleQuickTestGenerate}
                    loading={loading}
                    error={error}
                    topic={topic}
                    imagePrompt={imagePrompt}
                    apiConfig={apiConfig}
                    onApiConfigChange={handleApiConfigChange}
                    triggerWebhookRef={triggerWebhookRef}
                    thumbnailState={thumbnailState}
                />
            </div>
            <div className="lg:col-span-2 bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 flex items-center justify-center min-w-0">
                <CanvasRenderer state={thumbnailState} />
            </div>
        </div>
        
        {isSettingsModalOpen && (
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            apiConfig={apiConfig}
            onApiConfigChange={handleApiConfigChange}
            onDisconnect={handleDisconnectSupabase}
          />
        )}

        {history.length > 0 && (
          <section className="bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Histórico de Criações</h2>
              <button onClick={clearHistory} className="text-sm text-gray-400 hover:text-red-400">Limpar Histórico</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {history.map(item => (
                <div key={item.id} className="aspect-[16/9] bg-gray-700 rounded-lg overflow-hidden group relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="font-bold truncate">{item.title}</p>
                    <p className="text-gray-300">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default App;
