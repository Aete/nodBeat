import { useEffect, useMemo, useRef, useState } from "react";
import { Loading, Tag } from "@carbon/react";
import { Video, Music, Area } from "@carbon/icons-react";
import { useNodDetection } from "../hooks/useNodDetection";
import {
  analyzeSpatialPlace,
  spatialPlaceLabelKo,
  type SpatialAnalysis,
} from "../services/spatialVision";
import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

type CameraProps = {
  onSpatialUpdate?: (analysis: SpatialAnalysis | null) => void;
  onThumbsUp?: (ctx: {
    bpm: number;
    valence: number | null;
    spatial: SpatialAnalysis | null;
  }) => void;
  thumbsUpEnabled?: boolean;
};

const Camera = ({
  onSpatialUpdate,
  onThumbsUp,
  thumbsUpEnabled,
}: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const { landmarks, bpm, isNodding, valence } = useNodDetection(videoRef);

  const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(
    null,
  );
  const lastCaptureAtRef = useRef<number>(0);
  const [lastCapture, setLastCapture] = useState<{
    imageDataUrl: string;
    capturedAt: number;
    valence: number | null;
  } | null>(null);

  const [spatial, setSpatial] = useState<SpatialAnalysis | null>(null);
  const [spatialStatus, setSpatialStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const lastSpatialForCaptureAtRef = useRef<number>(0);
  const lastThumbsUpAtRef = useRef<number>(0);

  const valenceLabel = useMemo(() => {
    if (valence == null) return null;
    if (valence >= 0.65) return { label: "Positive", type: "green" as const };
    if (valence <= 0.35) return { label: "Negative", type: "red" as const };
    return { label: "Neutral", type: "cool-gray" as const };
  }, [valence]);

  const isFaceReady = useMemo(() => {
    return !!(landmarks && landmarks.length > 0);
  }, [landmarks]);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("카메라에 접근할 수 없습니다. 권한을 확인해주세요.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let landmarker: HandLandmarker | null = null;

    const initHandLandmarker = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
        );
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
        if (!cancelled) setHandLandmarker(landmarker);
      } catch (e) {
        console.error("Error initializing HandLandmarker:", e);
      }
    };

    initHandLandmarker();

    return () => {
      cancelled = true;
      landmarker?.close();
    };
  }, []);

  useEffect(() => {
    if (!handLandmarker || !videoRef.current) return;

    let animationId = 0;

    const angleDeg = (
      a: NormalizedLandmark,
      b: NormalizedLandmark,
      c: NormalizedLandmark,
    ) => {
      const abx = a.x - b.x;
      const aby = a.y - b.y;
      const cbx = c.x - b.x;
      const cby = c.y - b.y;
      const dot = abx * cbx + aby * cby;
      const mag1 = Math.hypot(abx, aby);
      const mag2 = Math.hypot(cbx, cby);
      if (mag1 === 0 || mag2 === 0) return 0;
      const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      return (Math.acos(cos) * 180) / Math.PI;
    };

    const isFingerExtended = (
      lm: NormalizedLandmark[],
      mcp: number,
      pip: number,
      tip: number,
    ) => angleDeg(lm[mcp], lm[pip], lm[tip]) > 160;

    const isFingerFolded = (
      lm: NormalizedLandmark[],
      mcp: number,
      pip: number,
      tip: number,
    ) => angleDeg(lm[mcp], lm[pip], lm[tip]) < 130;

    const isVSign = (lm: NormalizedLandmark[]) => {
      const indexExtended = isFingerExtended(lm, 5, 6, 8);
      const middleExtended = isFingerExtended(lm, 9, 10, 12);
      const ringFolded = isFingerFolded(lm, 13, 14, 16);
      const pinkyFolded = isFingerFolded(lm, 17, 18, 20);
      const tipDistance = Math.hypot(lm[8].x - lm[12].x, lm[8].y - lm[12].y);
      return (
        indexExtended &&
        middleExtended &&
        ringFolded &&
        pinkyFolded &&
        tipDistance > 0.04
      );
    };

    const isThumbsUp = (lm: NormalizedLandmark[]) => {
      const indexFolded = isFingerFolded(lm, 5, 6, 8);
      const middleFolded = isFingerFolded(lm, 9, 10, 12);
      const ringFolded = isFingerFolded(lm, 13, 14, 16);
      const pinkyFolded = isFingerFolded(lm, 17, 18, 20);

      const thumbExtended = angleDeg(lm[2], lm[3], lm[4]) > 160;
      const thumbUp = lm[4].y < lm[2].y - 0.04;
      const thumbFar =
        Math.hypot(lm[4].x - lm[0].x, lm[4].y - lm[0].y) >
        Math.hypot(lm[2].x - lm[0].x, lm[2].y - lm[0].y) + 0.02;

      return (
        indexFolded &&
        middleFolded &&
        ringFolded &&
        pinkyFolded &&
        thumbExtended &&
        thumbUp &&
        thumbFar
      );
    };

    const captureFrame = () => {
      const video = videoRef.current;
      if (!video) return null;
      if (video.videoWidth === 0 || video.videoHeight === 0) return null;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.85);
    };

    const detect = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        const now = performance.now();
        const results = handLandmarker.detectForVideo(video, now);
        const lm = results.landmarks?.[0];
        if (lm) {
          if (isVSign(lm)) {
            const last = lastCaptureAtRef.current;
            if (now - last > 1500) {
              const imageDataUrl = captureFrame();
              if (imageDataUrl) {
                lastCaptureAtRef.current = now;
                setLastCapture({
                  imageDataUrl,
                  capturedAt: Date.now(),
                  valence,
                });
              }
            }
          } else if (isThumbsUp(lm)) {
            const last = lastThumbsUpAtRef.current;
            if (now - last > 2500) {
              lastThumbsUpAtRef.current = now;
              if (thumbsUpEnabled !== false)
                onThumbsUp?.({ bpm, valence, spatial });
            }
          }
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    detect();

    return () => cancelAnimationFrame(animationId);
  }, [handLandmarker, valence, bpm, spatial, onThumbsUp, thumbsUpEnabled]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const drawingUtils = new DrawingUtils(ctx);

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (landmarks && landmarks.length > 0) {
      const lineColor = isNodding
        ? "rgba(255, 0, 0, 0.85)"
        : "rgba(0, 255, 0, 0.85)";
      const subtleLineColor = isNodding
        ? "rgba(255, 0, 0, 0.35)"
        : "rgba(0, 255, 0, 0.35)";
      const pointColor = isNodding
        ? "rgba(255, 0, 0, 0.9)"
        : "rgba(0, 255, 0, 0.9)";

      landmarks.forEach((face) => {
        drawingUtils.drawConnectors(
          face,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          {
            color: lineColor,
            lineWidth: 2,
          },
        );

        drawingUtils.drawConnectors(
          face,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          {
            color: lineColor,
            lineWidth: 2,
          },
        );
        drawingUtils.drawConnectors(
          face,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          {
            color: lineColor,
            lineWidth: 2,
          },
        );

        drawingUtils.drawConnectors(
          face,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          {
            color: subtleLineColor,
            lineWidth: 2,
          },
        );
        drawingUtils.drawConnectors(
          face,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          {
            color: subtleLineColor,
            lineWidth: 2,
          },
        );

        drawingUtils.drawConnectors(face, FaceLandmarker.FACE_LANDMARKS_LIPS, {
          color: subtleLineColor,
          lineWidth: 2,
        });

        drawingUtils.drawLandmarks(face, {
          color: pointColor,
          radius: 1,
        });
      });
    }
  }, [landmarks, isNodding]);

  useEffect(() => {
    if (!lastCapture) return;
    if (lastSpatialForCaptureAtRef.current === lastCapture.capturedAt) return;

    lastSpatialForCaptureAtRef.current = lastCapture.capturedAt;
    setSpatialStatus("loading");

    let cancelled = false;
    analyzeSpatialPlace({ imageDataUrl: lastCapture.imageDataUrl })
      .then((analysis) => {
        if (cancelled) return;
        setSpatial(analysis);
        setSpatialStatus("ready");
        onSpatialUpdate?.(analysis);
      })
      .catch(() => {
        if (cancelled) return;
        setSpatial(null);
        setSpatialStatus("error");
        onSpatialUpdate?.(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lastCapture, onSpatialUpdate]);

  return (
    <div
      className="camera-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "1280px",
        margin: "0 auto",
        backgroundColor: "var(--cds-layer-01)",
        border: "1px solid var(--cds-border-subtle)",
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      {error ? (
        <div style={{ padding: "var(--cds-spacing-09)", textAlign: "center" }}>
          <p style={{ color: "var(--cds-support-error)" }}>{error}</p>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            aspectRatio: "16/9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isActive && (
            <Loading withOverlay={false} description="카메라 로딩 중" />
          )}

          {isActive && !isFaceReady && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                padding: "var(--cds-spacing-04)",
                border: "1px solid var(--cds-border-subtle)",
                backgroundColor: "rgba(0,0,0,0.55)",
                color: "white",
                backdropFilter: "blur(6px)",
                fontSize: "var(--cds-body-short-01)",
              }}
            >
              얼굴 인식 로딩 중…
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              if (videoRef.current && canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              pointerEvents: "none",
            }}
          />

          {isActive && (
            <>
              <div
                style={{
                  position: "absolute",
                  top: "var(--cds-spacing-05, 1rem)",
                  left: "var(--cds-spacing-05, 1rem)",
                  zIndex: 1,
                }}
              >
                <Tag type="red" renderIcon={Video} size="sm">
                  Live
                </Tag>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "var(--cds-spacing-05, 1rem)",
                  right: "var(--cds-spacing-05, 1rem)",
                  zIndex: 3,
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--cds-spacing-03, 0.5rem)",
                  alignItems: "flex-end",
                }}
              >
                <Tag type="cyan" renderIcon={Music} size="sm">
                  {bpm > 0 ? `${bpm} BPM` : "BPM --"}
                </Tag>

                {valenceLabel && (
                  <Tag type={valenceLabel.type} size="sm">
                    {valenceLabel.label}{" "}
                    {Math.round(((valence ?? 0) as number) * 100)}%
                  </Tag>
                )}

                {spatialStatus === "loading" && (
                  <div
                    style={{
                      fontSize: "var(--cds-label-01)",
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.45)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      maxWidth: "280px",
                    }}
                  >
                    공간 분석 중…
                  </div>
                )}

                {spatialStatus === "ready" && spatial && (
                  <div
                    style={{
                      fontSize: "var(--cds-label-01)",
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.45)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      maxWidth: "280px",
                      textAlign: "right",
                    }}
                  >
                    공간: {spatialPlaceLabelKo(spatial.place)}{" "}
                    {Math.round(spatial.confidence * 100)}%
                  </div>
                )}

                {spatialStatus === "error" && (
                  <div
                    style={{
                      fontSize: "var(--cds-label-01)",
                      color: "white",
                      backgroundColor: "rgba(0,0,0,0.45)",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      maxWidth: "280px",
                    }}
                  >
                    공간 분석 실패
                  </div>
                )}
              </div>
            </>
          )}

          {lastCapture && (
            <div
              style={{
                position: "absolute",
                bottom: "var(--cds-spacing-05, 1rem)",
                right: "var(--cds-spacing-05, 1rem)",
                zIndex: 1,
                width: "160px",
                border: "1px solid var(--cds-border-subtle)",
                backgroundColor: "var(--cds-layer-01)",
              }}
            >
              <img
                src={lastCapture.imageDataUrl}
                alt="capture"
                style={{ width: "100%", display: "block" }}
              />
            </div>
          )}

          {spatialStatus === "ready" && spatial?.reason && (
            <div
              style={{
                position: "absolute",
                bottom: "var(--cds-spacing-05, 1rem)",
                left: "var(--cds-spacing-05, 1rem)",
                zIndex: 2,
                maxWidth: "min(420px, 70%)",
                padding: "var(--cds-spacing-04)",
                border: "1px solid var(--cds-border-subtle)",
                backgroundColor: "rgba(0,0,0,0.55)",
                color: "white",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--cds-spacing-03)",
                  marginBottom: "var(--cds-spacing-02)",
                  fontWeight: "var(--cds-font-weight-semibold)",
                }}
              >
                <Area size={16} />
                {spatialPlaceLabelKo(spatial.place)}
              </div>
              <div style={{ fontSize: "var(--cds-label-01)", opacity: 0.9 }}>
                {spatial.reason}
              </div>
              {!!spatial.tags?.length && (
                <div
                  style={{
                    marginTop: "var(--cds-spacing-03)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--cds-spacing-02)",
                  }}
                >
                  {spatial.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: "var(--cds-label-01)",
                        padding: "2px 6px",
                        border: "1px solid rgba(255,255,255,0.35)",
                        borderRadius: "999px",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {isNodding && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontSize: "4rem",
                fontWeight: "bold",
                color: "var(--cds-support-info)",
                textShadow: "0 0 20px rgba(0,0,0,0.5)",
                pointerEvents: "none",
                animation: "nod-ping 0.3s ease-out",
              }}
            >
              NOD!
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes nod-ping {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Camera;
