import type { Plugin, ViteDevServer } from "vite";
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from "node:http";

const openaiVisionApiPlugin = (): Plugin => {
  return {
    name: "openai-vision-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(
        "/api/openai/vision",
        async (
          req: IncomingMessage,
          res: ServerResponse,
          next: (err?: unknown) => void,
        ) => {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );

        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Method Not Allowed" }));
          return;
        }

        const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify({ error: "Missing OPENAI_API_KEY on server" }));
          return;
        }

        let rawBody = "";
        req.on("data", (chunk: Buffer) => {
          rawBody += chunk;
        });

        req.on("end", async () => {
          let body;
          try {
            body = rawBody ? JSON.parse(rawBody) : {};
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Invalid JSON body" }));
            return;
          }

          const { imageDataUrl, prompt, model } = body ?? {};
          if (!imageDataUrl || typeof imageDataUrl !== "string") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Missing imageDataUrl (data URL string)" }));
            return;
          }

          const userPrompt =
            typeof prompt === "string" && prompt.trim().length > 0
              ? prompt.trim()
              : "Analyze the scene and return a JSON object with keys: vibe, genre, instruments, positivity (0..1), and short_prompt.";

          const selectedModel =
            typeof model === "string" && model.trim().length > 0
              ? model.trim()
              : process.env.OPENAI_MODEL || "gpt-4o-mini";

          try {
            const response = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                  model: selectedModel,
                  temperature: 0.4,
                  response_format: { type: "json_object" },
                  messages: [
                    {
                      role: "system",
                      content:
                        "You are a helpful assistant. Always output a single valid JSON object and nothing else.",
                    },
                    {
                      role: "user",
                      content: [
                        { type: "text", text: userPrompt },
                        {
                          type: "image_url",
                          image_url: { url: imageDataUrl },
                        },
                      ],
                    },
                  ],
                }),
              },
            );

            if (!response.ok) {
              const errText = await response.text().catch(() => "");
              res.statusCode = response.status;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({
                  error: "OpenAI request failed",
                  details: errText,
                }),
              );
              return;
            }

            const data = (await response.json()) as any;
            const text = data?.choices?.[0]?.message?.content ?? "";

            let parsed = null;
            if (typeof text === "string") {
              try {
                parsed = JSON.parse(text);
              } catch {
                parsed = null;
              }
            }

            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({
                ok: true,
                model: selectedModel,
                data: parsed ?? text,
              }),
            );
          } catch (e) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Server error", details: String(e) }));
          }
        });

        req.on("error", () => next());
        },
      );

      server.middlewares.use(
        "/api/elevenlabs/tts",
        async (
          req: IncomingMessage,
          res: ServerResponse,
          next: (err?: unknown) => void,
        ) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
          );

          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Method Not Allowed" }));
            return;
          }

          const apiKey =
            process.env.ELEVENLABS_API_KEY ||
            process.env.VITE_ELEVENLABS_API_KEY ||
            process.env.VITE_ELEVEN_LABS_API;
          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({ error: "Missing ELEVENLABS_API_KEY on server" }),
            );
            return;
          }

          let rawBody = "";
          req.on("data", (chunk: Buffer) => {
            rawBody += chunk;
          });

          req.on("end", async () => {
            let body;
            try {
              body = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Invalid JSON body" }));
              return;
            }

            const {
              text,
              voiceId,
              modelId,
              stability,
              similarityBoost,
              outputFormat,
            } = body ?? {};

            if (!text || typeof text !== "string") {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Missing text" }));
              return;
            }

            const selectedVoiceId =
              typeof voiceId === "string" && voiceId.trim().length > 0
                ? voiceId.trim()
                : process.env.ELEVENLABS_VOICE_ID ||
                  process.env.VITE_ELEVENLABS_VOICE_ID;

            if (!selectedVoiceId) {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({ error: "Missing voiceId (or ELEVENLABS_VOICE_ID)" }),
              );
              return;
            }

            const selectedModelId =
              typeof modelId === "string" && modelId.trim().length > 0
                ? modelId.trim()
                : process.env.ELEVENLABS_MODEL_ID;

            const selectedOutputFormat =
              typeof outputFormat === "string" && outputFormat.trim().length > 0
                ? outputFormat.trim()
                : process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";

            try {
              const url = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
                selectedVoiceId,
              )}?output_format=${encodeURIComponent(selectedOutputFormat)}`;

              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                  text,
                  model_id: selectedModelId,
                  voice_settings: {
                    stability: typeof stability === "number" ? stability : 0.5,
                    similarity_boost:
                      typeof similarityBoost === "number"
                        ? similarityBoost
                        : 0.75,
                  },
                }),
              });

              if (!response.ok) {
                const errText = await response.text().catch(() => "");
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(
                  JSON.stringify({
                    error: "ElevenLabs request failed",
                    details: errText,
                  }),
                );
                return;
              }

              const audio = Buffer.from(await response.arrayBuffer());
              res.statusCode = 200;
              res.setHeader("Content-Type", "audio/mpeg");
              res.setHeader("Cache-Control", "no-store");
              res.end(audio);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({ error: "Server error", details: String(e) }),
              );
            }
          });

          req.on("error", () => next());
        },
      );

      server.middlewares.use(
        "/api/elevenlabs/music",
        async (
          req: IncomingMessage,
          res: ServerResponse,
          next: (err?: unknown) => void,
        ) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
          res.setHeader(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization",
          );

          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            res.end();
            return;
          }

          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "Method Not Allowed" }));
            return;
          }

          const apiKey =
            process.env.ELEVENLABS_API_KEY ||
            process.env.VITE_ELEVENLABS_API_KEY ||
            process.env.VITE_ELEVEN_LABS_API;
          if (!apiKey) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(
              JSON.stringify({ error: "Missing ELEVENLABS_API_KEY on server" }),
            );
            return;
          }

          let rawBody = "";
          req.on("data", (chunk: Buffer) => {
            rawBody += chunk;
          });

          req.on("end", async () => {
            let body;
            try {
              body = rawBody ? JSON.parse(rawBody) : {};
            } catch {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Invalid JSON body" }));
              return;
            }

            const { prompt, outputFormat, musicLengthMs } = body ?? {};
            if (!prompt || typeof prompt !== "string") {
              res.statusCode = 400;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(JSON.stringify({ error: "Missing prompt" }));
              return;
            }

            const selectedOutputFormat =
              typeof outputFormat === "string" && outputFormat.trim().length > 0
                ? outputFormat.trim()
                : process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";

            const selectedMusicLengthMs =
              typeof musicLengthMs === "number" && Number.isFinite(musicLengthMs)
                ? Math.max(5000, Math.min(60000, Math.round(musicLengthMs)))
                : 60000;

            try {
              const url = `https://api.elevenlabs.io/v1/music?output_format=${encodeURIComponent(
                selectedOutputFormat,
              )}`;

              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "xi-api-key": apiKey,
                },
                body: JSON.stringify({
                  prompt: prompt.trim(),
                  music_length_ms: selectedMusicLengthMs,
                }),
              });

              if (!response.ok) {
                const errText = await response.text().catch(() => "");
                res.statusCode = response.status;
                res.setHeader("Content-Type", "application/json; charset=utf-8");
                res.end(
                  JSON.stringify({
                    error: "ElevenLabs music request failed",
                    details: errText,
                  }),
                );
                return;
              }

              const audio = Buffer.from(await response.arrayBuffer());
              res.statusCode = 200;
              res.setHeader("Content-Type", "audio/mpeg");
              res.setHeader("Cache-Control", "no-store");
              res.end(audio);
            } catch (e) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json; charset=utf-8");
              res.end(
                JSON.stringify({ error: "Server error", details: String(e) }),
              );
            }
          });

          req.on("error", () => next());
        },
      );
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] == null) process.env[key] = value;
  }

  return {
    plugins: [react(), openaiVisionApiPlugin()],
  };
});
