'use client';
import { ProjectItem } from '@/web/features/projectItem';
import { CreateProjectButton } from '@/web/features/createProjectButton';
// TODO: Implement useProjectsQuery using fetch + React Query
// import { useProjectsQuery } from '@/web/entities/project/api/queries';

export const ProjectList = () => {
  // TODO: Replace with fetch + React Query hook
  // const { data: projects } = useProjectsQuery();
  const projects: any[] = [];

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <CreateProjectButton />
      {projects && projects.length > 0 ? (
        projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))
      ) : (
        <div className="text-gray-500">No projects found</div>
      )}
    </div>
  );
};
