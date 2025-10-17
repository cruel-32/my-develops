'use client';

import { ProjectForm } from '@/web/features/projectForm';
import { useGetProjectQuery } from './api';
import { useParams } from 'next/navigation';

export const UpdateProjectPage = () => {
  const params = useParams();
  const projectId = Number(params?.projectId);

  const { data: project, isLoading } = useGetProjectQuery(projectId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }
  return (
    <>
      <ProjectForm initialData={project} />
    </>
  );
};
