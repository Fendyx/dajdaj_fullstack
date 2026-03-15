import React, { useState, useRef, useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner/Spinner";

// 🔥 Исправленная декларация для React 18+
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "shadow-intensity"?: string;
          autoplay?: boolean;
          "camera-orbit"?: string;
          "camera-controls"?: boolean;
          "disable-zoom"?: boolean;
          "poster"?: string;
        },
        HTMLElement
      >;
    }
  }
}

interface ThreeDViewerProps {
  modelUrl: string;
  fallbackImage?: string;
}

export function ThreeDViewer({ modelUrl }: ThreeDViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const modelViewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (modelViewer) {
      // @ts-ignore - так как это кастомный элемент, TS может не видеть событие load
      const handleLoad = () => setIsLoading(false);
      // @ts-ignore
      const handleError = () => setIsLoading(false);

      modelViewer.addEventListener("load", handleLoad);
      modelViewer.addEventListener("error", handleError);
      
      return () => {
        modelViewer.removeEventListener("load", handleLoad);
        modelViewer.removeEventListener("error", handleError);
      };
    }
  }, []);

  return (
    <div className="model-viewer-wrapper relative w-full h-[500px] bg-gray-50 rounded-xl overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10">
          <Spinner text="Loading 3D Model..." />
        </div>
      )}
      <model-viewer
        ref={modelViewerRef}
        src={modelUrl}
        shadow-intensity="1"
        autoplay
        camera-orbit="-90deg 75deg"
        camera-controls
        disable-zoom
        style={{ width: "100%", height: "100%", background: "transparent" }}
      />
    </div>
  );
}