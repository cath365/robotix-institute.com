'use client';

import { Toaster } from 'react-hot-toast';

export function StyledToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(17, 11, 74, 0.95)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          padding: '14px 20px',
          fontSize: '14px',
          fontFamily: 'Inter, sans-serif',
        },
        success: {
          iconTheme: {
            primary: '#F4B400',
            secondary: '#0B0638',
          },
          style: {
            borderColor: 'rgba(244, 180, 0, 0.2)',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
          style: {
            borderColor: 'rgba(239, 68, 68, 0.2)',
          },
        },
      }}
    />
  );
}
