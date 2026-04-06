import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});

export class StorageService {
    static async uploadFile(filePath: string, folder: string = 'telemedicine') {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'auto',
        });
        return { url: result.secure_url, publicId: result.public_id };
    }

    static async uploadBuffer(buffer: Buffer, folder: string = 'telemedicine', format: string = 'pdf') {
        return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'auto', format },
                (error, result) => {
                    if (error || !result) return reject(error || new Error('Upload failed'));
                    resolve({ url: result.secure_url, publicId: result.public_id });
                }
            );
            stream.end(buffer);
        });
    }

    static async deleteFile(publicId: string) {
        await cloudinary.uploader.destroy(publicId);
    }
}
