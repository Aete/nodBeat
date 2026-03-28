const json = (res, statusCode, body) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
};

const setCors = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "Method Not Allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    json(res, 500, { error: "Missing OPENAI_API_KEY on server" });
    return;
  }

  const { imageDataUrl, prompt, model } = req.body ?? {};

  if (!imageDataUrl || typeof imageDataUrl !== "string") {
    json(res, 400, { error: "Missing imageDataUrl (data URL string)" });
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      json(res, response.status, { error: "OpenAI request failed", details: errText });
      return;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    let parsed = null;
    if (typeof text === "string") {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = null;
      }
    }

    json(res, 200, { ok: true, model: selectedModel, data: parsed ?? text });
  } catch (e) {
    json(res, 500, { error: "Server error", details: String(e) });
  }
}
