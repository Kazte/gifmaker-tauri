import { create } from "zustand";

type AppStore = {
  isLoading: boolean;
  progress: number;
  videoReference: HTMLVideoElement | null;
};

interface AppStoreActions {
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
  setVideoReference: (videoReference: HTMLVideoElement | null) => void;
}

const useAppStore = create<AppStore & AppStoreActions>((set) => ({
  isLoading: false,
  progress: 0,
  videoReference: null,
  setLoading: (loading) => set({ isLoading: loading }),
  setProgress: (progress) => set({ progress }),
  setVideoReference: (videoReference) => set({ videoReference }),
}));

export { useAppStore, type AppStore };
