'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectInput,
} from '@repo/api/modules/projects/interfaces';
import { useRouter } from 'next/navigation';
import {
  useCreateProjectMutation,
  useUploadImageMutation,
} from '../api';

export const useCreateProjectForm = () => {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProjectMutation();
  const { mutateAsync: uploadImage } = useUploadImageMutation();

  const form = useForm<CreateProjectInput & { imageId?: string }>({ 
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      public: true,
    },
  });

  const handleImageUpload = async (file: File) => {
    try {
      // 1. Get presigned URL and imageId from backend
      const { presignedUrl, imageId } = await uploadImage({
        fileName: file.name,
        fileType: file.type,
      });

      // 2. Upload file to MinIO
      const formData = new FormData();
      Object.entries(presignedUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      await fetch(presignedUrl.url, {
        method: 'POST',
        body: formData,
      });

      // 3. Store the returned imageId in the form state
      form.setValue('imageId', imageId);

    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed.');
    }
  };

  const onSubmit = (data: CreateProjectInput) => {
    createProject(data, {
      onSuccess: () => {
        router.push('/dashboard');
      },
    });
  };

  return {
    form,
    onSubmit,
    handleImageUpload,
    isPending,
  };
};