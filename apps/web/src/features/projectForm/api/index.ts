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
  return clientTrpc.images.upload.useMutation({
    onSuccess: () => {},
    onError: (error) => {
      console.error('Failed to create presigned url:', error);
      alert(`Failed to create presigned url: ${error.message}`);
    },
  });
};

export const useDeleteImageMutation = () => {
  return clientTrpc.images.delete.useMutation({
    onError: (error) => {
      console.error('Failed to delete image:', error);
      alert(`Failed to delete image: ${error.message}`);
    },
  });
};

export const useUpdateProjectMutation = () => {
  const utils = clientTrpc.useUtils();

  return clientTrpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      alert('Project updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update project:', error);
      alert(`Failed to update project: ${error.message}`);
    },
  });
};
