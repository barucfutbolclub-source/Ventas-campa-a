
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
    return "Servidores saturados. Reintentando con prioridad estratégica...";
  }
  return "Error de conexión. Por favor, reintenta en unos segundos.";
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
  throw new Error("La capacidad de procesamiento ha sido superada. Por favor, espera un momento.");
}

/**
 * Asegura que el JSON sea válido extrayendo solo el bloque de llaves.
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
      contents: `Actúa como un Senior Copywriter experto en Ventas de Nivel Ejecutivo y especialista en Español Latinoamericano. 
        Crea una estrategia de venta de alto impacto para el producto: "${request.productName}". 
        
        REQUISITOS LINGÜÍSTICOS ESTRICTOS:
        1. ORTOGRAFÍA: Uso impecable de tildes, comas y, obligatoriamente, signos de apertura (¿ y ¡).
        2. IDIOMA: Español latinoamericano neutro (evita modismos regionales y el "vosotros").
        3. ESTRUCTURA: Texto organizado con saltos de línea claros. Usa el método AIDA (Atención, Interés, Deseo, Acción).
        4. TONO: ${request.tone} pero siempre sofisticado y persuasivo.
        
        DATOS:
        Audiencia: ${request.targetAudience}. 
        Beneficios: ${request.keyBenefits.join(", ")}. 

        Devuelve UNICAMENTE un objeto JSON con:
        - headline: Un titular magnético.
        - body: El cuerpo del copy con viñetas y estructura clara.
        - cta: Un llamado a la acción directo e irresistible.`,
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

    const raw = response.text || "{}";
    return JSON.parse(cleanJsonResponse(raw)) as GeneratedScript;
  });
}

export async function generateMarketingPack(userInput: string, style: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack> {
  const ai = getAI();
  const textResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Eres un estratega de Social Media Marketing. Redacta un post publicitario extraordinario para "${userInput}" con un estilo "${style}". 
      
      REGLAS:
      - Ortografía perfecta (incluye ¿ y ¡).
      - Español latinoamericano profesional.
      - Usa saltos de línea para que sea fácil de escanear.
      - Emojis sutiles y elegantes.
      - No superes los 300 caracteres.`
  }))) as GenerateContentResponse;

  const imageParts: any[] = [{ text: `Professional commercial photography for advertising, ${style} style, cinematic lighting, 8k resolution, photorealistic. Subject: ${userInput}.` }];
  if (referenceImage) {
    imageParts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
  }

  const imageResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: imageParts },
    config: { imageConfig: { aspectRatio: "1:1" } }
  }))) as GenerateContentResponse;

  const postText = textResponse.text || `Eleva tus estándares con ${userInput}.`;
  const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  const imageUrl = part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";

  return { imageUrl, postText };
}

export async function generateFivePacks(userInput: string, onProgress?: (index: number) => void, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const styles = ["Lujo Minimalista", "Estilo de Vida Cálido", "Tecnología Moderna", "Impacto Audaz", "Clásico Premium"];
  const results: MarketingPack[] = [];
  for (let i = 0; i < styles.length; i++) {
    try {
      const pack = await generateMarketingPack(userInput, styles[i], referenceImage);
      results.push(pack);
      if (onProgress) onProgress(i + 1);
      await delay(2500); // Pausa para estabilidad de la API
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
      contents: `Eres un psicólogo de ventas y cerrador experto. Resuelve la objeción: "${objection}" para el producto: "${product}". 
        Usa un español latinoamericano impecable. Devuelve un JSON con:
        - rebuttal: La respuesta exacta para el cliente (persuasiva y elegante).
        - psychology: Explicación de por qué funciona esta respuesta.
        - closingTip: Un consejo para cerrar la venta inmediatamente tras la respuesta.`,
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
      contents: `Diseña un guion de video comercial (30 seg) para "${product}" con el objetivo: "${goal}". 
        Español latinoamericano neutro, ortografía perfecta. 
        JSON con: hook (gancho inicial), scenes (visual, audio, duration), cta (cierre).`,
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
      prompt: `Cinematic premium advertisement for ${productName}, 4k resolution, smooth transitions, high-end production quality.`,
      config: { numberOfVideos: 1, resolution: '1080p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await delay(12000);
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  });
}
