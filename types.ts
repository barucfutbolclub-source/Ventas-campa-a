
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

export interface MetricData {
  name: string;
  conversion: number;
  revenue: number;
}

export interface GeneratedImage {
  url: string;
  id: string;
}
