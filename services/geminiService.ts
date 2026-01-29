
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
        console.warn(`Reintentando en ${Math.round(wait)}ms...`);
        await delay(wait);
        continue;
      }
      throw new Error(handleApiError(error));
    }
  }
  throw new Error("La API de Google no responde tras varios reintentos. Espera un minuto.");
}

/**
 * Limpia el texto para asegurar que solo quede el JSON
 */
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
      contents: `Senior Copywriter Pro: Crea una estrategia de venta de alto impacto para "${request.productName}". 
        Audiencia: ${request.targetAudience}. 
        Beneficios: ${request.keyBenefits.join(", ")}. 
        Tono: ${request.tone}. 
        En ESPAÑOL. Devuelve EXCLUSIVAMENTE un objeto JSON con las claves: headline, body, cta.`,
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

    const rawText = response.text || "{}";
    try {
      return JSON.parse(cleanJsonResponse(rawText)) as GeneratedScript;
    } catch (e) {
      console.error("Error parseando JSON:", rawText);
      throw new Error("La IA devolvió un formato incorrecto. Reintentando...");
    }
  });
}

export async function generateMarketingPack(userInput: string, style: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack> {
  const ai = getAI();
  const textResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Marketing Specialist: Crea un post persuasivo corto para "${userInput}" con estilo "${style}". En español.`
  }))) as GenerateContentResponse;

  const imageParts: any[] = [{ text: `High-end commercial photography, ${style} aesthetic. Subject: ${userInput}. 4k.` }];
  if (referenceImage) {
    imageParts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
  }

  const imageResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: imageParts },
    config: { imageConfig: { aspectRatio: "1:1" } }
  }))) as GenerateContentResponse;

  const postText = textResponse.text || `Potencia tu negocio con ${userInput}.`;
  const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  const imageUrl = part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";

  return { imageUrl, postText };
}

export async function generateFivePacks(userInput: string, onProgress?: (index: number) => void, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const styles = ["Luxury Minimalist", "Cyberpunk Tech", "Warm Organic", "Bold Corporate", "Elegant Editorial"];
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
  if (results.length === 0) throw new Error("No se pudieron generar creativos. API saturada.");
  return results;
}

export async function handleObjection(objection: string, product: string): Promise<ObjectionResponse> {
  return withRetry(async () => {
    const ai = getAI();
    const response = (await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Vendedor experto: Objeción "${objection}" para "${product}". JSON con rebuttal, psychology, closingTip.`,
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
      contents: `Script video 30s para ${product}. Objetivo: ${goal}. JSON con hook, scenes (visual, audio, duration), cta.`,
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
      prompt: `Cinematic commercial for ${productName}. 1080p.`,
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
