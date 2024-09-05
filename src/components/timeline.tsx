import React, { useState } from "react";

import { formatTimestamp } from "@/lib/utils";
import { useAppStore } from "@/store/app.store";
import { useVideoStore } from "@/store/video.store";

export const Timeline = () => {
  const [isDragging, setIsDragging] = useState(false);
  const videoStore = useVideoStore((store) => store);
  const appStore = useAppStore((store) => store);

  const onTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleClickEvent(e);
  };

  const onTimelineDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleClickEvent(e);
    }
  };

  const handleClickEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    if (appStore.isLoading) return;

    const { left, width } = e.currentTarget.getBoundingClientRect();
    const duration = videoStore.videoFile!.metadata.duration;

    const clickPosition = e.clientX - left - 4;
    const clickPositionInPercent = clickPosition / width;
    const newCurrentTime = duration * clickPositionInPercent;

    appStore.videoReference!.currentTime = newCurrentTime;

    videoStore.setCurrentTime(newCurrentTime);
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="relative min-h-8 w-full cursor-ew-resize rounded-sm bg-foreground aria-disabled:cursor-not-allowed aria-disabled:bg-foreground/20"
      onClick={onTimelineClick}
      onMouseMove={onTimelineDrag}
      onMouseDown={onDragStart}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      aria-disabled={appStore.isLoading}
    >
      <div
        className="relative h-full w-[4px] bg-accent"
        style={{
          left: `${(videoStore.currentTime / videoStore.videoFile!.metadata.duration) * 100}%`,
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 mx-auto flex h-full w-fit select-none items-center justify-center text-background">
        <div className="rounded-sm bg-background/20 px-2 font-mono font-semibold">
          {formatTimestamp(videoStore.currentTime)}
        </div>
      </div>
    </div>
  );
};
