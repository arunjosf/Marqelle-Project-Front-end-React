import { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { X, Camera as CameraIcon, Loader } from "lucide-react";

export default function TryOn({ productImage, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const imgRef = useRef(null);
  const smoothRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detected, setDetected] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = productImage;
    img.onload = () => { imgRef.current = img; };

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 2,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    const smooth = (prev, next, factor = 0.25) => {
      if (prev === null || prev === undefined) return next;
      return prev + factor * (next - prev);
    };

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      if (!canvas || !imgRef.current) return;
      const ctx = canvas.getContext("2d");
      const W = canvas.width;
      const H = canvas.height;

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, -W, 0, W, H);
      ctx.restore();

      if (!results.poseLandmarks) return;

      const lm = results.poseLandmarks;

      const ls = { x: (1 - lm[11].x) * W, y: lm[11].y * H, v: lm[11].visibility };
      const rs = { x: (1 - lm[12].x) * W, y: lm[12].y * H, v: lm[12].visibility };
      const lh = { x: (1 - lm[23].x) * W, y: lm[23].y * H, v: lm[23].visibility };
      const rh = { x: (1 - lm[24].x) * W, y: lm[24].y * H, v: lm[24].visibility };

      if (ls.v < 0.5 || rs.v < 0.5 || lh.v < 0.4 || rh.v < 0.4) return;

      const shoulderWidth = Math.abs(ls.x - rs.x);
      const centerX      = (ls.x + rs.x) / 2;
      const shoulderY = (ls.y + rs.y) / 2;
      const hipCenterY   = (lh.y + rh.y) / 2;
      const torsoHeight  = hipCenterY - shoulderY;

      const rawWidth  = shoulderWidth * 2.6;
      const rawHeight = torsoHeight * 1.7;
      const rawX      = centerX - rawWidth / 2;
      const rawY      = shoulderY - torsoHeight * 0.30;

      const s = smoothRef.current;
      if (!s) {
        smoothRef.current = { x: rawX, y: rawY, w: rawWidth, h: rawHeight };
        return;
      }

      s.x = smooth(s.x, rawX);
      s.y = smooth(s.y, rawY);
      s.w = smooth(s.w, rawWidth);
      s.h = smooth(s.h, rawHeight);

      const angle = Math.atan2(rs.y - ls.y, rs.x - ls.x);

      ctx.save();
      ctx.translate(centerX, s.y);
      ctx.rotate(angle * 0.5);
      ctx.globalAlpha = 0.92;
      ctx.drawImage(imgRef.current, -s.w / 2, 0, s.w, s.h);
      ctx.globalAlpha = 1.0;
      ctx.restore();

      if (loading) {
        setLoading(false);
        setDetected(true);
      }
    });

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480,
        facingMode: "user",
      });

      cameraRef.current = camera;
      camera.start().catch(() => {
        setError("Could not access camera. Please allow camera permission.");
        setLoading(false);
      });
    } else {
      setError("Camera not supported on this device.");
      setLoading(false);
    }

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
    };
  }, [productImage]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4">
      <div className="relative flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2 text-white">
            <CameraIcon size={16} />
            <span className="text-sm font-medium">AR Try-On</span>
            {detected && (
              <span className="text-xs text-green-400 ml-2">● Body detected</span>
            )}
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition p-1">
            <X size={20} />
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-2xl">
          <video ref={videoRef} className="hidden" />
          <canvas ref={canvasRef} width={640} height={480} className="rounded-2xl" />

          {loading && !error && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-2xl gap-3">
              <Loader size={28} className="text-white animate-spin" />
              <p className="text-white text-sm">Detecting body position...</p>
              <p className="text-gray-400 text-xs">Make sure your upper body is fully visible</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-2xl gap-3 px-6">
              <p className="text-red-400 text-sm text-center">{error}</p>
              <button onClick={onClose} className="px-4 py-2 bg-white text-black text-sm rounded-xl hover:bg-gray-100">
                Close
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-3">
          <p className="text-gray-400 text-xs">💡 Stand 1–2m from camera</p>
          <p className="text-gray-400 text-xs">💡 Good lighting helps</p>
          <p className="text-gray-400 text-xs">💡 Face camera straight</p>
        </div>
      </div>
    </div>
  );
}