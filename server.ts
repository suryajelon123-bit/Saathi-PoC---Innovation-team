import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT) || 3000;

// In-memory cache of generated Indian-accent WAV clips to keep replay instant
const ttsCache = new Map<string, string>();
const MAX_CACHE_ENTRIES = 60;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface AssistantHistoryItem {
  role: 'user' | 'model';
  text: string;
}

app.post('/api/assistant', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      message?: unknown;
      lang?: unknown;
      history?: unknown;
      context?: {
        activeScreen?: unknown;
        variant?: unknown;
        themeTitle?: unknown;
        themeIntro?: unknown;
        teacherName?: unknown;
        blockDistrict?: unknown;
      };
    };

    const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1200) : '';
    const lang = body?.lang === 'en' ? 'en' : 'hi';

    if (!message) {
      res.status(400).json({
        error: lang === 'hi' ? 'कृपया अपना प्रश्न लिखें।' : 'Please enter a message.',
      });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error:
          lang === 'hi'
            ? 'AI सहायक के लिए सर्वर पर GEMINI_API_KEY सेट नहीं है।'
            : 'GEMINI_API_KEY is not configured on the server.',
      });
      return;
    }

    const rawHistory = Array.isArray(body?.history) ? body.history.slice(-10) : [];
    const sanitizedHistory: AssistantHistoryItem[] = rawHistory
      .filter(
        (item): item is { role: unknown; text: unknown } =>
          typeof item === 'object' && item !== null
      )
      .map((item) => ({
        role: (item.role === 'model' ? 'model' : 'user') as 'user' | 'model',
        text: typeof item.text === 'string' ? item.text.trim().slice(0, 1000) : '',
      }))
      .filter((item) => item.text.length > 0);

    const ctx = body?.context ?? {};
    const themeTitle =
      typeof ctx.themeTitle === 'string' ? ctx.themeTitle.trim().slice(0, 160) : '';
    const themeIntro =
      typeof ctx.themeIntro === 'string' ? ctx.themeIntro.trim().slice(0, 320) : '';
    const activeScreen =
      typeof ctx.activeScreen === 'string' ? ctx.activeScreen.trim().slice(0, 40) : '';
    const teacherName =
      typeof ctx.teacherName === 'string' ? ctx.teacherName.trim().slice(0, 80) : '';
    const blockDistrict =
      typeof ctx.blockDistrict === 'string' ? ctx.blockDistrict.trim().slice(0, 80) : '';

    const contextSummary = [
      teacherName ? `Teacher name: ${teacherName}` : '',
      blockDistrict ? `Block/District: ${blockDistrict}` : '',
      activeScreen ? `Current screen: ${activeScreen}` : '',
      themeTitle ? `Current selected school/classroom topic: ${themeTitle}` : '',
      themeIntro ? `Topic background: ${themeIntro}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const systemInstruction =
      lang === 'hi'
        ? `आप "साथी AI सहायक" हैं — भारत के सरकारी प्राथमिक और उच्च-प्राथमिक विद्यालयों के शिक्षकों के लिए एक विनम्र, व्यावहारिक और सहयोगी मित्र।
आपका उद्देश्य शिक्षाग्रह, FLN, बालवाटिका, बहु-स्तरीय/बहु-कक्षा शिक्षण, स्थानीय बोली से हिंदी सेतु, अनियमित उपस्थिति और सामुदायिक चौपाल से जुड़े सरल समाधान सुझाना है।

नियम:
1. हमेशा सरल, आत्मीय और रोज़मर्रा की बोलचाल वाली हिंदी (देवनागरी) में उत्तर दें। कठिन तकनीकी शब्दों से बचें।
2. उत्तर छोटा, स्पष्ट और मोबाइल पर पढ़ने/सुनने लायक रखें (लगभग 70 से 120 शब्द)।
3. बिना खर्च या कम संसाधन वाली 2-3 आसान कक्षा गतिविधियाँ (जैसे स्लेट, कंकड़, कहानी, जोड़ीदार अभ्यास, अभिभावक से बात) 1, 2, 3 बिंदुओं में बताएं।
4. किसी भी तरह के मार्कडाउन चिह्न (** या * या #) का प्रयोग बिल्कुल न करें — केवल साफ़, सीधा पाठ लिखें।
5. शिक्षक की मेहनत का सम्मान करें और यदि कोई विषय चुना गया है, तो उत्तर को सीधे उसी विषय से जोड़ें।

${contextSummary ? `वर्तमान संदर्भ:\n${contextSummary}` : ''}`
        : `You are "Saathi AI Sahayak", a warm, practical peer companion for Indian government primary and upper-primary school teachers.
Your guidance is grounded in simple classroom micro-improvements, FLN, Balvatika readiness, multi-age classrooms, home-language bridging, student attendance, and community dialogue.

Guidelines:
1. Respond in clear, simple, warm Indian English without jargon.
2. Keep replies short and easy to read on a phone (around 70-120 words) and natural to listen to aloud.
3. Suggest 2-3 zero-cost classroom or parent-dialogue steps using plain numbered lines (1, 2, 3).
4. Do NOT use any markdown symbols like **, *, or #—write clean plain text only.
5. Always encourage the teacher and connect your answer directly to the active topic context if provided.

${contextSummary ? `Current context:\n${contextSummary}` : ''}`;

    const contents = [
      ...sanitizedHistory.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      {
        role: 'user' as const,
        parts: [{ text: message }],
      },
    ];

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const isTransientError = (err: unknown): boolean => {
      const msg = err instanceof Error ? err.message : String(err);
      return (
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('overloaded')
      );
    };

    const callModelWithRetry = async (
      model: 'gemini-4-hydrogen' | 'gemini-3.1-flash-lite',
      attempts: number
    ) => {
      let lastErr: unknown;
      for (let i = 0; i < attempts; i++) {
        try {
          return await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              thinkingConfig: {
                thinkingLevel:
                  model === 'gemini-4-hydrogen' ? ThinkingLevel.LOW : ThinkingLevel.MINIMAL,
              },
            },
          });
        } catch (err) {
          lastErr = err;
          if (!isTransientError(err) || i === attempts - 1) {
            throw err;
          }
          await sleep(400 * Math.pow(2, i));
        }
      }
      throw lastErr;
    };

    let response;
    try {
      response = await callModelWithRetry('gemini-4-hydrogen', 2);
    } catch (primaryErr) {
      if (isTransientError(primaryErr)) {
        // Fall back to gemini-3.1-flash-lite if gemini-4-hydrogen is experiencing a demand spike
        response = await callModelWithRetry('gemini-3.1-flash-lite', 2);
      } else {
        throw primaryErr;
      }
    }

    const rawReply = response.text?.trim() ?? '';
    const replyText = rawReply
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\*\s+/gm, '• ')
      .trim();
    if (!replyText) {
      res.status(502).json({
        error:
          lang === 'hi'
            ? 'AI सहायक से कोई उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।'
            : 'AI assistant returned an empty response. Please try again.',
      });
      return;
    }

    res.json({ reply: replyText });
  } catch (err) {
    const rawMsg = err instanceof Error ? err.message : 'Assistant request failed';
    const isBusy =
      rawMsg.includes('503') ||
      rawMsg.includes('UNAVAILABLE') ||
      rawMsg.includes('high demand');
    const lang = (req.body as { lang?: unknown })?.lang === 'en' ? 'en' : 'hi';
    const friendlyError = isBusy
      ? lang === 'hi'
        ? 'अभी सर्वर पर अधिक दबाव है। कृपया कुछ सेकंड बाद दोबारा भेजें।'
        : 'The AI service is momentarily busy. Please tap Send again in a few seconds.'
      : rawMsg;
    res.status(isBusy ? 503 : 500).json({ error: friendlyError });
  }
});

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      text?: unknown;
      lang?: unknown;
      speakerGender?: unknown;
    };

    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const lang = body?.lang === 'en' ? 'en' : 'hi';
    const speakerGender = body?.speakerGender === 'male' ? 'male' : 'female';

    if (!text) {
      res.status(400).json({ error: 'Text is required for speech synthesis.' });
      return;
    }

    const clippedText = text.slice(0, 1500);
    const cacheKey = `${lang}:${speakerGender}:${clippedText}`;
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.json({ audioBase64: cached, mimeType: 'audio/wav', cached: true });
      return;
    }

    const ai = getAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackRecommended: true,
      });
      return;
    }

    const voiceName = speakerGender === 'male' ? 'Charon' : 'Kore';
    const styleInstruction =
      lang === 'hi'
        ? 'Speak in natural, warm North Indian Hindi (hi-IN) with an authentic Indian accent, like an experienced Indian government primary school teacher speaking clearly and reassuringly.'
        : 'Speak in warm, clear Indian English (en-IN) with a natural, authentic Indian accent, like an Indian school educator speaking clearly at a gentle conversational pace.';

    const ttsConfig = {
      responseModalities: ['AUDIO'] as string[],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: clippedText,
                speechMetadata: {
                  style: styleInstruction,
                },
              },
            ],
          },
        ],
        config: ttsConfig,
      });
    } catch (ttsErr) {
      const errText = ttsErr instanceof Error ? ttsErr.message : String(ttsErr);
      if (errText.includes('speechMetadata')) {
        const inlinePrompt =
          lang === 'hi'
            ? `Say in warm North Indian Hindi: ${clippedText}`
            : `Say in a warm, clear Indian English accent: ${clippedText}`;
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: inlinePrompt }],
            },
          ],
          config: ttsConfig,
        });
      } else {
        throw ttsErr;
      }
    }

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({
        error: 'TTS model returned no audio data.',
        fallbackRecommended: true,
      });
      return;
    }

    if (ttsCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = ttsCache.keys().next().value;
      if (oldestKey) ttsCache.delete(oldestKey);
    }
    ttsCache.set(cacheKey, base64Audio);

    res.json({ audioBase64: base64Audio, mimeType: 'audio/wav', cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TTS generation failed';
    res.status(500).json({ error: message, fallbackRecommended: true });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Saathi server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
