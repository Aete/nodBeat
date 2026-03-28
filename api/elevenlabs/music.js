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

  const apiKey =
    process.env.ELEVENLABS_API_KEY ||
    process.env.VITE_ELEVENLABS_API_KEY ||
    process.env.VITE_ELEVEN_LABS_API;
  if (!apiKey) {
    json(res, 500, { error: "Missing ELEVENLABS_API_KEY on server" });
    return;
  }

  const { prompt, outputFormat, musicLengthMs } = req.body ?? {};

  if (!prompt || typeof prompt !== "string") {
    json(res, 400, { error: "Missing prompt" });
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
      json(res, response.status, {
        error: "ElevenLabs music request failed",
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
