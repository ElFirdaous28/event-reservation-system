import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const spinner = (
    <div className={`${sizeClasses[size]} animate-spin`}>
      <div className='border-border border-t-primary h-full w-full rounded-full border-4' />
    </div>
  );

  if (fullScreen) {
    return <div className='flex min-h-screen items-center justify-center'>{spinner}</div>;
  }

  return <div className='flex items-center justify-center'>{spinner}</div>;
};
