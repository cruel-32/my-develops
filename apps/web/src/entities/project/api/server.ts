import { getApiProjectsId } from '@repo/api/hooks';

export async function getProjectById(id: number) {
  try {
    const project = await getApiProjectsId(id);
    return project;
  } catch (error) {
    console.error(`Failed to fetch project ${id}:`, error);
    return null;
  }
}
