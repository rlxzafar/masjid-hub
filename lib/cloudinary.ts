import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadImage = async (file: File | Buffer, folder: string = 'masjids') => {
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    console.log(`Starting Cloudinary upload for file size: ${buffer.length} bytes`);
    return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                timeout: 120000 // Increase timeout to 120 seconds
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    return reject(error);
                }
                if (result) {
                    console.log('Cloudinary Upload Success:', result.public_id);
                    resolve(result);
                }
            }
        ).end(buffer);
    });
};

export const deleteImage = async (publicId: string) => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

export const getPublicIdFromUrl = (url: string) => {
    try {
        // Example URL: https://res.cloudinary.com/demo/image/upload/v1614028902/masjids/sample.jpg
        // We want: masjids/sample
        const parts = url.split('/');
        const filenameWithExtension = parts[parts.length - 1];
        const folder = parts[parts.length - 2]; // Assuming structure .../folder/filename.ext
        const filename = filenameWithExtension.split('.')[0];

        // Check if the URL is actually from Cloudinary
        if (!url.includes('cloudinary.com')) return null;

        // This is a simple extraction, might need adjustment based on exact URL structure
        // A more robust way is to look for the folder name if we know it, or just take the last segments

        // If we assume 'masjids' folder is always used:
        if (folder === 'masjids') {
            return `${folder}/${filename}`;
        }

        return filename;
    } catch (e) {
        return null;
    }
};
