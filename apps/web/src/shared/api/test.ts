import { usePutApiUsersUpdate } from '@repo/api/generated/hooks/usePutApiUsersUpdate';

// 랩핑 함수
export const usePutApiUsersUpdateWrapper = () => {
  const { mutate } = usePutApiUsersUpdate();
  return mutate;
};
