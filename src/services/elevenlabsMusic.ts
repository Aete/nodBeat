import type { SpatialAnalysis } from "./spatialVision";

export type MusicGenerationInput = {
  bpm: number;
  valence: number | null;
  spatial: SpatialAnalysis | null;
};

const moodEn = (valence: number | null) => {
  if (valence == null) return "a neutral moment";
  if (valence >= 0.65) return "a bright, uplifting moment";
  if (valence <= 0.35) return "a calm, introspective moment";
  return "a balanced, neutral moment";
};

const placeEn = (spatial: SpatialAnalysis | null) => {
  const label = spatial?.place;
  switch (label) {
    case "OFFICE":
      return "an office";
    case "HOME":
      return "home";
    case "CAFE":
      return "a cafe";
    case "CLASSROOM":
      return "a classroom";
    case "STREET":
      return "the street";
    case "MOUNTAIN":
      return "the mountains";
    case "RIVER":
      return "a riverside";
    case "FOREST":
      return "a forest";
    case "BEACH":
      return "a beach";
    default:
      return "an unspecified place";
  }
};

export const buildMusicPromptEn = (input: MusicGenerationInput) => {
  const bpm = Number.isFinite(input.bpm) && input.bpm > 0 ? Math.round(input.bpm) : 110;
  const place = placeEn(input.spatial);
  const mood = moodEn(input.valence);
  return `A pleasant song to listen to at ${place}, during ${mood}, around ${bpm} BPM. Modern production, catchy melody, no copyrighted references.`;
};

export const generateMusicWithElevenLabs = async (input: MusicGenerationInput) => {
  const prompt = buildMusicPromptEn(input);

  const response = await fetch("/api/elevenlabs/music", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      outputFormat: "mp3_44100_128",
      musicLengthMs: 60000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(errText || `ElevenLabs generation failed (${response.status})`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const fileName = `nodBeat-${Date.now()}.mp3`;

  return { url, fileName };
};
