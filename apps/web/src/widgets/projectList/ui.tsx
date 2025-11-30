import { ProjectItem } from '@/web/features/projectItem';
import { CreateProjectButton } from '@/web/features/createProjectButton';
import {
  type ProjectList as ProjectListType,
} from '@/web/entities/project';
import { useGetApiProjects, getApiProjects } from '@/web/shared/api';

type ProjectListItem = ProjectListType['projects'][number];

export const ProjectList = ({
  initialData,
}: {
  initialData: ProjectListType | null;
}) => {
  console.log('ProjectList');
  // const { data, isPending } = useGetProjects();
  const data = initialData || { projects: [] };
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
