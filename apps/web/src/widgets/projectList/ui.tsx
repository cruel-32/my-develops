'use client';

import { useProjectsQuery } from './api';
import { ProjectItem } from '@/web/features/projectItem';
import { CreateProjectButton } from '@/web/features/createProjectButton';

export const ProjectList = () => {
  const { projects, isPending, error } = useProjectsQuery();

  if (isPending) {
    // TODO: Replace with a proper skeleton loader
    return <div>Loading projects...</div>;
  }

  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-6">
      <CreateProjectButton />
      {projects &&
        projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))}
    </div>
  );
};

// 'server component'
// import { serverTrpc } from '@/web/shared/api/server-trpc';
// import { ProjectItem } from '@/web/features/projectItem';
// import { CreateProjectButton } from '@/web/features/createProjectButton';

// export const ProjectList = async () => {
//   // tags 옵션 추가 - 캐시 무효화 시 사용
//   const projects = await serverTrpc.projects.list(undefined, {
//     tags: ['projects'], // for cache invalidation
//   });

//   return (
//     <div className="flex flex-wrap justify-center items-center gap-6">
//       <CreateProjectButton />
//       {projects &&
//         projects.map((project) => (
//           <ProjectItem key={project.id} project={project} />
//         ))}
//     </div>
//   );
// };
