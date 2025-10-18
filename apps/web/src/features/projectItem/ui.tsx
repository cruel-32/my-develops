'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProjectCardView, type Project } from '@/web/entities/project';
import { useProjectItem } from './model/hook';
import {
  Button,
  Trash2,
  Pencil,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/web/shared/ui';
import { useRouter } from 'next/navigation';

interface ProjectItemProps {
  project: Project;
}

export const ProjectItem = ({ project }: ProjectItemProps) => {
  const { handleDelete, isPending } = useProjectItem(project.id);
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleUpdate = () => {
    router.push(`/dashboard/${project.id}/edit`);
  };

  const confirmDelete = () => {
    handleDelete();
    setShowDeleteDialog(false);
  };

  return (
    <div className="relative group">
      <Link href={`/dashboard/${project.id}`}>
        <ProjectCardView project={project} />
      </Link>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* 수정버튼 추가 */}
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer text-blue-500 hover:text-blue-600 bg-white opacity-0 group-hover:opacity-50 transition-opacity mr-1"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            handleUpdate();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer text-red-500 hover:text-red-600 bg-white opacity-0 group-hover:opacity-50 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click event
            setShowDeleteDialog(true);
          }}
          disabled={isPending}
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
