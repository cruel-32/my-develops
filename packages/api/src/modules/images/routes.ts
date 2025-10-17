import { protectedProcedure, router } from '@/api/trpc';
import { uploadImageSchema, deleteImageSchema } from './interfaces';
import { uploadImageController, deleteImageController } from './controllers';

export const imagesRouter = router({
  upload: protectedProcedure
    .input(uploadImageSchema)
    .mutation(uploadImageController),
  delete: protectedProcedure
    .input(deleteImageSchema)
    .mutation(deleteImageController),
});
