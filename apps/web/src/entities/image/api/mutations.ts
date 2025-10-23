'use client';

import { clientTrpc } from '@/web/shared/api';

export const useCreatePresignedUrlMutation = () => {
  return clientTrpc.images.upload.useMutation({
    onError: (error) => {
      console.error('Failed to create presigned url:', error);
    },
  });
};

export const useDeleteImageMutation = () => {
  return clientTrpc.images.delete.useMutation({
    onError: (error) => {
      console.error('Failed to delete image:', error);
    },
  });
};
