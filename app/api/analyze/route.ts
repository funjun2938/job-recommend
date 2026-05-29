import { GoogleGenAI } from '@google/genai'
import { buildAnalysisPrompt } from '@/lib/prompts'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

export async function POST(request: Request) {
  const { stage1, stage2 } = await request.json()
  const prompt = buildAnalysisPrompt(stage1, stage2)

  const response = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { maxOutputTokens: 3000 },
  })

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        if (chunk.text) {
          controller.enqueue(new TextEncoder().encode(chunk.text))
        }
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
