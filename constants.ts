import { TextStylePreset, ImageModel } from "./types";

export const YOUTUBE_THUMBNAIL_WIDTH = 1280;
export const YOUTUBE_THUMBNAIL_HEIGHT = 720;

export const FONTS = [
  { name: "Anton", value: "Anton" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Oswald", value: "Oswald" },
  { name: "Roboto", value: "Roboto" },
];

export const GOOGLE_IMAGE_MODELS: ImageModel[] = [
  {
    id: 'imagen-4.0-generate-001',
    name: 'Imagen 4.0 (Qualidade Máxima)',
    cost: '~$0.025 / img',
    description: 'Modelo principal do Google para criar imagens a partir de texto. Ideal para resultados finais de alta qualidade.'
  },
  {
    id: 'imagen-4.0-fast-generate-001',
    name: 'Imagen 4.0 (Rápido)',
    cost: '~$0.015 / img',
    description: 'Versão otimizada para velocidade. Ótimo para testes e quando a velocidade é mais importante que a qualidade máxima.'
  },
  {
    id: 'gemini-2.5-flash-image-preview',
    name: 'Gemini 2.5 Flash (Edição/Preview)',
    cost: 'Gratuito (Preview)',
    description: 'Também conhecido como "Nano Banana". ATENÇÃO: Este modelo é primariamente para EDIÇÃO de imagens. Usá-lo para geração a partir de texto pode causar erros (404 Not Found).'
  }
];

export const OPENAI_IMAGE_MODELS: ImageModel[] = [
  { 
    id: 'gpt-image-1', 
    name: 'GPT-Image 1 (Mais Novo)',
    cost: '~$0.08 / img',
    description: 'Modelo mais recente e avançado, com recursos multimodais para maior precisão e realismo.'
  },
  { 
    id: 'dall-e-3', 
    name: 'DALL-E 3',
    cost: '~$0.04 / img',
    description: 'Alta qualidade, ótima interpretação de prompts complexos.'
  },
  { 
    id: 'dall-e-2', 
    name: 'DALL-E 2',
    cost: '~$0.02 / img (Nível Gratuito Disponível)',
    description: 'Modelo mais antigo, versátil para edições e variações. Gera apenas imagens quadradas.'
  },
];

export const TEXT_STYLE_PRESETS: TextStylePreset[] = [
  {
    id: 'impacto',
    name: 'Impacto',
    titleFont: 'Anton',
    subtitleFont: 'Roboto',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFF00',
  },
  {
    id: 'moderno',
    name: 'Moderno',
    titleFont: 'Montserrat',
    subtitleFont: 'Roboto',
    titleColor: '#FFFFFF',
    subtitleColor: '#00D1FF',
  },
  {
    id: 'elegante',
    name: 'Elegante',
    titleFont: 'Oswald',
    subtitleFont: 'Roboto',
    titleColor: '#EAEAEA',
    subtitleColor: '#FFBF00',
  },
  {
    id: 'ousado',
    name: 'Ousado',
    titleFont: 'Bebas Neue',
    subtitleFont: 'Montserrat',
    titleColor: '#000000',
    subtitleColor: '#FFFFFF',
  },
  {
    id: 'minimalista',
    name: 'Minimalista',
    titleFont: 'Roboto',
    subtitleFont: 'Roboto',
    titleColor: '#FFFFFF',
    subtitleColor: '#A0A0A0',
  }
];