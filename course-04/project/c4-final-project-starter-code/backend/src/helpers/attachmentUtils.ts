import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
    constructor(
        private readonly myS3 = new XAWS.S3({ signatureVersion: 'v4' })) {
    }

    // function to generate a signed URL for uploading image to my S3 bucket
    generateSignedUrl(todoId: string): string {
        const signedUrl = this.myS3.getSignedUrl('putObject', {
            // URL generated using our bucket, todoId and experiation time
            Bucket: process.env.ATTACHMENT_S3_BUCKET,
            Key: todoId,
            Expires: Number(process.env.SIGNED_URL_EXPIRATION)
        });

        return signedUrl as string;
    }
}