import { type Child, Command } from "@tauri-apps/plugin-shell";

type ProgressCallback = (progress: number) => void;

function parseProgress(
  data: string,
  totalDuration: number,
): number | undefined {
  const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
  const match = data.match(timeRegex);

  if (!match) return;

  const currentTime = match[1];
  return calculatePercentage(currentTime, totalDuration);
}

function calculatePercentage(
  time: string,
  totalDurationInSeconds: number,
): number {
  const [hours, minutes, seconds] = time.split(":").map(parseFloat);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return (totalSeconds / totalDurationInSeconds) * 100;
}

class FFMpegManager {
  // @ts-expect-error - private property
  private ffmpeg: Child | null = null;
  // @ts-expect-error - private property
  private ffprobe: Child | null = null;

  async convertToGif(
    inputFilePath: string,
    outputFilePath: string,
    duration: number,
    setProgress: ProgressCallback,
    speed: number = 1,
  ): Promise<void> {
    const convertToGifCmd = [
      "-i",
      inputFilePath,
      "-vf",
      `fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse,setpts=${1 / speed}*PTS`,
      "-c:v",
      "gif",
      "-loop",
      "0",
      outputFilePath,
    ];

    console.log(convertToGifCmd);

    const ffmpegSidecar = Command.sidecar("bin/ffmpeg", [
      "-y",
      ...convertToGifCmd,
    ]);

    return new Promise((resolve, reject) => {
      ffmpegSidecar.stdout.on("data", (data) => console.log(data));

      ffmpegSidecar.stderr.on("data", (data) => {
        const progress = parseProgress(data.toString(), duration);
        if (progress !== undefined) {
          setProgress(progress);
        }
      });

      ffmpegSidecar.on("close", (code) => {
        if (code.code === 0) {
          setProgress(100);
          resolve();
        } else {
          reject(`ffmpeg process failed with code ${code.code}`);
        }
      });

      ffmpegSidecar.spawn().then((child) => {
        this.ffmpeg = child;
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getMetadata(filePath: string): Promise<any> {
    const metadataCmd = [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ];

    const ffprobeSidecar = Command.sidecar("bin/ffprobe", metadataCmd);

    let metadata = "";

    return new Promise((resolve, reject) => {
      ffprobeSidecar.stdout.on("data", (data) => {
        metadata += data;
      });

      ffprobeSidecar.on("close", (code) => {
        if (code.code === 0) {
          resolve(JSON.parse(metadata));
        } else {
          reject(`ffprobe process failed with code ${code.code}`);
        }
      });

      ffprobeSidecar.spawn().then((child) => {
        this.ffprobe = child;
      });
    });
  }
}

export const ffmpegManager = new FFMpegManager();
