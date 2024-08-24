import {
  Database,
  Pause,
  Play,
  RefreshCcwDot,
  Repeat1,
  Repeat2,
  X
} from 'lucide-react';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { convertToGif, getMetadata, getVideoDuration } from './lib/ffmpeg';
import { open, save } from '@tauri-apps/plugin-dialog';
import { useEffect, useRef, useState } from 'react';

import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Switch } from 'ktools-r';
import { ToastAction } from './components/ui/toast';
import { Toaster } from './components/ui/toaster';
import { cn } from './lib/utils';
import { platform } from '@tauri-apps/plugin-os';
import { useToast } from './components/ui/use-toast';

type VideoControlsProps = {
  pause: boolean;
  duration: number;
  currentTime: number;
  loop?: boolean;
};

function App() {
  const [file, setFile] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [metaData, setMetaData] = useState<any | null>(null);
  const [pause, setPause] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reqRef = useRef<number | null>(null);
  const { toast } = useToast();
  const [videoControls, setVideoControls] = useState<VideoControlsProps>({
    pause: true,
    duration: 0,
    currentTime: 0,
    loop: false
  });

  const handleDragOver = (event: any) => {
    event.preventDefault();
  };

  const handleDrop = async (event: any) => {
    event.preventDefault();
    console.log(event);
  };

  const handleOnClick = async () => {
    const file = await open({
      multiple: false,
      directory: false,
      filters: [{ name: 'Videos', extensions: ['mp4', 'webm', 'ogg'] }]
    });

    if (file) {
      setFile(file.path);
      const duration = await getVideoDuration(file.path);

      await getMetadata(file.path, setMetaData);

      setVideoControls((prev) => ({
        ...prev,
        duration: duration
      }));
    }
  };

  useEffect(() => {
    console.log('metadata', metaData);
  }, [metaData]);

  useEffect(() => {
    const video = videoRef.current;

    const updateTime = () => {
      setVideoControls((prev) => ({
        ...prev,
        currentTime: video!.currentTime
      }));

      reqRef.current = requestAnimationFrame(updateTime);
    };

    if (video) {
      reqRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      cancelAnimationFrame(reqRef.current!);
    };
  }, []);

  return (
    <>
      <Toaster />
      <main className={cn('w-screen h-screen grid place-items-center')}>
        <Switch>
          <Switch.Case condition={file !== null && metaData !== null}>
            <section className='w-full'>
              <h2 className='text-xl mt-2 text-center'>
                {file?.split('/').pop()}
              </h2>
              <section className='gap-4 p-4 h-3/4 w-3/4 mx-auto flex flex-col justify-center items-start select-none self-center'>
                <video
                  src={convertFileSrc(file!)}
                  className={cn(
                    metaData
                      ? metaData.streams[0].width > metaData.streams[0].height
                        ? 'w-full'
                        : 'h-full max-h-[300px]'
                      : '',
                    'self-center'
                  )}
                  ref={videoRef}
                  onPlay={() => {
                    setVideoControls((prev) => ({
                      ...prev,
                      pause: false
                    }));
                  }}
                  onPause={() => {
                    setVideoControls((prev) => ({
                      ...prev,
                      pause: true
                    }));
                  }}
                  onTimeUpdate={() => {
                    setVideoControls((prev) => ({
                      ...prev,
                      currentTime: videoRef.current!.currentTime
                    }));
                  }}
                  loop={videoControls.loop}
                />
                {loading && <Progress value={progress} className='w-full' />}
                {/* <Progress value={progress} className='w-full' /> */}

                <div className='flex justify-center items-center space-x-4 w-full'>
                  <Button
                    disabled={loading}
                    size='icon'
                    onClick={() => {
                      setVideoControls((prev) => {
                        if (prev.pause) {
                          videoRef.current?.play();
                        } else {
                          videoRef.current?.pause();
                        }

                        return {
                          ...prev,
                          pause: !prev.pause
                        };
                      });
                    }}
                  >
                    {videoControls.pause ? <Play /> : <Pause />}
                  </Button>
                  <Button
                    size='icon'
                    disabled={loading}
                    onClick={() => {
                      setVideoControls({
                        ...videoControls,
                        loop: !videoControls.loop
                      });
                    }}
                  >
                    {videoControls.loop ? <Repeat2 /> : <Repeat1 />}
                  </Button>
                </div>
                <div className='w-full h-9 bg-foreground cursor-ew-resize'>
                  <div
                    className='h-full bg-accent w-[4px] relative'
                    style={{
                      left: `${
                        (videoControls.currentTime / videoControls.duration) *
                        100
                      }%`
                    }}
                  />
                  <p>
                    {videoControls.currentTime.toFixed(2)} /
                    {videoControls.duration.toFixed(2)}
                  </p>
                </div>
                <div className='flex justify-end items-center space-x-4  w-full'>
                  <Button
                    size='sm'
                    onClick={() => setFile(null)}
                    disabled={loading}
                    variant='destructive'
                  >
                    <X className='size-5 mr-2' />
                    Remove file
                  </Button>
                  <Button
                    disabled={loading}
                    size='sm'
                    onClick={async () => {
                      await getMetadata(file!, setMetaData);
                    }}
                  >
                    <Database className='mr-2' />
                    Get Metadata
                  </Button>
                  <Button
                    disabled={loading}
                    size='sm'
                    onClick={async () => {
                      setProgress(0);
                      const path = await save({
                        canCreateDirectories: true,
                        defaultPath: `${file!.split('.')[0]}.gif`,
                        filters: [{ name: 'GIF', extensions: ['gif'] }],
                        title: 'Save GIF'
                      });

                      if (path) {
                        await convertToGif(
                          file!,
                          path,
                          setLoading,
                          setProgress,
                          () => {
                            toast({
                              title: 'Conversion completed',
                              description:
                                'The video was successfully converted to GIF',
                              action: (
                                <ToastAction
                                  altText='Open'
                                  onClick={async () => {
                                    await invoke('open_directory', {
                                      path: path,
                                      osType: platform()
                                    });
                                  }}
                                >
                                  Open folder
                                </ToastAction>
                              )
                            });
                          },
                          (error) => {
                            toast({
                              title: 'Conversion failed',
                              description: error.message,
                              variant: 'destructive'
                            });
                          }
                        );
                      }
                    }}
                  >
                    <RefreshCcwDot className='mr-2' />
                    Convert to GIF
                  </Button>
                </div>
              </section>
            </section>
          </Switch.Case>
          <Switch.Default>
            <section
              className='flex-grow border-[3px] border-dashed border-foreground/20 hover:border-foreground/80 h-3/4 w-3/4 mx-auto flex flex-col justify-center items-center select-none cursor-pointer'
              onClick={handleOnClick}
            >
              <h3 className='text-2xl'>Drag and drop a file here</h3>
            </section>
          </Switch.Default>
        </Switch>
      </main>
    </>
  );
}

export default App;
