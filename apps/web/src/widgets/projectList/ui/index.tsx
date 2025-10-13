'use client';

import { useProjectsQuery } from '../api';
import { ProjectItem } from '@/web/features/projectItem';

export const ProjectList = () => {
  const { projects, isLoading, error } = useProjectsQuery();

  if (isLoading) {
    // TODO: Replace with a proper skeleton loader
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  if (!projects || projects.length === 0) {
    return <div>No projects found.</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
};
