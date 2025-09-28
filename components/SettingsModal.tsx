import React, { useState, useEffect } from 'react';
import { ApiConfig, CustomProviderConfig } from '../types';
import { testApiConnection } from '../services/imageService';
import AddProviderModal from './AddProviderModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiConfig: ApiConfig;
  onApiConfigChange: (config: Partial<ApiConfig>) => void;
  onDisconnect: () => void;
}

const GoogleDriveTutorial = () => {
    const scriptCode = `function doPost(e) {
  try {
    // 1. Parse the incoming data from the tool
    var data = JSON.parse(e.postData.contents);
    var base64Data = data.imageData;
    var fileName = data.fileName || ('thumbnail_' + new Date().getTime() + '.jpg');
    var mimeType = data.mimeType || 'image/jpeg';
    
    // 2. Decode the Base64 image data
    var decodedData = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decodedData, mimeType, fileName);
    
    // 3. Find or create the destination folder in Google Drive
    // IMPORTANTE: Altere "Thumbnails Geradas Pela IA" para o nome da pasta que você desejar.
    var folderName = "Thumbnails Geradas Pela IA";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder;
    
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }
    
    // 4. Create the file in the specified folder
    var file = folder.createFile(blob);
    
    // 5. Return a success response (optional, but good practice)
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'fileId': file.getId(),
      'fileName': file.getName()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    // 6. Log and return an error response if something goes wrong
    Logger.log(err);
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

    return (
        <div className="text-sm text-gray-300 space-y-4 p-4 bg-gray-900 rounded-lg mt-3">
            <h4 className="font-bold text-base text-white">Guia Rápido: Salvando Imagens no Google Drive</h4>
            <ol className="list-decimal list-inside space-y-3">
                <li>Acesse o <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Apps Script</a> e crie um <strong className="text-white">"Novo projeto"</strong>.</li>
                <li>Apague todo o código padrão e cole o script abaixo. Se desejar, altere o nome da pasta no código.
                    <pre className="code-block mt-2 text-xs max-h-40 overflow-auto">{scriptCode}</pre>
                </li>
                <li>Clique em <strong className="text-white">"Implantar"</strong> {'>'} <strong className="text-white">"Nova implantação"</strong>.</li>
                <li>Clique no ícone de engrenagem (⚙️), selecione <strong className="text-white">"App da Web"</strong>.</li>
                <li>Configure da seguinte forma:
                    <ul className="list-disc list-inside ml-4 mt-1 text-gray-400">
                        <li>Executar como: <strong className="text-white">Eu</strong></li>
                        <li>Quem pode acessar: <strong className="text-white">Qualquer pessoa</strong></li>
                    </ul>
                </li>
                <li>Clique em <strong className="text-white">"Implantar"</strong> e autorize as permissões.</li>
                <li><strong className="text-green-400">Copie a URL do App da Web</strong> e cole no campo acima.</li>
            </ol>
        </div>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiConfig, onApiConfigChange, onDisconnect }) => {
  const [localConfig, setLocalConfig] = useState<ApiConfig>(apiConfig);
  const [connectionTestResult, setConnectionTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isAddProviderModalOpen, setIsAddProviderModalOpen] = useState(false);
  const [showDriveTutorial, setShowDriveTutorial] = useState(false);
  
  useEffect(() => {
    setLocalConfig(apiConfig);
  }, [apiConfig, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;
    setLocalConfig(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    setConnectionTestResult(null); // Reset test result on change
  };

  const handleSave = () => {
    onApiConfigChange(localConfig);
    onClose();
  };
  
  const handleTestConnection = async () => {
      setIsTesting(true);
      setConnectionTestResult(null);
      // Temporarily use the local config for testing without saving it first
      const result = await testApiConnection(localConfig);
      setConnectionTestResult(result);
      setIsTesting(false);
  };
  
  const handleSaveProviders = (providers: CustomProviderConfig[]) => {
    const newConfig = { ...localConfig, customProviders: providers };
    setLocalConfig(newConfig);
    onApiConfigChange(newConfig); // Also save immediately
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl p-8 text-white max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-bold">Configurações</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-4 mt-6 space-y-8">
              {/* API Keys Section */}
              <section>
                  <h3 className="text-lg font-semibold text-indigo-300">Chaves de API</h3>
                  <div className="space-y-4 mt-2">
                      <InputGroup label="Google Gemini API Key">
                          <input type="password" name="googleApiKey" value={localConfig.googleApiKey} onChange={handleInputChange} className="input-field" />
                      </InputGroup>
                      <InputGroup label="OpenAI API Key">
                          <input type="password" name="openAIApiKey" value={localConfig.openAIApiKey} onChange={handleInputChange} className="input-field" />
                      </InputGroup>
                  </div>
              </section>

              {/* Custom Providers Section */}
              <section className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-300">Provedores de Imagem Customizados</h3>
                  <div className="mt-2 text-sm text-gray-400">
                      <p>Adicione provedores de imagem compatíveis com a API da OpenAI (como Cloudflare, Pexels via proxy, etc).</p>
                      <button onClick={() => setIsAddProviderModalOpen(true)} className="mt-3 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                          Gerenciar Provedores
                      </button>
                  </div>
              </section>
              
              {/* n8n Automation Section */}
              <section className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-300">Automação (n8n)</h3>
                  <div className="space-y-4 mt-2">
                       <InputGroup label="URL do Webhook do n8n (para Geração em Lote)">
                          <input type="url" name="webhookUrl" value={localConfig.webhookUrl || ''} onChange={handleInputChange} className="input-field" placeholder="https://seu-n8n.com/webhook/..." />
                      </InputGroup>
                       <InputGroup label="Chave de API do n8n (para o cabeçalho X-API-KEY)">
                          <input type="password" name="n8nApiKey" value={localConfig.n8nApiKey || ''} onChange={handleInputChange} className="input-field" />
                      </InputGroup>
                      <div className="flex items-center">
                          <input type="checkbox" id="isAutonomous" name="isAutonomous" checked={localConfig.isAutonomous || false} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500" />
                          <label htmlFor="isAutonomous" className="ml-2 block text-sm text-gray-300">Acionar webhook n8n automaticamente após cada geração</label>
                      </div>
                  </div>
              </section>

              {/* Google Drive Section */}
              <section className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-300">Integração com Google Drive</h3>
                  <div className="space-y-2 mt-2">
                       <InputGroup label="URL do App da Web do Google Apps Script">
                          <input type="url" name="googleDriveScriptUrl" value={localConfig.googleDriveScriptUrl || ''} onChange={handleInputChange} className="input-field" placeholder="https://script.google.com/macros/s/.../exec" />
                      </InputGroup>
                      <button onClick={() => setShowDriveTutorial(!showDriveTutorial)} className="text-sm text-indigo-400 hover:underline mt-2">
                        {showDriveTutorial ? 'Esconder Tutorial' : 'Mostrar Tutorial de Configuração'}
                      </button>
                      {showDriveTutorial && <GoogleDriveTutorial />}
                  </div>
              </section>

               {/* Connection Test Section */}
              <section className="pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-indigo-300">Testar Conexão</h3>
                  <div className="mt-2">
                      <p className="text-sm text-gray-400 mb-3">Isso testará o provedor de imagem selecionado no painel principal ({apiConfig.provider}) com a chave de API inserida acima.</p>
                      <button onClick={handleTestConnection} disabled={isTesting} className="bg-teal-600 hover:bg-teal-500 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg">
                          {isTesting ? 'Testando...' : 'Testar Conexão da API de Imagem'}
                      </button>
                      {connectionTestResult && (
                          <p className={`mt-3 text-sm ${connectionTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
                              {connectionTestResult.message}
                          </p>
                      )}
                  </div>
              </section>

          </div>

          <div className="flex-shrink-0 pt-6 mt-6 border-t border-gray-700 flex justify-between items-center">
            <button onClick={onDisconnect} className="text-sm text-red-500 hover:text-red-400">
                Desconectar do Supabase
            </button>
            <div className="space-x-4">
              <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg">
                Cancelar
              </button>
              <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg">
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AddProviderModal 
        isOpen={isAddProviderModalOpen}
        onClose={() => setIsAddProviderModalOpen(false)}
        onSave={handleSaveProviders}
        existingProviders={localConfig.customProviders}
      />
      
      <style>{`.input-field { width: 100%; background-color: #374151; border: 1px solid #4B5563; color: #F3F4F6; padding: 0.75rem; border-radius: 0.5rem; } .input-field:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4); } .code-block { white-space: pre-wrap; background-color: #1f2937; padding: 0.5rem 0.75rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; color: #d1d5db; word-break: break-all; }`}</style>
    </>
  );
};

const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
    {children}
  </div>
);

export default SettingsModal;