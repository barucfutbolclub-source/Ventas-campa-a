
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { SalesScriptRequest, GeneratedScript, MarketingPack, ObjectionResponse, VideoScript } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function handleApiError(error: any) {
  const message = error.message || "";
  if (message.includes("PERMISSION_DENIED") || message.includes("403")) {
    if (window.aistudio) window.aistudio.openSelectKey();
    return "Error de permisos: Revisa tu configuración en Google AI Studio.";
  }
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    return "Servidores saturados. Reintentando con prioridad estratégica...";
  }
  return "Error de conexión. Por favor, reintente en unos segundos.";
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
      contents: `Eres un Maestro de la Lengua Española y Senior Copywriter de Élite. Tu misión es redactar una estrategia de ventas IMPECABLE para: "${request.productName}".

REGLAS DE ESCRITURA OBLIGATORIAS:
1. IDIOMA: Español Latinoamericano Neutro. PROHIBIDO el uso de "vosotros" o regionalismos excesivos.
2. ORTOGRAFÍA: Absolutamente perfecta. Uso obligatorio de signos de apertura (¿, ¡). Tildes correctas.
3. PROHIBICIÓN DE SPANGLISH: No uses palabras en inglés (ej: NO uses "reflect", usa "reflejan"; NO uses "excellence", usa "excelencia").
4. ESTRUCTURA: Usa párrafos cortos y saltos de línea claros. Aplica el método AIDA.
5. CALIDAD: No uses números en lugar de letras (ej: NO uses "Atenci6n").

DATOS DE ENTRADA:
- Audiencia: ${request.targetAudience}.
- Beneficios: ${request.keyBenefits.join(", ")}.
- Tono: ${request.tone} y sumamente persuasivo.

Devuelve EXCLUSIVAMENTE un JSON con:
- headline: Un titular que detenga el scroll.
- body: El cuerpo del mensaje estructurado para lectura fluida.
- cta: Un llamado a la acción directo.`,
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
    contents: `Eres un experto en Redacción Publicitaria y Estilo Editorial. Crea un post de redes sociales para "${userInput}" con estética "${style}".

REQUERIMIENTOS:
- Español Latinoamericano Neutro perfecto.
- Signos de apertura (¿, ¡) obligatorios.
- Estructura limpia con saltos de línea.
- Máxima elegancia y persuasión. No uses anglicismos.`
  }))) as GenerateContentResponse;

  const imageParts: any[] = [{ text: `High-end commercial photography, ${style} aesthetic, professional studio lighting, 8k resolution. Subject: ${userInput}. No text in image.` }];
  if (referenceImage) {
    imageParts.push({ inlineData: { data: referenceImage.data, mimeType: referenceImage.mimeType } });
  }

  const imageResponse = (await withRetry(() => ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: imageParts },
    config: { imageConfig: { aspectRatio: "1:1" } }
  }))) as GenerateContentResponse;

  const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  const imageUrl = part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";

  return { imageUrl, postText: textResponse.text || "Contenido premium en desarrollo." };
}

export async function generateFivePacks(userInput: string, onProgress?: (index: number) => void, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const styles = ["Lujo Contemporáneo", "Minimalismo Orgánico", "Vanguardia Tecnológica", "Estilo de Vida Urbano", "Elegancia Clásica"];
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
      contents: `Eres un experto en Psicología del Consumidor y Ventas de Alto Nivel. Resuelve la objeción: "${objection}" para el producto: "${product}".
        
        REGLAS:
        - Español perfecto.
        - Persuasión ética y elegante.
        - JSON con: rebuttal, psychology, closingTip.`,
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
      contents: `Guionista de comerciales profesional. Producto: "${product}". Objetivo: "${goal}".
        Redacta en español latinoamericano impecable. JSON con: hook, scenes (visual, audio, duration), cta.`,
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
      prompt: `Premium cinematic marketing video for ${productName}, 4k, smooth camera work, high-end professional lighting.`,
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
