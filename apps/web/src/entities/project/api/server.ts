import {
  CreateProjectInput,
  UpdateProjectInput,
} from '@/api/modules/projects/interfaces';
import { createServerClient } from '@/web/shared/api/server-trpc';
import type { CacheOptions } from '@/web/shared/api/server-trpc';

/**
 * 프로젝트 목록 조회 (서버 컴포넌트용)
 */
export const getProjects = async (options?: CacheOptions) => {
  const trpc = await createServerClient(options);
  return trpc.projects.list.query();
};

/**
 * 특정 프로젝트 상세 조회 (서버 컴포넌트용)
 */
export const getProjectById = async (id: number, options?: CacheOptions) => {
  const trpc = await createServerClient(options);
  return trpc.projects.get.query({ id });
};

/**
 * 프로젝트 삭제 (서버 컴포넌트용)
 */
export const deleteProject = async (id: number) => {
  const trpc = await createServerClient();
  return trpc.projects.delete.mutate({ id });
};

/**
 * 프로젝트 업데이트 (서버 컴포넌트용)
 */
export const updateProject = async (input: UpdateProjectInput) => {
  const trpc = await createServerClient();
  return trpc.projects.update.mutate(input);
};

export const createProject = async (input: CreateProjectInput) => {
  const trpc = await createServerClient();
  return trpc.projects.create.mutate(input);
};
