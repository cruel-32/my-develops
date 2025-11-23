'use client';
import { ProjectItem } from '@/web/features/projectItem';
import { CreateProjectButton } from '@/web/features/createProjectButton';
import {
  type ProjectList as ProjectListType,
  type Project,
} from '@/web/entities/project';

type ProjectListItem = ProjectListType['projects'][number];

export const ProjectList = () => {
  console.log('ProjectList');
  // const { data, isPending } = useGetProjects();
  const data = { projects: [] };
  const isPending = false;

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <CreateProjectButton />
      {isPending && <div>Loading...</div>}
      {!isPending &&
        data &&
        data.projects.length > 0 &&
        data.projects.map((project: ProjectListItem) => (
          <ProjectItem key={project.id} project={project} />
        ))}
    </div>
  );
};
