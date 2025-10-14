'use client';

import Link from 'next/link';
import { ProjectCardView, type Project } from '@/web/entities/project';
import { useProjectItem } from './model/hook';
import { Button, Trash2 } from '@/web/shared/ui';

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem = ({ project }: ProjectItemProps) => {
  const { handleDelete, isPending } = useProjectItem(project.id);

  return (
    <div className="relative group">
      <Link href={`/dashboard/${project.id}`}>
        <ProjectCardView project={project} />
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            handleDelete();
          }}
          disabled={isPending}
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
