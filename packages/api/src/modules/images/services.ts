import { db, images } from '@repo/db';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3 } from '../projects/s3'; // Re-using the s3 client from projects

export const uploadImage = async (fileName: string, fileType: string) => {
  // 1. Generate a presigned URL
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Conditions: [
      ['content-length-range', 0, 10485760], // up to 10 MB
    ],
    Expires: 600, // 10 minutes
  });

  const finalUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;

  // 2. Insert a record into the images table
  const newImageArr = await db
    .insert(images)
    .values({
      imgUrl: finalUrl,
    })
    .returning();

  const newImage = newImageArr[0];

  if (!newImage) {
    throw new Error('Failed to create image record.');
  }

  // 3. Return both the presigned URL data and the new image ID
  return {
    presignedUrl: { url, fields },
    imageId: newImage.id,
  };
};
