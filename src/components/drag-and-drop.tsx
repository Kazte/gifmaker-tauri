import { ffmpegManager } from "@/lib/ffmpeg";
import { open } from "@tauri-apps/plugin-dialog";
import { useAppStore } from "@/store/app.store";
import { useVideoStore } from "@/store/video.store";

export default function DragAndDrop() {
  const videoStore = useVideoStore((store) => store);
  const appStore = useAppStore((store) => store);

  const handleOnClick = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: "Videos", extensions: ["mp4", "webm", "ogg"] }],
    });

    if (file) {
      appStore.setLoading(true);

      try {
        const metaData = await ffmpegManager.getMetadata(file.path);
        const duration = parseFloat(metaData.format.duration);
        console.log(metaData);

        const title = metaData.format.filename!.split("\\").pop();

        videoStore.setVideoFile({
          path: file.path,
          metadata: {
            title: title,
            duration: duration,
            size: {
              width: metaData.streams[0].width,
              height: metaData.streams[0].height,
            },
          },
        });
      } catch (error) {
        console.error(error);
      } finally {
        appStore.setLoading(false);
      }
    }
  };

  return (
    <section
      className="mx-auto flex h-3/4 w-3/4 flex-grow cursor-pointer select-none flex-col items-center justify-center rounded-sm border-[3px] border-dashed border-foreground/20 hover:border-foreground/80"
      onClick={handleOnClick}
    >
      <h3 className="text-2xl">Upload file</h3>
    </section>
  );
}
