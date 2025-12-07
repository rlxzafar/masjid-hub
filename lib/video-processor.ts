import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Use environment variables for FFmpeg path
const FFMPEG_PATH = process.env.FFMPEG_PATH;
const FFPROBE_PATH = process.env.FFPROBE_PATH;

if (FFMPEG_PATH && fs.existsSync(FFMPEG_PATH)) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

if (FFPROBE_PATH && fs.existsSync(FFPROBE_PATH)) {
    ffmpeg.setFfprobePath(FFPROBE_PATH);
}

interface VideoDetails {
    title: string;
    speaker: string;
    date: string;
    masjidId?: string; // Opt-in for dynamic background
}

export const createVideoFromAudio = async (audioBuffer: Buffer, details: VideoDetails, onProgress?: (percent: number) => void): Promise<string> => {
    const tempDir = os.tmpdir();
    const audioPath = path.join(tempDir, `${uuidv4()}.mp3`);
    const videoPath = path.join(tempDir, `${uuidv4()}.mp4`);

    // Determine background image logic
    let bgImagePath = path.join(process.cwd(), 'public', 'images', 'khutba-bg.png'); // Default

    // If masjidId is provided, check if a specific background exists for it
    if (details.masjidId) {
        // Check for .png, .jpg, .jpeg
        const extensions = ['.png', '.jpg', '.jpeg'];
        for (const ext of extensions) {
            const possiblePath = path.join(process.cwd(), 'public', 'images', 'masjids', `${details.masjidId}${ext}`);
            if (fs.existsSync(possiblePath)) {
                bgImagePath = possiblePath;
                break;
            }
        }
    }

    // Write audio buffer to temp file
    await fs.promises.writeFile(audioPath, audioBuffer);

    // Fallback if the selected file doesn't exist
    const finalBgInput = fs.existsSync(bgImagePath) ? bgImagePath : 'color=c=#1e293b:s=1280x720';
    const isStaticFile = fs.existsSync(bgImagePath);

    return new Promise((resolve, reject) => {
        const formattedDate = details.date ? format(new Date(details.date), 'MMM d, yyyy') : '';
        const escapeText = (text: string) => text.replace(/:/g, '\\:').replace(/'/g, '');

        const line1 = escapeText("Khutba Juma");
        const line2 = escapeText(details.title);
        const line3 = escapeText(`by ${details.speaker}`);
        const line4 = escapeText(`on ${formattedDate}`);

        const ff = ffmpeg();

        if (isStaticFile) {
            ff.input(finalBgInput).inputOptions(['-loop 1']);
        } else {
            ff.input(finalBgInput).inputFormat('lavfi');
        }

        ff.input(audioPath)
            .complexFilter(
                `scale=1280:720,` +
                `drawbox=x=40:y=40:w=1200:h=640:color=black@0.6:t=fill,` +
                `drawtext=text='${line1}':fontcolor=#fbbf24:fontsize=50:x=(w-text_w)/2:y=(h-text_h)/2-140,` +
                `drawtext=text='${line2}':fontcolor=white:fontsize=70:x=(w-text_w)/2:y=(h-text_h)/2-50,` +
                `drawtext=text='${line3}':fontcolor=#9ca3af:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2+40,` +
                `drawtext=text='${line4}':fontcolor=#9ca3af:fontsize=30:x=(w-text_w)/2:y=(h-text_h)/2+90`
            )
            .outputOptions([
                '-c:v libx264',
                '-preset ultrafast', // Optimize for speed
                '-tune stillimage',
                '-c:a aac',
                '-b:a 128k', // Slightly lower bitrate for speech is fine and faster
                '-pix_fmt yuv420p',
                '-r 5', // 5fps is enough for static image, speeds up encoding massively
                '-shortest',
                '-threads 0'
            ])
            .on('start', (cmd) => console.log('FFmpeg spawned:', cmd))
            .on('progress', (progress) => {
                if (onProgress && progress.percent) {
                    onProgress(Math.round(progress.percent));
                }
            })
            .save(videoPath)
            .on('end', () => {
                // Cleanup audio only (bg image is permanent)
                fs.unlink(audioPath, () => { });
                resolve(videoPath);
            })
            .on('error', (err) => {
                console.error('FFmpeg Error:', err);
                if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                reject(err);
            });
    });
};

export const cleanupTempFile = async (filePath: string) => {
    try {
        if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
    } catch (e) {
        console.error(e);
    }
};
