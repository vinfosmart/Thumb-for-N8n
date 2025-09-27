export type ApiProvider = 'google' | 'openai';

export interface CustomProviderConfig {
  id: string; 
  name: string;
  apiKey: string;
  endpointUrl: string;
  model: string;
}

export interface ApiConfig {
  provider: string; // 'google', 'openai', or a custom provider ID
  openAIApiKey: string;
  googleApiKey: string;
  googleModel: string;
  openAIModel: string;
  customProviders: CustomProviderConfig[];
  // Campos de Configuração Adicionais
  isAutonomous?: boolean;
  googleDriveScriptUrl?: string;
  selectedStyleId?: string | null;
  webhookUrl?: string;
  n8nApiKey?: string;
}

export interface ImageModel {
  id: string;
  name: string;
  cost: string; // Ex: '$0.02 / imagem'
  description: string;
}

export interface ThumbnailState {
  templateId: string;
  title: string;
  subtitle: string;
  titleFont: string;
  subtitleFont: string;
  titleColor: string;
  subtitleColor: string;
  backgroundColor1: string;
  backgroundColor2: string;
  logoUrl?: string;
  showLogo: boolean;
  backgroundImageUrl?: string;
}

export interface Template {
  id: string;
  name: string;
  defaultState: ThumbnailState;
}

export interface AICreatedConcept {
    subtitle:string;
    titleColor: string;
    subtitleColor: string;
}

export interface AIFullConcept {
    subtitle:string;
    titleColor: string;
    subtitleColor: string;
    imagePrompt: string;
}

export interface HistoryItem {
  id: string; // UUID from database
  user_id?: string;
  title: string;
  imageUrl: string;
  created_at: string; // Renamed for consistency
}

export interface TextStylePreset {
  id: string;
  name: string;
  titleFont: string;
  subtitleFont: string;
  titleColor: string;
  subtitleColor: string;
}