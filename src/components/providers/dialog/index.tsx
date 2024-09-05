import { ReactNode, createContext, useContext, useState } from "react";

import ProgressDialog from "./progress-dialog";

export enum DialogType {
  PROGRESS = "PROGRESS",
}

export type DialogContextType = {
  showDialog: (dialog: DialogType) => void;
  hideDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function useDialog() {
  const context = useContext(DialogContext);

  if (!context)
    throw new Error("useDialog must be used within a DialogProvider");

  return context;
}

type DialogProviderProps = {
  children: ReactNode;
};

const dialogs: Record<DialogType, ReactNode> = {
  [DialogType.PROGRESS]: <ProgressDialog />,
};

function getDialogComponent(dialog: DialogType): ReactNode {
  return dialogs[dialog];
}

export default function DialogProvider({ children }: DialogProviderProps) {
  const [activeDialog, setActiveDialog] = useState<ReactNode | null>(null);

  const showDialog = (dialog: DialogType) => {
    console.log("showDialog", dialog);

    setActiveDialog(getDialogComponent(dialog));
  };

  const hideDialog = () => {
    setActiveDialog(null);
  };

  return (
    <DialogContext.Provider value={{ showDialog, hideDialog }}>
      {children}
      {activeDialog}
    </DialogContext.Provider>
  );
}
