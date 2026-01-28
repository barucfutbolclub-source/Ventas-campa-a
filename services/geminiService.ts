
import { GoogleGenAI, Type } from "@google/genai";
import { SalesScriptRequest, GeneratedScript, MarketingPack } from "../types";

export async function generateSalesScript(request: SalesScriptRequest): Promise<GeneratedScript> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Actúa como un experto mundial en copywriting y psicología de ventas.
    Genera una estructura de ventas altamente persuasiva para el siguiente producto:
    Producto: ${request.productName}
    Audiencia: ${request.targetAudience}
    Beneficios: ${request.keyBenefits.join(", ")}
    Tono: ${request.tone}

    El resultado debe estar en español y ser extremadamente convincente, utilizando gatillos mentales de escasez, autoridad y reciprocidad cuando sea apropiado.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "Un titular impactante que capte la atención inmediatamente." },
            body: { type: Type.STRING, description: "El cuerpo del mensaje de ventas estructurado profesionalmente." },
            cta: { type: Type.STRING, description: "Una llamada a la acción poderosa y clara." }
          },
          required: ["headline", "body", "cta"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as GeneratedScript;
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    console.error("Error generating sales script:", error);
    throw new Error("No se pudo generar el guion. Verifica tu conexión e intenta de nuevo.");
  }
}

export async function generateMarketingPack(prompt: string): Promise<MarketingPack> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Solicitamos el texto primero para tener contexto y luego la imagen
  const textPrompt = `Genera un post de redes sociales (Instagram/LinkedIn) altamente persuasivo basado en este concepto: "${prompt}". 
  Incluye un gancho inicial, el valor principal y un CTA claro. Añade 3-5 hashtags relevantes. Idioma: Español.`;

  try {
    const textResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: textPrompt
    });

    const postText = textResponse.text || "";

    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional marketing visual: ${prompt}. Style: High-end commercial photography, 4k, cinematic lighting, modern marketing aesthetic. No text on image.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    const part = imageResponse.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return {
        imageUrl: `data:image/png;base64,${part.inlineData.data}`,
        postText: postText
      };
    }
    throw new Error("Fallo en la generación de imagen del pack");
  } catch (error: any) {
    if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}

export async function generateFivePacks(prompt: string): Promise<MarketingPack[]> {
  const variations = [
    `${prompt} - Estilo minimalista y elegante`,
    `${prompt} - Estilo energético y vibrante`,
    `${prompt} - Estilo profesional y corporativo`,
    `${prompt} - Estilo creativo y disruptivo`,
    `${prompt} - Estilo emocional y cercano`
  ];

  const results = await Promise.all(
    variations.map(v => generateMarketingPack(v).catch(err => {
      console.warn("Error en un pack:", err);
      return null;
    }))
  );

  const filtered = results.filter((r): r is MarketingPack => r !== null);
  if (filtered.length === 0) throw new Error("No se pudo generar ningún pack. Reintenta.");
  return filtered;
}
