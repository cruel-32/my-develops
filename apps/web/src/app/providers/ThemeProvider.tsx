'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export default function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  console.log('ThemeProvider ::::::: ');
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
