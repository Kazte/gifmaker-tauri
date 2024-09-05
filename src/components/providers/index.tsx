import DialogProvider from "./dialog";
import { PropsWithChildren } from "react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "../ui/toaster";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <DialogProvider>
        <Toaster />
        {children}
      </DialogProvider>
    </ThemeProvider>
  );
}
