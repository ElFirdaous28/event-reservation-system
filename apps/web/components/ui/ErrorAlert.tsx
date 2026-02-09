import React from 'react';
import { X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      className={`border-error/30 mb-4 rounded-lg border p-4 ${className}`}
      style={{
        backgroundColor: 'color-mix(in srgb, var(--error) 10%, transparent)',
      }}
    >
      <div className='flex'>
        <div className='shrink-0'>
          <svg
            className='h-5 w-5'
            viewBox='0 0 20 20'
            fill='currentColor'
            style={{ color: 'var(--error)' }}
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium' style={{ color: 'var(--error)' }}>
            {title}
          </h3>
          <p className='mt-1 text-sm' style={{ color: 'var(--error)', opacity: 0.8 }}>
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className='ml-auto transition-colors'
            style={{ color: 'var(--error)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            aria-label='Dismiss'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>
    </div>
  );
};
