import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme-provider';

export default function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='theme'>
      {children}
    </ThemeProvider>
  );
}
