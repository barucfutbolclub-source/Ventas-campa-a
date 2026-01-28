
export type Language = 'es-LA' | 'en-US';

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  price?: string;
}

export interface SalesScriptRequest {
  productName: string;
  targetAudience: string;
  keyBenefits: string[];
  tone: 'professional' | 'aggressive' | 'empathetic' | 'humorous';
  language?: Language;
}

export interface GeneratedScript {
  headline: string;
  body: string;
  cta: string;
}

export interface MarketingPack {
  imageUrl: string;
  postText: string;
}

export interface ObjectionResponse {
  rebuttal: string;
  psychology: string;
  closingTip: string;
}

export interface VideoScriptScene {
  visual: string;
  audio: string;
  duration: string;
}

export interface VideoScript {
  hook: string;
  scenes: VideoScriptScene[];
  cta: string;
}

export interface MetricData {
  name: string;
  conversion: number;
  revenue: number;
}

export interface GeneratedImage {
  url: string;
  id: string;
}
