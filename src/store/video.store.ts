import { create } from "zustand";

export const speedDictionary: Record<number, string> = {
  0.25: "0.25x",
  0.5: "0.5x",
  1: "1x",
  1.5: "1.5x",
  2: "2x",
  4: "4x",
  8: "8x",
  16: "16x",
  32: "32x",
  64: "64x",
};

export type SpeedType = keyof typeof speedDictionary;

type VideoFile = {
  path: string;
  metadata: {
    title: string;
    duration: number;
    size: {
      width: number;
      height: number;
    };
  };
};

type VideoStore = {
  videoFile: VideoFile | null;
  isPlaying: boolean;
  currentTime: number;
  isLoop: boolean;
  speed: SpeedType;
};

interface VideoStoreActions {
  setVideoFile: (videoFile: VideoFile | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (currentTime: number) => void;
  setIsLoop: (isLoop: boolean) => void;
  setSpeed: (speed: SpeedType) => void;
}

const useVideoStore = create<VideoStore & VideoStoreActions>((set) => ({
  videoFile: null,
  isPlaying: false,
  currentTime: 0,
  isLoop: true,
  speed: 1,
  setVideoFile: (videoFile) =>
    set({ videoFile, currentTime: 0, isPlaying: false, isLoop: false }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setIsLoop: (isLoop) => set({ isLoop }),
  setSpeed: (speed) => set({ speed }),
}));

export { useVideoStore, type VideoFile };
