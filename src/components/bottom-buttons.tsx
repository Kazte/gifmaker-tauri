import { DialogType, useDialog } from "./providers/dialog";

import { Button } from "./ui/button";
import { ffmpegManager } from "@/lib/ffmpeg";
import { useAppStore } from "@/store/app.store";
import { useVideoStore } from "@/store/video.store";

export default function BottomButtons() {
  const appStore = useAppStore((store) => store);
  const videoStore = useVideoStore((store) => store);

  const { showDialog, hideDialog } = useDialog();

  const handleRemoveFile = () => {
    appStore.setLoading(false);
    appStore.setVideoReference(null);

    videoStore.setVideoFile(null);
    videoStore.setIsPlaying(false);
    videoStore.setCurrentTime(0);
  };

  const handleConvertToGif = async () => {
    try {
      showDialog(DialogType.PROGRESS);
      appStore.setLoading(true);
      appStore.setProgress(0);
      videoStore.setIsPlaying(false);

      // wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const outputfile = videoStore.videoFile!.path.replace(/\.\w+$/, ".gif");

      await ffmpegManager.convertToGif(
        videoStore.videoFile!.path,
        outputfile,
        videoStore.videoFile!.metadata.duration,
        (progress) => {
          console.log("Progress", progress);
          appStore.setProgress(progress);
        },
        videoStore.speed,
      );

      console.log("Done converting to GIF");
    } catch (e) {
      console.error(e);

      hideDialog();
    } finally {
      appStore.setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-row items-center justify-end gap-4">
      <Button
        size="sm"
        variant="destructive"
        disabled={appStore.isLoading}
        onClick={handleRemoveFile}
      >
        Remove video
      </Button>
      <Button
        size="sm"
        disabled={appStore.isLoading}
        onClick={handleConvertToGif}
      >
        Convert to GIF
      </Button>
    </div>
  );
}
