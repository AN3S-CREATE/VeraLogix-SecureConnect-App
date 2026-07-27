import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Env } from '../config/env.js';

export function createS3Client(env: Env) {
  return new S3Client({
    endpoint: `http${env.MINIO_USE_SSL ? 's' : ''}://${env.MINIO_ENDPOINT}:${env.MINIO_PORT}`,
    region: 'us-east-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.MINIO_ACCESS_KEY,
      secretAccessKey: env.MINIO_SECRET_KEY,
    },
  });
}

export async function ensureBucket(env: Env, client: S3Client): Promise<void> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: env.MINIO_BUCKET }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: env.MINIO_BUCKET }));
  }
}

export async function presignUpload(
  env: Env,
  client: S3Client,
  key: string,
  contentType: string,
  expiresIn = 900,
): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

export async function presignDownload(
  env: Env,
  client: S3Client,
  key: string,
  expiresIn = 900,
): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: env.MINIO_BUCKET,
    Key: key,
  });
  return getSignedUrl(client, cmd, { expiresIn });
}

export async function deleteObject(env: Env, client: S3Client, key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: env.MINIO_BUCKET, Key: key }));
}

export async function putObject(
  env: Env,
  client: S3Client,
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
): Promise<void> {
  await client.send(
    new PutObjectCommand({
      Bucket: env.MINIO_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

