import { protectedProcedure, router } from '@/api/trpc';
import { uploadImageSchema } from './interfaces';
import { uploadImageController } from './controllers';

export const imagesRouter = router({
  upload: protectedProcedure
    .input(uploadImageSchema)
    .mutation(uploadImageController),
});
