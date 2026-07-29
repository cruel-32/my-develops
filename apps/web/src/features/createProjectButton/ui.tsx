'use client';

import React from 'react';
import { Card, Plus } from '@/web/shared/ui';
import { useRouter } from 'next/navigation';

export const CreateProjectButton = () => {
  const router = useRouter();
  const handleClick = () => {
    // TODO: Implement navigation to create project page or open a modal
    router.push('/project/create');
  };

  return React.createElement(
    'div',
    { className: 'relative group' },
    React.createElement(
      Card,
      {
        className:
          'flex min-w-[300px] min-h-[288px] p-4 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100',
        onClick: handleClick,
      },
      React.createElement(
        'div',
        { className: 'flex flex-col items-center gap-2 text-gray-500' },
        React.createElement(Plus, { className: 'h-8 w-8' }),
        React.createElement(
          'span',
          { className: 'font-semibold' },
          'Create New Project'
        )
      )
    )
  );
};
