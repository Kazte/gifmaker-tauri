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
import { useAppStore } from "@/store/app.store";
import { useDialog } from ".";

export default function ProgressDialog() {
  const { hideDialog } = useDialog();
  const appStore = useAppStore((store) => store);

  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converting to Gif</DialogTitle>
          <DialogDescription>
            Please wait while we convert the video to a gif.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Progress value={appStore.progress} />
        </div>
        {appStore.progress >= 100 && (
          <DialogFooter>
            <Button onClick={hideDialog}>Close</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
