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

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    json(res, 500, { error: "Missing ELEVENLABS_API_KEY on server" });
    return;
  }

  const {
    text,
    voiceId,
    modelId,
    stability,
    similarityBoost,
    outputFormat,
  } = req.body ?? {};

  if (!text || typeof text !== "string") {
    json(res, 400, { error: "Missing text" });
    return;
  }

  const selectedVoiceId =
    typeof voiceId === "string" && voiceId.trim().length > 0
      ? voiceId.trim()
      : process.env.ELEVENLABS_VOICE_ID;

  if (!selectedVoiceId) {
    json(res, 400, { error: "Missing voiceId (or ELEVENLABS_VOICE_ID)" });
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
            typeof similarityBoost === "number" ? similarityBoost : 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      json(res, response.status, {
        error: "ElevenLabs request failed",
        details: errText,
      });
      return;
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.statusCode = 200;
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    res.end(audio);
  } catch (e) {
    json(res, 500, { error: "Server error", details: String(e) });
  }
}

