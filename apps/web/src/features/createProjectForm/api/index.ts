'use client';

import { clientTrpc } from '@/web/shared/api';

export const useCreateProjectMutation = () => {
  const utils = clientTrpc.useUtils();

  return clientTrpc.projects.create.useMutation({
    onSuccess: () => {
      // On successful creation, invalidate the projects list to refetch
      utils.projects.list.invalidate();
      alert('Project created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create project:', error);
      alert(`Failed to create project: ${error.message}`);
    },
  });
};

export const useCreatePresignedUrlMutation = () => {
  return clientTrpc.projects.createPresignedUrl.useMutation({
    onError: (error) => {
      console.error('Failed to create presigned url:', error);
      alert(`Failed to create presigned url: ${error.message}`);
    },
  });
};

export const useUploadImageMutation = () => {
  return clientTrpc.images.upload.useMutation({
    onError: (error) => {
      console.error('Failed to upload image:', error);
      alert(`Failed to upload image: ${error.message}`);
    },
  });
};
