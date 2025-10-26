'use client';
import { ProjectItem } from '@/web/features/projectItem';
import { CreateProjectButton } from '@/web/features/createProjectButton';
// TODO: Implement useProjectsQuery using fetch + React Query
import { useGetProjects } from '@/web/entities/project';

export const ProjectList = () => {
  const { data, isPending } = useGetProjects();
  // const isPending = false;
  // const data = {
  //   projects: [],
  // };

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <CreateProjectButton />
      {isPending && <div>Loading...</div>}
      {!isPending &&
        data &&
        data.projects.length > 0 &&
        data.projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
    </div>
  );
};
