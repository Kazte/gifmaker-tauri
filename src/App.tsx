import { DialogType, useDialog } from "./components/providers/dialog";

import BottomButtons from "./components/bottom-buttons";
import DragAndDrop from "./components/drag-and-drop";
import { Timeline } from "./components/timeline";
import VideoControls from "./components/video-controls";
import VideoRenderer from "./components/video-renderer";
import { check } from "@tauri-apps/plugin-updater";
import { useEffect } from "react";
import { useVideoStore } from "./store/video.store";

function App() {
  const videoStore = useVideoStore((store) => store);
  const dialog = useDialog();

  useEffect(() => {
    check().then((update) => {
      if (update?.available) {
        dialog.showDialog(DialogType.UPDATE);
      }
    });
  }, []);

  if (videoStore.videoFile) {
    return (
      <main className="box-border flex h-[600px] w-[800px] flex-col items-center justify-between gap-2 p-2">
        <h2 className="line-clamp-1 min-h-5 max-w-full flex-grow overflow-ellipsis">
          {videoStore.videoFile.metadata.title}
        </h2>
        <VideoRenderer />
        <VideoControls />
        <Timeline />
        <BottomButtons />
      </main>
    );
  }

  return (
    <main className="grid h-screen w-screen place-items-center">
      <DragAndDrop />
    </main>
  );
}

export default App;
