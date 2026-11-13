import { useState, useRef, useEffect, useCallback } from "react";

export function useCameraStream(isOpen: boolean, onPhotoCaptured: (dataUrl: string) => void) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCameraError("");
    }
    return () => stopCamera();
  }, [isOpen, stopCamera]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => {
        // Ignore play interruption if camera closes quickly
      });
    }
  }, [isCameraActive]);

  const startLiveCamera = async () => {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          aspectRatio: { ideal: 0.75 },
          width: { ideal: 1920 },
          height: { ideal: 1440 },
        },
      });
      streamRef.current = stream;
      setIsCameraActive(true);
    } catch {
      setCameraError(
        "Live camera viewfinder unavailable on this device. Tap 'Snap Picture with Phone Camera' or 'Upload Saved Photo' below."
      );
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1080;
    canvas.height = videoRef.current.videoHeight || 1440;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopCamera();
    onPhotoCaptured(dataUrl);
  };

  return {
    isCameraActive,
    cameraError,
    videoRef,
    startLiveCamera,
    stopCamera,
    capturePhoto,
  };
}
