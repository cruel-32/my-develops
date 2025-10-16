'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createProjectSchema,
  CreateProjectInput,
} from '@repo/api/modules/projects/interfaces';
import { useRouter } from 'next/navigation';
import { useCreateProjectMutation } from '../api';

export const useCreateProjectForm = () => {
  const router = useRouter();
  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      public: true,
      imageUrl: '',
    },
  });

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
    isPending,
  };
};
