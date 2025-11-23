'use server';

import { revalidateTag, revalidatePath } from 'next/cache';

/**
 * 서버 캐시를 무효화하는 Server Action
 * 클라이언트에서 Mutation 성공 시 호출하여 서버 데이터(RSC)를 갱신합니다.
 */
export async function revalidateApi(
  tagOrPath: string,
  type: 'tag' | 'path' = 'tag'
) {
  if (type === 'tag') {
    revalidateTag(tagOrPath);
  } else {
    revalidatePath(tagOrPath);
  }
}
