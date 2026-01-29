
import { GoogleGenAI, Type } from "@google/genai";
import { SalesScriptRequest, GeneratedScript, MarketingPack, ObjectionResponse, VideoScript } from "../types";

// Generamos una nueva instancia en cada llamada para asegurar el uso de la API KEY más reciente
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Manejador centralizado de errores de la API.
 */
function handleApiError(error: any) {
  const message = error.message || "";
  const status = error.status || 0;
  
  console.error("Detalle del Error de API:", { message, status, full: error });

  // Error 403 o PERMISSION_DENIED: Problemas de permisos del proyecto o facturación
  if (message.includes("PERMISSION_DENIED") || message.includes("403") || message.includes("caller does not have permission")) {
    if (window.aistudio) {
      alert("Error de Permisos (403): Tu proyecto actual no tiene permisos para este modelo. Asegúrate de usar un proyecto con facturación habilitada para modelos avanzados.");
      window.aistudio.openSelectKey();
    }
    return "Error de permisos: El proyecto no está autorizado para usar este modelo.";
  }

  // Error 404 o Requested entity was not found: Re-seleccionar llave
  if (message.includes("Requested entity was not found.") || message.includes("404")) {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
    }
    return "Modelo no encontrado o llave inválida.";
  }
  
  if (message.includes("RESOURCE_EXHAUSTED") || message.includes("429")) {
    return "Cuota de API agotada (429). Por favor, espera unos minutos o usa un proyecto con mayor límite.";
  }

  return message || "Ocurrió un error inesperado en la comunicación con la IA.";
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const status = error.status || (error.message?.includes('429') ? 429 : 0);
      
      // Si es cuota agotada o error de servidor, reintentamos
      if (status === 429 || status >= 500) {
        const waitTime = Math.pow(2, i) * 2000;
        await delay(waitTime);
        continue;
      }
      
      // Si es un error de permisos (403), no reintentamos y disparamos el selector
      const handledMessage = handleApiError(error);
      throw new Error(handledMessage);
    }
  }
  throw new Error(handleApiError(lastError));
}

async function internalSanitize(text: string): Promise<string> {
  if (!text || text.length < 5) return text;
  
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Actúa como un corrector de estilo experto. Corrige la ortografía y gramática del siguiente texto en español, asegurándote de que suene profesional pero persuasivo. Devuelve exclusivamente el texto corregido: "${text}"`,
      config: { temperature: 0.1 }
    });
    return response.text?.trim() || text;
  } catch {
    return text;
  }
}

export async function generateSalesScript(request: SalesScriptRequest): Promise<GeneratedScript> {
  const cleanName = await internalSanitize(request.productName);
  
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `Actúa como un especialista en copywriting de respuesta directa y psicología del consumidor.
      Genera un guion de ventas de alto impacto para:
      Producto: ${cleanName}
      Audiencia: ${request.targetAudience}
      Beneficios Clave: ${request.keyBenefits.join(", ")}
      Tono: ${request.tone}

      Utiliza una estructura de ventas probada (como AIDA o PAS). El resultado debe ser en español y estar diseñado para MAXIMIZAR CONVERSIONES.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    });

    return JSON.parse(response.text || "{}") as GeneratedScript;
  });
}

export async function generateMarketingVideo(productName: string): Promise<string> {
  const cleanName = await internalSanitize(productName);
  
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `A cinematic, high-end professional commercial video for "${cleanName}". 
    The video shows a modern, sleek workspace with high-tech elements. 
    Text overlays like 'Ventas Optimizadas' and 'Crecimiento Exponencial' appear in a smooth, professional font. 
    1080p resolution, shallow depth of field, elegant motion graphics.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '1080p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await delay(10000);
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No se pudo obtener el enlace del video");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  });
}

export async function handleObjection(objection: string, product: string): Promise<ObjectionResponse> {
  const cleanObjection = await internalSanitize(objection);
  
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `Eres un cerrador de ventas experto. Un cliente presenta la siguiente objeción para "${product}": "${cleanObjection}".
    Proporciona una respuesta demoledora basada en técnicas de reencuadre psicológico.
    Incluye el gatillo mental utilizado y un consejo para cerrar la venta inmediatamente.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    });
    return JSON.parse(response.text || "{}") as ObjectionResponse;
  });
}

export async function generateVideoScript(product: string, goal: string): Promise<VideoScript> {
  const cleanProduct = await internalSanitize(product);
  
  return withRetry(async () => {
    const ai = getAI();
    const prompt = `Crea un guion viral para un video corto (TikTok/Reels) diseñado para vender:
    Producto: ${cleanProduct}
    Objetivo: ${goal}
    
    Incluye un hook de 3 segundos, escenas con descripción visual y el audio sugerido. Tono comercial y enérgico en español.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    });
    return JSON.parse(response.text || "{}") as VideoScript;
  });
}

export async function generateMarketingPack(userInput: string, style: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack> {
  return withRetry(async () => {
    const ai = getAI();
    
    const textPrompt = `Actúa como un experto en Growth Marketing. Crea un post de Instagram/Facebook para vender este concepto: "${userInput}".
    Estilo de Marca: ${style}
    El post debe incluir un titular gancho, 3 puntos de valor, emojis persuasivos y un Call to Action claro. Idioma: Español.`;

    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: textPrompt
    });
    
    const postText = textResponse.text || `🔥 ¡Atención! Descubre cómo ${userInput} puede cambiar tu realidad. 🚀`;

    const imageParts: any[] = [{ 
      text: `Professional advertising studio photography, high-end commercial aesthetic, ${style} lighting and mood. Subject: ${userInput}. 
      Optimized for high engagement on social media. Clean, premium, 8k resolution.` 
    }];
    if (referenceImage) {
      imageParts.push({ inlineData: referenceImage });
    }

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: imageParts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    const imageUrl = part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "";

    return { imageUrl, postText };
  });
}

export async function generateFivePacks(userInput: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const cleanInput = await internalSanitize(userInput);
  const styles = [
    "minimalista de lujo (Luxury Minimalist)",
    "vibrante y enérgico (Streetwear Style)",
    "corporativo de alta gama (Premium Executive)",
    "innovador y tecnológico (Futuristic Tech)",
    "estilo de vida cálido y auténtico (Lifestyle Organic)"
  ];

  const promises = styles.map(style => 
    generateMarketingPack(cleanInput, style, referenceImage).catch(err => {
      console.error(`Error in pack ${style}:`, err);
      return null;
    })
  );
  
  const results = await Promise.all(promises);
  return results.filter((r): r is MarketingPack => r !== null);
}
