import { useEffect, useRef, useState, useCallback } from 'react';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandDetectionResult {
  landmarks: HandLandmark[] | null;
  isPinching: boolean;
  pinchPosition: { x: number; y: number } | null;
}

export const useHandDetection = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  enabled: boolean
) => {
  const [result, setResult] = useState<HandDetectionResult>({
    landmarks: null,
    isPinching: false,
    pinchPosition: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const PINCH_THRESHOLD = 0.06;

  const calculateDistance = (p1: HandLandmark, p2: HandLandmark): number => {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + 
      Math.pow(p1.y - p2.y, 2) + 
      Math.pow(p1.z - p2.z, 2)
    );
  };

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw video
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Flip horizontally for mirror effect
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);
    
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }
    
    ctx.restore();

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Draw hand landmarks
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      
      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm
      ];

      ctx.strokeStyle = 'hsl(280, 100%, 60%)';
      ctx.lineWidth = 2;
      
      connections.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        ctx.stroke();
      });

      // Draw landmarks
      landmarks.forEach((landmark: HandLandmark, index: number) => {
        const x = landmark.x * canvas.width;
        const y = landmark.y * canvas.height;
        
        ctx.beginPath();
        ctx.arc(x, y, index === 4 || index === 8 ? 8 : 4, 0, Math.PI * 2);
        ctx.fillStyle = index === 4 || index === 8 ? 'hsl(45, 100%, 55%)' : 'hsl(160, 100%, 50%)';
        ctx.fill();
        
        if (index === 4 || index === 8) {
          ctx.shadowColor = 'hsl(45, 100%, 55%)';
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      
      ctx.restore();

      // Check for pinch gesture
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const distance = calculateDistance(thumbTip, indexTip);
      const isPinching = distance < PINCH_THRESHOLD;
      
      // Calculate pinch position (midpoint, mirrored for display)
      const pinchX = canvas.width - ((thumbTip.x + indexTip.x) / 2) * canvas.width;
      const pinchY = ((thumbTip.y + indexTip.y) / 2) * canvas.height;

      setResult({
        landmarks,
        isPinching,
        pinchPosition: { x: pinchX, y: pinchY },
      });
    } else {
      setResult({
        landmarks: null,
        isPinching: false,
        pinchPosition: null,
      });
    }
  }, [canvasRef]);

  useEffect(() => {
    if (!enabled || !videoRef.current || !canvasRef.current) return;

    let isCancelled = false;

    const initHands = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // First, request camera access directly using getUserMedia
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        
        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Dynamic import for MediaPipe
        const { Hands } = await import('@mediapipe/hands');

        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          },
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5,
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        // Use requestAnimationFrame loop instead of MediaPipe Camera
        const processFrame = async () => {
          if (isCancelled || !handsRef.current || !videoRef.current) return;
          
          if (videoRef.current.readyState >= 2) {
            await handsRef.current.send({ image: videoRef.current });
          }
          
          animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        processFrame();
        setIsLoading(false);
      } catch (err: any) {
        console.error('Error initializing hand detection:', err, err?.name, err?.message);
        
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please allow camera in browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera found. Please connect a camera.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Camera is in use by another app. Please close it and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Camera does not support required resolution. Trying again...');
        } else if (err.message?.includes('getUserMedia')) {
          setError('Camera not available. Make sure you are using HTTPS.');
        } else {
          setError(`Camera error: ${err.message || 'Unknown error'}. Try refreshing.`);
        }
        setIsLoading(false);
      }
    };

    initHands();

    return () => {
      isCancelled = true;
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, videoRef, canvasRef, onResults]);

  return { ...result, isLoading, error };
};
