import { db, images } from '@repo/db';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { s3 } from '../projects/s3'; // Re-using the s3 client from projects

export const uploadImage = async (
  fileName: string,
  filePath: string,
  fileType: string
) => {
  // 1. Generate a presigned URL
  const { url, fields } = await createPresignedPost(s3, {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `${filePath}/${fileName}`,
    Conditions: [
      ['content-length-range', 0, 10485760], // up to 10 MB
    ],
    Expires: 600, // 10 minutes
  });

  const finalUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${filePath}/${fileName}`;

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
    imgId: newImage.id,
  };
};

export const deleteImage = async (imgId: string) => {
  // 1. Get image record from DB
  const imageRecords = await db
    .select()
    .from(images)
    .where(eq(images.id, imgId))
    .limit(1);

  const imageRecord = imageRecords[0];

  if (!imageRecord) {
    throw new Error('Image not found.');
  }

  if (!imageRecord.imgUrl) {
    throw new Error('Image URL is missing.');
  }

  // 2. Extract S3 key from imgUrl
  // imgUrl format: http://localhost:9000/my-develops/projects/filename.jpg
  const urlParts = imageRecord.imgUrl.split('/');
  const bucketIndex = urlParts.findIndex((part) => part === process.env.S3_BUCKET_NAME);

  if (bucketIndex === -1 || bucketIndex === urlParts.length - 1) {
    throw new Error('Invalid image URL format.');
  }

  // Get everything after bucket name
  const key = urlParts.slice(bucketIndex + 1).join('/');

  // 3. Delete object from S3
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
  });

  await s3.send(deleteCommand);

  // 4. Delete record from DB
  await db.delete(images).where(eq(images.id, imgId));

  return { success: true };
};
