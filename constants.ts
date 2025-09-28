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
    id: 'imagen-3.0-generate-001',
    name: 'Imagen 3.0 (Equilibrado)',
    cost: '~$0.020 / img',
    description: 'Modelo anterior, excelente equilíbrio entre qualidade, velocidade e custo. Ótima opção para uso geral.'
  },
  // REMOVED: 'gemini-2.5-flash-image-preview' is for editing, not generation, and causes errors.
  // Keeping it in the list confuses users and leads to failed API calls.
];

export const OPENAI_IMAGE_MODELS: ImageModel[] = [
  { 
    id: 'dall-e-3', 
    name: 'DALL-E 3',
    cost: '~$0.04 / img',
    description: 'Alta qualidade, ótima interpretação de prompts complexos e suporte a diversos tamanhos de imagem.'
  },
  { 
    id: 'dall-e-2', 
    name: 'DALL-E 2',
    cost: '~$0.02 / img (Nível Gratuito Disponível)',
    description: 'Modelo mais antigo, versátil para edições e variações. ATENÇÃO: Gera apenas imagens quadradas.'
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