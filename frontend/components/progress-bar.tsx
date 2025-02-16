import { useNProgress } from '@tanem/react-nprogress';
import React from 'react';

export const Progress = ({ isAnimating, animationDuration }: any) => {
  const { isFinished, progress } = useNProgress({
    animationDuration,
    isAnimating,
  });

  return (
    <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
      <div
        className="bg-primary h-full rounded-full transition-all"
        style={{ width: `${progress * 100}%` }}
      ></div>
    </div>
  );
};
