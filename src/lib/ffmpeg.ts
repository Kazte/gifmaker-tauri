import { type Child, Command } from '@tauri-apps/plugin-shell';
import { Dispatch } from 'react';
import { getPercentage, unformatTimestamp } from './utils';

let ffmpeg: Child;
let ffprobe: Child;

let videoDuration = 0;

async function getVideoDuration(filePath: string): Promise<number> {
  const videoDurationCmd = [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'format=duration',
    '-of',
    'default=noprint_wrappers=1:nokey=1',
    filePath
  ];

  const ffprobeSidecar = Command.sidecar('bin/ffprobe', videoDurationCmd);

  ffprobeSidecar.stdout.on('data', (data) => {
    videoDuration = Number.parseFloat(data.toString());
  });

  ffprobe = await ffprobeSidecar.spawn();

  return videoDuration;
}

async function convertToGif(
  inputFilePath: string,
  outputFilePath: string,
  // setStatus: Dispatch<React.SetStateAction<string>>
  setStatus: Dispatch<React.SetStateAction<boolean>>,
  setProgress: Dispatch<React.SetStateAction<number>>,
  onComplete: () => void,
  onError: (error: any) => void
): Promise<void> {
  setStatus(true);

  if (videoDuration === 0) {
    getVideoDuration(inputFilePath);
  }

  console.log(videoDuration);

  const convertToGifCmd = [
    '-i',
    inputFilePath,
    '-vf',
    'fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse',
    '-c:v',
    'gif',
    '-loop',
    '0',
    outputFilePath
  ];

  const ffmpegSidecar = Command.sidecar('bin/ffmpeg', [
    '-y',
    ...convertToGifCmd
  ]);

  ffmpegSidecar.stdout.on('data', (data) => {
    console.log(data);
  });

  ffmpegSidecar.stderr.on('data', async (data) => {
    // console.log(data);

    const progress = extractProgress(data.toString(), videoDuration);

    if (progress !== undefined) {
      console.log(progress);
      setProgress(progress);
    }
  });

  ffmpegSidecar.on('error', (error) => {
    console.error(error);
  });

  ffmpegSidecar.on('close', (code) => {
    setStatus(false);
    if (code.code === 0) {
      setProgress(100);
      onComplete();
      return;
    }

    console.error(code);
    onError(code);
  });

  await ffmpegSidecar.spawn();
}

function extractProgress(data: string, totalDuration: number) {
  const timeRegex = /time=(\d+:\d+:\d+\.\d+)/;
  const match = data.match(timeRegex);

  if (!match) return;

  const currentTime = match[1];

  const percentage = timeStringToPercentage(currentTime, totalDuration);

  return percentage;
}

function timeStringToPercentage(
  time: string,
  totalDurationInSeconds: number
): number {
  const parts = time.split(':');
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  const milliseconds = parseFloat(parts[2]);

  const totalSeconds = minutes * 60 + seconds + milliseconds;

  console.log(totalSeconds, totalDurationInSeconds);

  return (totalSeconds / totalDurationInSeconds) * 100;
}

async function getMetadata(
  filePath: string,
  setMetadata: Dispatch<React.SetStateAction<any>>
) {
  const metadataCmd = [
    '-v',
    'quiet',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filePath
  ];

  const ffprobeSidecar = Command.sidecar('bin/ffprobe', metadataCmd);

  let metadata = '';

  ffprobeSidecar.stdout.on('data', (data) => {
    metadata += data;
  });

  ffprobeSidecar.on('close', (code) => {
    if (code.code === 0) {
      setMetadata(JSON.parse(metadata));
    } else {
      console.error(code);
    }
  });

  ffprobe = await ffprobeSidecar.spawn();
}
export { getVideoDuration, convertToGif, getMetadata };
