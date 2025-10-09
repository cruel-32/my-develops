'use client';
import NextNProgress from 'nextjs-progressbar';

export const NextProgress = () => {
  return (
    <NextNProgress
      color="var(--color-primary)"
      height={3}
      options={{ showSpinner: false }}
    />
  );
};
