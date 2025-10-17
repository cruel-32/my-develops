'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectForm } from './model';
import { type Project } from '@/web/entities/project';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  AspectRatio,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Checkbox,
  TrashIcon,
} from '@/web/shared/ui';

interface ProjectFormProps {
  initialData?: Project;
}

export const ProjectForm = ({ initialData }: ProjectFormProps) => {
  const router = useRouter();
  const { form, onSubmit, handleImageUpload, handleImageDelete, isPending } =
    useProjectForm(initialData);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.imgUrl || null
  );

  const isEditMode = !!initialData;

  const handleBack = () => {
    router.back();
  };

  return (
    <Form {...form}>
      <form
        id="project-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? 'Update Project' : 'Create Project'}
            </CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Update the details of your project.'
                : 'Fill out the form to create a new project.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A brief description of your project."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="cursor-pointer"
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">Public</FormLabel>
                    <FormDescription>
                      Make this project public so anyone can view it.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imgId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      placeholder="Upload a project image"
                      className="cursor-pointer"
                      disabled={isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const currentImgId = form.getValues('imgId');
                          handleImageUpload(file, currentImgId);
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setImagePreview(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {imagePreview && (
                    <AspectRatio
                      ratio={16 / 9}
                      className="flex justify-center items-center"
                    >
                      <img
                        src={imagePreview}
                        alt="Project Image"
                        className="h-auto"
                        width={150}
                        height={100}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 cursor-pointer"
                        aria-label="Delete Image"
                        onClick={async () => {
                          const currentImgId = form.getValues('imgId');
                          if (currentImgId) {
                            await handleImageDelete(currentImgId);
                          }
                          setImagePreview(null);
                        }}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </AspectRatio>
                  )}
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isPending}
              className="cursor-pointer"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="cursor-pointer"
              form="project-form"
            >
              {isPending
                ? isEditMode
                  ? 'Updating...'
                  : 'Creating...'
                : isEditMode
                  ? 'Update Project'
                  : 'Create Project'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};
