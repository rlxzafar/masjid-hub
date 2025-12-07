import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Use environment variables for FFmpeg path
const FFMPEG_PATH = process.env.FFMPEG_PATH;
if (FFMPEG_PATH && fs.existsSync(FFMPEG_PATH)) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

export const generateMasjidBackground = async (masjidId: string): Promise<string> => {
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'masjids');
    const baseImage = path.join(process.cwd(), 'public', 'images', 'khutba-bg.png');
    const outputImage = path.join(imagesDir, `${masjidId}.png`);

    // Ensure directory exists
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
    }

    // Determine if we have a base image to work with
    const input = fs.existsSync(baseImage) ? baseImage : 'color=c=blue:s=1280x720';
    const isStatic = fs.existsSync(baseImage);

    // Filter strategy: Shift hue randomly
    const hueShift = Math.floor(Math.random() * 360);

    // Create a simple temp background image (1x1 pixel black JPG) if base missing
    const tempBgPath = path.join(os.tmpdir(), `${masjidId}_temp_bg.jpg`);
    if (!isStatic) {
        const base64Image = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
        fs.writeFileSync(tempBgPath, Buffer.from(base64Image, 'base64'));
    }

    return new Promise((resolve, reject) => {
        const ff = ffmpeg();

        const inputSource = isStatic ? input : tempBgPath;

        ff.input(inputSource);

        if (isStatic) {
            ff.inputOptions(['-loop 1']);
        }

        ff.frames(1)
            .complexFilter(
                `scale=1280:720,hue=h=${hueShift},eq=saturation=1.2:contrast=1.1`
            )
            .output(outputImage)
            .on('end', () => {
                console.log(`Generated background for masjid ${masjidId}`);
                if (!isStatic && fs.existsSync(tempBgPath)) fs.unlinkSync(tempBgPath);
                resolve(outputImage);
            })
            .on('error', (err) => {
                console.error('Error generating background:', err);
                if (!isStatic && fs.existsSync(tempBgPath)) fs.unlinkSync(tempBgPath);
                resolve('');
            })
            .run();
    });
};
