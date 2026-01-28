
import { GoogleGenAI, Type } from "@google/genai";
import { SalesScriptRequest, GeneratedScript } from "../types";

export async function generateSalesScript(request: SalesScriptRequest): Promise<GeneratedScript> {
  // Guidelines: Create a new instance right before the call to use the latest API key
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

    // Use .text property directly as per guidelines
    return JSON.parse(response.text || "{}") as GeneratedScript;
  } catch (error: any) {
    // If request fails with key issue, prompt for key selection as per guidelines
    if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    console.error("Error generating sales script:", error);
    throw new Error("No se pudo generar el guion. Verifica tu conexión e intenta de nuevo.");
  }
}

export async function generateSingleImage(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Imagen publicitaria profesional: ${prompt}. Estilo: Marketing digital moderno, 4k, iluminación cinematográfica, minimalista, exitoso. Sin texto.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
        // DO NOT set responseMimeType or responseSchema for nano banana series models
      },
    });

    // Guidelines: Iterate through all parts to find the image part, do not assume it is the first part.
    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Fallo en la generación de imagen");
  } catch (error: any) {
    // Handle API key errors
    if (error.message?.includes("Requested entity was not found.") && window.aistudio) {
      await window.aistudio.openSelectKey();
    }
    throw error;
  }
}

export async function generateFiveImages(prompt: string): Promise<string[]> {
  const variations = [
    `${prompt} - Enfoque corporativo y serio`,
    `${prompt} - Enfoque dinámico y creativo`,
    `${prompt} - Enfoque minimalista y limpio`,
    `${prompt} - Enfoque tecnológico y futurista`,
    `${prompt} - Enfoque humano y emocional`
  ];

  // Ejecución paralela para mayor velocidad
  const results = await Promise.all(
    variations.map(v => generateSingleImage(v).catch(err => {
      console.warn("Error en una variante:", err);
      return null;
    }))
  );

  const filtered = results.filter((r): r is string => r !== null);
  if (filtered.length === 0) throw new Error("No se pudo generar ninguna imagen. Reintenta.");
  return filtered;
}
