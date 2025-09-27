import React, { useState } from 'react';
import { CustomProviderConfig } from '../types';

interface AddProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (providers: CustomProviderConfig[]) => void;
  existingProviders: CustomProviderConfig[];
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ isOpen, onClose, onSave, existingProviders }) => {
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [endpointUrl, setEndpointUrl] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setApiKey('');
    setEndpointUrl('');
    setModel('');
    setError('');
  };

  const handleSave = () => {
    if (!name.trim() || !apiKey.trim() || !endpointUrl.trim() || !model.trim()) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const newProvider: CustomProviderConfig = {
      id: `custom_${new Date().getTime()}`, // Simple unique ID
      name,
      apiKey,
      endpointUrl,
      model,
    };
    
    onSave([...existingProviders, newProvider]);
    resetForm();
    onClose(); // Close modal after saving
  };
  
  const handleDelete = (id: string) => {
    const updatedProviders = existingProviders.filter(p => p.id !== id);
    onSave(updatedProviders);
  };
  
  const pexelsProxyScript = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var prompt = data.prompt;
    // IMPORTANTE: Adicione sua chave de API da Pexels aqui!
    var apiKey = "SUA_CHAVE_DE_API_DA_PEXELS_AQUI";
    
    var pexelsUrl = 'https://api.pexels.com/v1/search?query=' + encodeURIComponent(prompt) + '&per_page=1&orientation=landscape';
    
    var options = {
      'method': 'get',
      'headers': { 'Authorization': apiKey }
    };
    
    var response = UrlFetchApp.fetch(pexelsUrl, options);
    var pexelsData = JSON.parse(response.getContentText());
    
    if (pexelsData.photos && pexelsData.photos.length > 0) {
      // Pexels não retorna base64, então buscamos a imagem e a codificamos
      var imageUrl = pexelsData.photos[0].src.large2x;
      var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
      var base64Image = Utilities.base64Encode(imageBlob.getBytes());
      
      // Retorna no formato que nossa ferramenta espera (similar ao da OpenAI)
      var result = {
        "data": [{ "b64_json": base64Image }]
      };
      
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      throw new Error("Nenhuma foto encontrada na Pexels para o prompt: " + prompt);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 'error': { 'message': err.toString() } }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl p-8 text-white max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center flex-shrink-0">
            <h2 className="text-2xl font-bold">Gerenciar Provedores Customizados</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-4 mt-6 space-y-8">
            <section>
                <h3 className="text-lg font-semibold text-indigo-300 mb-4">Adicionar Novo Provedor</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Nome do Provedor (Ex: Pexels)" value={name} onChange={e => setName(e.target.value)} className="input-field" />
                  <input type="password" placeholder="Chave de API do Provedor" value={apiKey} onChange={e => setApiKey(e.target.value)} className="input-field" />
                  <input type="url" placeholder="URL do seu Proxy/Endpoint" value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} className="input-field" />
                  <input type="text" placeholder="Nome/ID do Modelo (se aplicável, ou 'default')" value={model} onChange={e => setModel(e.target.value)} className="input-field" />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button onClick={handleSave} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg">
                    Salvar Novo Provedor
                  </button>
                </div>
            </section>

             <section className="pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-indigo-300 mb-2">Aviso: Resolvendo o Erro "Failed to fetch" (CORS)</h3>
                <div className="text-sm text-gray-300 space-y-3 p-4 bg-gray-900 rounded-lg">
                    <p>APIs como Pexels ou Cloudinary bloqueiam chamadas diretas do navegador por segurança (CORS). Para integrá-las, você precisa de um "proxy".</p>
                    <p><strong>Solução:</strong> Use o Google Apps Script (gratuito) para criar um proxy seguro. Siga os passos da seção "Salvar no Google Drive" para implantar um novo script.</p>
                    <div>
                        <p className="font-semibold text-gray-100">Exemplo de Proxy para Pexels (Copie e Cole no Apps Script):</p>
                        <pre className="code-block mt-2 text-xs max-h-40 overflow-auto">{pexelsProxyScript}</pre>
                    </div>
                     <p>Após implantar o script, cole a <strong>URL do App da Web</strong> no campo "URL do seu Proxy/Endpoint" acima.</p>
                </div>
            </section>
            
            {existingProviders.length > 0 && (
              <section className="pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-indigo-300 mb-4">Provedores Salvos</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {existingProviders.map(provider => (
                    <div key={provider.id} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-bold">{provider.name}</p>
                        <p className="text-sm text-gray-400 truncate max-w-md">{provider.model} via {provider.endpointUrl}</p>
                      </div>
                      <button onClick={() => handleDelete(provider.id)} className="bg-red-600 hover:bg-red-500 text-white font-semibold py-1 px-3 rounded-md flex-shrink-0">
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      </div>
       <style>{`.input-field { width: 100%; background-color: #374151; border: 1px solid #4B5563; color: #F3F4F6; padding: 0.75rem; border-radius: 0.5rem; } .input-field:focus { outline: none; border-color: #6366F1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.4); } .code-block { white-space: pre-wrap; background-color: #1f2937; padding: 0.5rem 0.75rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem; color: #d1d5db; word-break: break-all; }`}</style>
    </div>
  );
};

export default AddProviderModal;