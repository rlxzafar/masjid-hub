import { NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const result = await uploadImage(file);

        return NextResponse.json({ url: result.secure_url });
    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
