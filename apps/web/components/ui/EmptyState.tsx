import React from 'react';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Results',
  message,
  icon,
  action,
}) => {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-12'>
      {icon && <div className='text-muted mb-4 text-4xl'>{icon}</div>}
      <h3 className='text-foreground mb-2 text-lg font-semibold'>{title}</h3>
      <p className='text-muted mb-6 max-w-sm text-center'>{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className='bg-primary hover:bg-primary-hover rounded-lg px-4 py-2 text-white transition-colors'
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
