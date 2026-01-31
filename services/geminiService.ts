
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SalesScriptRequest, GeneratedScript, MarketingPack, ObjectionResponse, VideoScript } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function handleApiError(error: any) {
  const message = error.message || "";
  if (message.includes("PERMISSION_DENIED") || message.includes("403")) {
    if (window.aistudio) window.aistudio.openSelectKey();
    return "Error de permisos: Revisa tu facturación en AI Studio.";
  }
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    return "Servidores saturados. Reintentando con prioridad...";
  }
  return "Error de red. Por favor, reintenta.";
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 4): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message?.includes('429')) {
        const wait = Math.pow(2, i) * 2000 + Math.random() * 1000;
        await delay(wait);
        continue;
      }
      throw new Error(handleApiError(error));
    }
  }
  throw new Error("La API no responde tras varios reintentos.");
}

function cleanJsonResponse(text: string): string {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    return text.substring(start, end + 1);
  }
  return text;
}

export async function generateSalesScript(request: SalesScriptRequest): Promise<GeneratedScript> {
  return withRetry(async () => {
    const ai = getAI();
    const response = (await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un Senior Copywriter de élite y experto en la RAE. Crea una estrategia de venta magnética para "${request.productName}". 
        
        REGLAS DE ORO:
        1. ORTOGRAFÍA PERFECTA: Usa correctamente las tildes, comas y signos de apertura (¿, ¡). 
        2. LEGIBILIDAD: Usa saltos de línea frecuentes para que el texto no sea un bloque denso.
        3. ESTRUCTURA: Usa el método AIDA.
        4. TONO: ${request.tone} pero elegante. 
        5. IDIOMA: Español neutro profesional.
        
        Audiencia: ${request.targetAudience}. 
        Beneficios clave: ${request.keyBenefits.join(", ")}. 

        Devuelve un JSON con:
        - headline: Titular rompedor.
        - body: Texto persuasivo con viñetas y espacios.
        - cta: Llamado a la acción irresistible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING }
          },
          required: ["headline", "body", "cta"]
        }
      }
    })) as GenerateContentResponse;

    return JSON.parse(cleanJsonResponse(response.text || "{}")) as GeneratedScript;
  });
}

export async function generateMarketingPack(userInput: string, style: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack> {
  const ai = getAI();
  const textResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Eres un experto en Social Media Ads. Crea un post corto y potente para "${userInput}" con estética "${style}". 
      
      IMPORTANTE:
      - Ortografía impecable.
      - Usa emojis estratégicos pero no excesivos.
      - Incluye saltos de línea para lectura rápida.
      - Idioma: Español excelente.`
  }))) as GenerateContentResponse;

  const imageParts: any[] = [{ text: `High-end commercial photography, ${style} aesthetic, professional lighting, cinematic, ultra-detailed. Subject: ${userInput}.` }];
  if (referenceImage) {
    imageParts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
  }

  const imageResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: imageParts },
    config: { imageConfig: { aspectRatio: "1:1" } }
  }))) as GenerateContentResponse;

  const postText = textResponse.text || `Descubre la excelencia con ${userInput}.`;
  const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  const imageUrl = part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";

  return { imageUrl, postText };
}

export async function generateFivePacks(userInput: string, onProgress?: (index: number) => void, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const styles = ["Luxury Minimalist", "Warm Lifestyle", "Tech Modern", "Bold Impact", "Classic Premium"];
  const results: MarketingPack[] = [];
  for (let i = 0; i < styles.length; i++) {
    try {
      const pack = await generateMarketingPack(userInput, styles[i], referenceImage);
      results.push(pack);
      if (onProgress) onProgress(i + 1);
      await delay(2000); 
    } catch (err) {
      console.error(`Error en variante ${i}:`, err);
    }
  }
  return results;
}

export async function handleObjection(objection: string, product: string): Promise<ObjectionResponse> {
  return withRetry(async () => {
    const ai = getAI();
    const response = (await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Vendedor experto y psicólogo: Refuta la objeción "${objection}" para "${product}". 
        Usa español perfecto y persuasión ética. JSON con: rebuttal, psychology (explicación breve), closingTip.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebuttal: { type: Type.STRING },
            psychology: { type: Type.STRING },
            closingTip: { type: Type.STRING }
          },
          required: ["rebuttal", "psychology", "closingTip"]
        }
      }
    })) as GenerateContentResponse;
    return JSON.parse(cleanJsonResponse(response.text || "{}")) as ObjectionResponse;
  });
}

export async function generateVideoScript(product: string, goal: string): Promise<VideoScript> {
  return withRetry(async () => {
    const ai = getAI();
    const response = (await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Script de video publicitario para ${product}. Objetivo: ${goal}. 
        Ortografía impecable y tiempos precisos. JSON con: hook, scenes (visual, audio, duration), cta.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  visual: { type: Type.STRING },
                  audio: { type: Type.STRING },
                  duration: { type: Type.STRING }
                }
              }
            },
            cta: { type: Type.STRING }
          },
          required: ["hook", "scenes", "cta"]
        }
      }
    })) as GenerateContentResponse;
    return JSON.parse(cleanJsonResponse(response.text || "{}")) as VideoScript;
  });
}

export async function generateMarketingVideo(productName: string): Promise<string> {
  return withRetry(async () => {
    const ai = getAI();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `High-end cinematic commercial for ${productName}, 4k, professional color grading.`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await delay(10000);
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  });
}
