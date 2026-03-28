export type SpatialPlaceLabel =
  | "OFFICE"
  | "HOME"
  | "CAFE"
  | "CLASSROOM"
  | "STREET"
  | "MOUNTAIN"
  | "RIVER"
  | "FOREST"
  | "BEACH"
  | "OTHER";

export type SpatialAnalysis = {
  place: SpatialPlaceLabel;
  confidence: number;
  reason: string;
  tags?: string[];
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const spatialPlaceLabelKo = (label: SpatialPlaceLabel) => {
  switch (label) {
    case "OFFICE":
      return "오피스";
    case "HOME":
      return "집";
    case "CAFE":
      return "카페";
    case "CLASSROOM":
      return "교실";
    case "STREET":
      return "거리";
    case "MOUNTAIN":
      return "산";
    case "RIVER":
      return "강";
    case "FOREST":
      return "숲";
    case "BEACH":
      return "해변";
    default:
      return "기타";
  }
};

export const analyzeSpatialPlace = async (params: {
  imageDataUrl: string;
}): Promise<SpatialAnalysis> => {
  const prompt =
    "You analyze the BACKGROUND/space in the image. Classify the place into exactly one of these labels: OFFICE, HOME, CAFE, CLASSROOM, STREET, MOUNTAIN, RIVER, FOREST, BEACH, OTHER. Return ONLY a JSON object with keys: place (one label), confidence (0..1), reason (one short sentence), tags (0-5 short keywords).";

  const response = await fetch("/api/openai/vision", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageDataUrl: params.imageDataUrl,
      prompt,
      model: "gpt-4o-mini",
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `Spatial analysis failed (${response.status})`);
  }

  const body = (await response.json()) as { data?: unknown };
  const data = body?.data;
  if (!data || typeof data !== "object") {
    throw new Error("Spatial analysis returned invalid data");
  }

  const maybePlace = (data as any).place;
  const maybeConfidence = (data as any).confidence;
  const maybeReason = (data as any).reason;
  const maybeTags = (data as any).tags;

  const place: SpatialPlaceLabel =
    typeof maybePlace === "string" ? (maybePlace as SpatialPlaceLabel) : "OTHER";
  const confidence =
    typeof maybeConfidence === "number" ? clamp01(maybeConfidence) : 0;
  const reason = typeof maybeReason === "string" ? maybeReason : "";
  const tags = Array.isArray(maybeTags)
    ? maybeTags.filter((t) => typeof t === "string").slice(0, 5)
    : undefined;

  return {
    place,
    confidence,
    reason,
    tags,
  };
};

