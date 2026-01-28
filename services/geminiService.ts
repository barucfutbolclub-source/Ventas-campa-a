
import { GoogleGenAI, Type } from "@google/genai";
import { SalesScriptRequest, GeneratedScript, MarketingPack, ObjectionResponse, VideoScript, Language } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Automatically corrects and optimizes user input for spelling, grammar, 
 * and professional tone in Latin American Spanish.
 */
async function sanitizeAndCorrect(text: string, lang: Language = 'es-LA'): Promise<string> {
  if (!text || text.length < 3) return text;
  const ai = getAI();
  const prompt = `Actúa como un corrector de estilo experto en español latinoamericano. 
  Corrige los errores ortográficos, gramaticales y de puntuación del siguiente texto, 
  manteniendo el significado original pero haciéndolo sonar más profesional y fluido. 
  Devuelve ÚNICAMENTE el texto corregido.
  
  Texto: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.1 }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.warn("Error en auto-corrección, usando texto original:", error);
    return text;
  }
}

export async function generateSalesScript(request: SalesScriptRequest): Promise<GeneratedScript> {
  const ai = getAI();
  // Auto-correct inputs first
  const cleanName = await sanitizeAndCorrect(request.productName);
  const cleanAudience = await sanitizeAndCorrect(request.targetAudience);
  
  const prompt = `Actúa como un experto mundial en copywriting y psicología de ventas.
    Genera una estructura de ventas altamente persuasiva para el siguiente producto:
    Producto: ${cleanName}
    Audiencia: ${cleanAudience}
    Beneficios: ${request.keyBenefits.join(", ")}
    Tono: ${request.tone}

    El resultado debe estar en español latinoamericano moderno y ser extremadamente convincente.`;

  try {
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
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export async function generateMarketingVideo(productName: string): Promise<string> {
  const ai = getAI();
  const cleanName = await sanitizeAndCorrect(productName);
  const prompt = `A professional cinematic video showcasing a sleek AI dashboard generating sales copy for "${cleanName}". 
  The screen shows words like 'Conversión Alta' and 'Ventas Optimizadas' appearing in Spanish. 
  Modern office background, soft bokeh, high-end motion graphics, 1080p aesthetic, 4k quality look.`;

  try {
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
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No se pudo obtener el enlace del video");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export async function handleObjection(objection: string, product: string): Promise<ObjectionResponse> {
  const ai = getAI();
  const cleanObjection = await sanitizeAndCorrect(objection);
  const cleanProduct = await sanitizeAndCorrect(product);
  
  const prompt = `Como experto en negociación, destruye esta objeción de venta para el producto "${cleanProduct}": "${cleanObjection}".
  Usa técnicas de reencuadre y empatía. Explica la psicología aplicada. Idioma: Español Latinoamericano.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rebuttal: { type: Type.STRING, description: "La respuesta directa para el cliente." },
            psychology: { type: Type.STRING, description: "Explicación del gatillo mental usado." },
            closingTip: { type: Type.STRING, description: "Consejo rápido de cierre." }
          },
          required: ["rebuttal", "psychology", "closingTip"]
        }
      }
    });
    return JSON.parse(response.text || "{}") as ObjectionResponse;
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export async function generateVideoScript(product: string, goal: string): Promise<VideoScript> {
  const ai = getAI();
  const cleanProduct = await sanitizeAndCorrect(product);
  const cleanGoal = await sanitizeAndCorrect(goal);
  
  const prompt = `Crea un guion para un video corto (Reels/TikTok) de 30 segundos. 
  Producto: ${cleanProduct}. Objetivo: ${cleanGoal}. 
  Debe incluir un gancho (hook) demoledor. Idioma: Español Latinoamericano.`;

  try {
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
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export async function generateMarketingPack(prompt: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack> {
  const ai = getAI();
  const cleanPrompt = await sanitizeAndCorrect(prompt);
  
  const textPrompt = `Genera una publicación de redes sociales altamente persuasiva en español latino: "${cleanPrompt}".`;

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: textPrompt
    });

    const postText = textResponse.text || "";
    const imageParts: any[] = [{ text: `Marketing visual for: ${cleanPrompt}. High-end professional advertising photography.` }];
    if (referenceImage) imageParts.push({ inlineData: referenceImage });

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: imageParts },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    return {
      imageUrl: part?.inlineData ? `data:image/png;base64,${part.inlineData.data}` : "",
      postText
    };
  } catch (error: any) {
    handleApiError(error);
    throw error;
  }
}

export async function generateFivePacks(prompt: string, referenceImage?: { data: string, mimeType: string }): Promise<MarketingPack[]> {
  const variations = ["minimalista", "con mucha energía", "corporativo", "innovador", "emocional"];
  const results = await Promise.all(variations.map(v => generateMarketingPack(`${prompt} - Estilo ${v}`, referenceImage).catch(() => null)));
  return results.filter((r): r is MarketingPack => r !== null);
}

function handleApiError(error: any) {
  if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
    window.aistudio.openSelectKey();
  }
  console.error("API Error:", error);
}
