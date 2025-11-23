import { getApiProjectsId } from '@repo/api/hooks';
import { getServerApiConfig } from '@/web/shared/api/server';

export async function getProjectById(id: number) {
  try {
    const config = await getServerApiConfig();
    const project = await getApiProjectsId(id, config);
    return project;
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return null;
  }
}
