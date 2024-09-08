import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { useDialog } from ".";
import { useState } from "react";

export default function UpdateDialog() {
  const { hideDialog } = useDialog();
  const [progress, setProgress] = useState(0);

  const handleUpdate = async () => {
    const update = await check();

    if (update?.available) {
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            contentLength = event.data.contentLength!;
            console.log(
              `started downloading ${event.data.contentLength} bytes`,
            );
            break;
          case "Progress":
            downloaded += event.data.chunkLength;
            setProgress((downloaded / contentLength) * 100);
            break;
          case "Finished":
            console.log("download finished");
            break;
        }
      });

      console.log("update installed");
      await relaunch();
    }
  };

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New version available</DialogTitle>
          <DialogDescription>
            A new version of the app is available. Do you want to update?
          </DialogDescription>
        </DialogHeader>
        <div>
          {progress > 0 && (
            <p>
              Downloading update: {progress.toFixed(2)}%
              <Progress value={progress} />
            </p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} variant="success">
            Update
          </Button>
          <Button onClick={hideDialog} variant="destructive">
            Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
