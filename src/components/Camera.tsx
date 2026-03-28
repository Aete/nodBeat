import { useEffect, useRef, useState } from 'react';

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
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('카메라에 접근할 수 없습니다. 권한을 확인해주세요.');
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl bg-gray-900 shadow-2xl border-4 border-indigo-500/30">
      {error ? (
        <div className="flex items-center justify-center h-64 text-red-400 p-4 text-center">
          <p>{error}</p>
        </div>
      ) : (
        <div className="relative aspect-video">
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 animate-pulse">
              <span className="text-gray-400">카메라를 불러오는 중...</span>
            </div>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transform scale-x-[-1] ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          />
          {isActive && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full border border-white/20">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-white uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Camera;
