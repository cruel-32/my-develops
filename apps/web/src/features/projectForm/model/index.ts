'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectInput,
  updateProjectSchema,
  UpdateProjectInput,
} from '@repo/api/modules/projects/interfaces';
import { useRouter } from 'next/navigation';
import { type Project } from '@/web/entities/project';
import { toast } from '@/web/shared/ui';
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useCreatePresignedUrlMutation,
  useDeleteImageMutation,
} from '../api';

export const useProjectForm = (initialData?: Project) => {
  const router = useRouter();
  const { mutate: createProject, isPending: isCreating } =
    useCreateProjectMutation();
  const { mutate: updateProject, isPending: isUpdating } =
    useUpdateProjectMutation();
  const { mutateAsync: uploadImage } = useCreatePresignedUrlMutation();
  const { mutateAsync: deleteImage } = useDeleteImageMutation();

  const isEditMode = !!initialData;

  const form = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(
      isEditMode ? updateProjectSchema : createProjectSchema
    ),
    defaultValues: initialData || {
      name: '',
      description: '',
      public: true,
    },
  });

  const handleImageUpload = async (file: File, currentImgId?: string) => {
    try {
      // Delete existing image from S3 and DB if there is one
      if (currentImgId) {
        try {
          await deleteImage({ imgId: currentImgId });
        } catch (error) {
          console.error('Failed to delete previous image:', error);
          // Continue with upload even if delete fails
        }
      }

      // Upload new image
      const { presignedUrl, imgId } = await uploadImage({
        fileName: file.name,
        filePath: 'projects',
        fileType: file.type,
      });

      const formData = new FormData();
      Object.entries(presignedUrl.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      await fetch(presignedUrl.url, {
        method: 'POST',
        body: formData,
      });

      form.setValue('imgId', imgId);
    } catch (error) {
      console.error('Image upload failed:', error);
      toast.error('Image upload failed.');
    }
  };

  const handleImageDelete = async (imgId: string) => {
    try {
      await deleteImage({ imgId });
      form.setValue('imgId', undefined);
    } catch (error) {
      console.error('Failed to delete image:', error);
      toast.error('Failed to delete image.');
    }
  };

  const onSubmit = (data: CreateProjectInput | UpdateProjectInput) => {
    if (isEditMode) {
      updateProject(data as UpdateProjectInput, {
        onSuccess: async () => {
          router.push('/dashboard');
        },
      });
    } else {
      createProject(data as CreateProjectInput, {
        onSuccess: async () => {
          router.push('/dashboard');
        },
      });
    }
  };

  return {
    form,
    onSubmit,
    handleImageUpload,
    handleImageDelete,
    isPending: isCreating || isUpdating,
  };
};
