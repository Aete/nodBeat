import { useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { Category, NormalizedLandmark } from "@mediapipe/tasks-vision";

export const useNodDetection = (
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(
    null,
  );
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[][]>([]);
  const [blendshapes, setBlendshapes] = useState<Category[]>([]);
  const [valence, setValence] = useState<number | null>(null);
  const [bpm, setBpm] = useState(0);
  const [isNodding, setIsNodding] = useState(false);

  const lastYRef = useRef<number>(0);
  const nodTimestampsRef = useRef<number[]>([]);
  const directionRef = useRef<"up" | "down" | null>(null);
  const thresholdRef = useRef<number>(0.005); // Adjust based on sensitivity

  const computeValence = (categories: Category[]) => {
    const score = (name: string) =>
      categories.find((c) => c.categoryName === name)?.score ?? 0;

    const pos =
      (score("mouthSmileLeft") + score("mouthSmileRight")) * 0.6 +
      (score("cheekSquintLeft") + score("cheekSquintRight")) * 0.4;

    const neg =
      (score("mouthFrownLeft") + score("mouthFrownRight")) * 0.7 +
      (score("browDownLeft") + score("browDownRight")) * 0.3;

    const raw = 0.5 + (pos - neg) * 0.5;
    return Math.max(0, Math.min(1, raw));
  };

  useEffect(() => {
    const initFaceLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm",
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: "GPU",
        },
        outputFaceBlendshapes: true,
        runningMode: "VIDEO",
        numFaces: 1,
      });
      setFaceLandmarker(landmarker);
    };

    initFaceLandmarker();
  }, []);

  useEffect(() => {
    if (!faceLandmarker || !videoRef.current) return;

    let animationId: number;

    const detect = async () => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        const results = faceLandmarker.detectForVideo(
          videoRef.current,
          performance.now(),
        );

        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
          const currentLandmarks = results.faceLandmarks[0];
          setLandmarks(results.faceLandmarks);

          const categories = results.faceBlendshapes?.[0]?.categories ?? [];
          setBlendshapes(categories);
          setValence(categories.length > 0 ? computeValence(categories) : null);

          // Head Nod Detection Logic
          // Use nose tip (index 1) or chin (index 152) for vertical movement
          const noseTip = currentLandmarks[1];
          const currentY = noseTip.y;
          const currentTime = performance.now();

          if (lastYRef.current !== 0) {
            const deltaY = currentY - lastYRef.current;

            // Check for direction change (nod)
            if (Math.abs(deltaY) > thresholdRef.current) {
              const currentDirection = deltaY > 0 ? "down" : "up";

              if (
                directionRef.current === "up" &&
                currentDirection === "down"
              ) {
                // Peak detected (top of a nod)
                handleNod(currentTime);
              }
              directionRef.current = currentDirection;
            }
          }
          lastYRef.current = currentY;
        } else {
          setLandmarks([]);
          setBlendshapes([]);
          setValence(null);
        }
      }
      animationId = requestAnimationFrame(detect);
    };

    const handleNod = (time: number) => {
      setIsNodding(true);
      setTimeout(() => setIsNodding(false), 200);

      nodTimestampsRef.current.push(time);

      // Keep only last 5 seconds of nods for BPM
      nodTimestampsRef.current = nodTimestampsRef.current.filter(
        (t) => time - t < 5000,
      );

      if (nodTimestampsRef.current.length >= 2) {
        const first = nodTimestampsRef.current[0];
        const last =
          nodTimestampsRef.current[nodTimestampsRef.current.length - 1];
        const duration = (last - first) / 1000; // in seconds
        const count = nodTimestampsRef.current.length - 1;
        const calculatedBpm = Math.round((count / duration) * 60);

        if (calculatedBpm > 40 && calculatedBpm < 220) {
          setBpm(calculatedBpm);
        }
      }
    };

    detect();

    return () => cancelAnimationFrame(animationId);
  }, [faceLandmarker, videoRef]);

  return { landmarks, bpm, isNodding, blendshapes, valence };
};
