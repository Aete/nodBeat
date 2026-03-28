import { useEffect, useRef, useState } from "react";
import { Loading, Tag } from "@carbon/react";
import { Video } from "@carbon/icons-react";

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

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
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          />
          {isActive && (
            <div
              style={{
                position: "absolute",
                top: "var(--cds-spacing-05)",
                right: "var(--cds-spacing-05)",
                zIndex: 1,
              }}
            >
              <Tag type="red" renderIcon={Video}>
                Live
              </Tag>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Camera;
