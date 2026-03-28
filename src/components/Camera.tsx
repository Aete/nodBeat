import { useEffect, useRef, useState } from "react";
import { Loading, Tag } from "@carbon/react";
import { Video, Music } from "@carbon/icons-react";
import { useNodDetection } from "../hooks/useNodDetection";
import { DrawingUtils, FaceLandmarker } from "@mediapipe/tasks-vision";

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const { landmarks, bpm, isNodding } = useNodDetection(videoRef);

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
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const drawingUtils = new DrawingUtils(ctx);

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (landmarks && landmarks.length > 0) {
      // Landmark color change based on nodding
      const color = isNodding ? "#FF0000" : "#00FF00"; // Red when nodding, green otherwise
      const connectorColor = isNodding ? "#FF000088" : "#00FF0088";

      landmarks.forEach((landmark) => {
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_TESSELATION,
          {
            color: connectorColor,
            lineWidth: 1,
          },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_LIPS,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
          { color: color },
        );
        drawingUtils.drawConnectors(
          landmark,
          FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
          { color: color },
        );
      });
    }
  }, [landmarks, isNodding]);

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
                  top: "var(--cds-spacing-05)",
                  left: "var(--cds-spacing-05)",
                  zIndex: 1,
                }}
              >
                <Tag type="red" renderIcon={Video}>
                  Live
                </Tag>
              </div>
              {bpm > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "var(--cds-spacing-05)",
                    right: "var(--cds-spacing-05)",
                    zIndex: 1,
                  }}
                >
                  <Tag
                    type="cyan"
                    renderIcon={Music}
                    style={{
                      fontSize: "1rem",
                      padding: "var(--cds-spacing-04) var(--cds-spacing-05)",
                    }}
                  >
                    {bpm} BPM
                  </Tag>
                </div>
              )}
            </>
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
