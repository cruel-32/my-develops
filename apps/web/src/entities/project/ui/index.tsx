'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Lock,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/web/shared/ui';
import { type Project } from '../model/schema';

interface ProjectItemProps {
  project: Project;
}

const DefaultProjectImage = () => (
  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
    <span className="text-gray-500">No Image</span>
  </div>
);

export const ProjectItem = ({ project }: ProjectItemProps) => {
  const { id, name, description, imageUrl, public: isPublic } = project;
  const router = useRouter();

  const handleClick = () => {
    router.push(`/dashboard/${id}`);
  };

  return (
    <Card className="overflow-hidden cursor-pointer" onClick={handleClick}>
      <CardHeader className="p-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${name} project image`}
            width={400}
            height={192}
            className="w-full h-48 object-cover"
          />
        ) : (
          <DefaultProjectImage />
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{name}</CardTitle>
          {isPublic ? (
            <Globe className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>
        <CardDescription className="mt-2 text-sm text-gray-600 truncate">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};
