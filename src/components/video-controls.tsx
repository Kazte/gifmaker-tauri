import {
  ChevronFirst,
  ChevronLast,
  Pause,
  Play,
  Repeat1,
  Repeat2,
} from "lucide-react";
import { SpeedType, speedDictionary, useVideoStore } from "@/store/video.store";

import { Button } from "./ui/button";
import { useAppStore } from "@/store/app.store";
import { useState } from "react";

export default function VideoControls() {
  const appStore = useAppStore((store) => store);
  const videoStore = useVideoStore((store) => store);

  const handlePlayPause = () => {
    const video = appStore.videoReference;

    if (videoStore.isPlaying) {
      video?.pause();
    } else {
      video?.play();
    }

    videoStore.setIsPlaying(!videoStore.isPlaying);
  };

  const handleOnBackFrame = () => {};

  const handleOnNextFrame = () => {};

  const handleSetLoop = () => {
    videoStore.setIsLoop(!videoStore.isLoop);

    const video = appStore.videoReference;

    if (videoStore.isLoop) {
      video?.setAttribute("loop", "");
    } else {
      video?.removeAttribute("loop");
    }
  };

  const handleSetSpeed = () => {
    const speedKeys = speedDictionary;

    const speedKeysArray = Object.keys(speedKeys).map(Number);

    const currentIndex = speedKeysArray.indexOf(Number(videoStore.speed));

    const nextIndex = currentIndex + 1;

    const nextSpeed = speedKeysArray[nextIndex] || speedKeysArray[0];

    videoStore.setSpeed(nextSpeed as SpeedType);

    console.log("Speed", nextSpeed);
  };

  return (
    <div className="mt-2 flex w-full flex-1 items-center justify-center space-x-4">
      <Button
        size="icon"
        disabled={appStore.isLoading}
        onClick={handleOnBackFrame}
      >
        <ChevronFirst />
      </Button>
      <Button
        disabled={appStore.isLoading}
        size="icon"
        onClick={handlePlayPause}
      >
        {videoStore.isPlaying ? <Pause /> : <Play />}
      </Button>
      <Button
        size="icon"
        disabled={appStore.isLoading}
        onClick={handleOnNextFrame}
      >
        <ChevronLast />
      </Button>
      <Button disabled={appStore.isLoading} onClick={handleSetLoop}>
        {videoStore.isLoop ? <Repeat2 /> : <Repeat1 />}
      </Button>
      <Button disabled={appStore.isLoading} onClick={handleSetSpeed}>
        {speedDictionary[videoStore.speed]}
      </Button>
    </div>
  );
}
