import { useEffect, useRef } from "react";

import { convertFileSrc } from "@tauri-apps/api/core";
import { useAppStore } from "@/store/app.store";
import { useVideoStore } from "@/store/video.store";

export default function VideoRenderer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const appStore = useAppStore((store) => store);
  const videoStore = useVideoStore((store) => store);

  useEffect(() => {
    appStore.videoReference = videoRef.current;
  }, []);

  return (
    <div className="mt-2 flex flex-shrink flex-grow items-center justify-center overflow-hidden">
      <video
        src={convertFileSrc(videoStore.videoFile!.path)}
        className="max-h-full max-w-full object-contain"
        ref={videoRef}
        onPlay={() => {
          videoStore.setIsPlaying(true);
        }}
        onPause={() => {
          videoStore.setIsPlaying(false);
        }}
        onTimeUpdate={(e: React.SyntheticEvent<HTMLVideoElement>) => {
          videoStore.setCurrentTime(e.currentTarget.currentTime);
        }}
        loop={videoStore.isLoop}
      />
    </div>
  );
}
