import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Speech } from '@/types';
import { createVideoFromAudio, cleanupTempFile } from '@/lib/video-processor';
import { uploadVideo, deleteVideo, updateVideoMetadata } from '@/lib/youtube';

const speechesFilePath = path.join(process.cwd(), 'data', 'speeches.json');
const masjidsFilePath = path.join(process.cwd(), 'data', 'masjids.json');

const ensureFile = () => {
    const dir = path.dirname(speechesFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(speechesFilePath)) {
        fs.writeFileSync(speechesFilePath, '[]', 'utf8');
    }
};

export async function GET(request: Request) {
    try {
        ensureFile();
        const { searchParams } = new URL(request.url);
        const masjidId = searchParams.get('masjidId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const fileData = fs.readFileSync(speechesFilePath, 'utf8');
        let speeches: Speech[] = JSON.parse(fileData);

        // Filter by Masjid
        if (masjidId) {
            speeches = speeches.filter(s => s.masjidId === masjidId);
        }

        // Filter by Search (Title or Speaker)
        if (search) {
            const lowerSearch = search.toLowerCase();
            speeches = speeches.filter(s =>
                s.title.toLowerCase().includes(lowerSearch) ||
                s.speaker.toLowerCase().includes(lowerSearch)
            );
        }

        // Filter by Date Range
        if (startDate) {
            speeches = speeches.filter(s => s.datetime >= startDate);
        }
        if (endDate) {
            // Add time to end date to make it inclusive of the whole day
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999);
            const endIso = endDateTime.toISOString();
            speeches = speeches.filter(s => s.datetime <= endIso);
        }

        // Sort by Date (Newest First)
        speeches.sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());

        // Pagination
        const total = speeches.length;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedSpeeches = speeches.slice(startIndex, endIndex);
        const hasMore = endIndex < total;

        return NextResponse.json({
            speeches: paginatedSpeeches,
            pagination: {
                page,
                limit,
                total,
                hasMore
            }
        });
    } catch (error) {
        console.error('Error reading speeches:', error);
        return NextResponse.json({ error: 'Failed to fetch speeches' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const encoder = new TextEncoder();

    // Create a TransformStream for the response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start processing in the background (but connected to the stream)
    (async () => {
        try {
            const formData = await request.formData();

            const masjidId = formData.get('masjidId') as string;
            const title = formData.get('title') as string;
            const speaker = formData.get('speaker') as string;
            const datetime = formData.get('datetime') as string;
            const description = formData.get('description') as string || '';
            const manuallyProvidedUrl = formData.get('youtubeUrl') as string;
            const audioFile = formData.get('file') as File | null;

            if (!masjidId) throw new Error('Masjid ID is required');
            if (!title) throw new Error('Title is required');
            if (!speaker) throw new Error('Speaker is required');
            if (!datetime) throw new Error('Date and time are required');

            let finalYoutubeUrl = manuallyProvidedUrl;

            // Check if Masjid is disabled
            if (fs.existsSync(masjidsFilePath)) {
                const masjidsData = fs.readFileSync(masjidsFilePath, 'utf8');
                const masjids = JSON.parse(masjidsData);
                const masjid = masjids.find((m: any) => m.id === masjidId);

                if (masjid && masjid.isDisabled) {
                    throw new Error('Your masjid account has been disabled. Please contact admin support.');
                }
            }

            // Handle Audio Upload
            if (audioFile) {
                const buffer = Buffer.from(await audioFile.arrayBuffer());

                // 1. Process Audio to Video
                await writer.write(encoder.encode(JSON.stringify({ type: 'progress', stage: 'encoding', percent: 0 }) + '\n'));

                const videoPath = await createVideoFromAudio(buffer, {
                    title,
                    speaker,
                    date: datetime,
                    masjidId
                }, (percent) => {
                    // Send encoding progress
                    writer.write(encoder.encode(JSON.stringify({ type: 'progress', stage: 'encoding', percent }) + '\n'));
                });

                // 2. Upload to YouTube
                await writer.write(encoder.encode(JSON.stringify({ type: 'progress', stage: 'uploading', percent: 0 }) + '\n'));

                const uploadedVideo = await uploadVideo(
                    videoPath,
                    `${title} - ${speaker}`,
                    `${description}\n\nRecorded at: ${datetime}\nMasjid: ${masjidId}`
                );

                // 3. Cleanup
                await cleanupTempFile(videoPath);

                if (uploadedVideo && uploadedVideo.id) {
                    finalYoutubeUrl = `https://youtu.be/${uploadedVideo.id}`;
                }
            }

            if (!finalYoutubeUrl) {
                throw new Error('YouTube URL is required or Audio upload failed');
            }

            ensureFile();
            const fileData = fs.readFileSync(speechesFilePath, 'utf8');
            const speeches: Speech[] = JSON.parse(fileData);

            const newSpeech: Speech = {
                id: Math.random().toString(36).substr(2, 9),
                masjidId,
                title,
                speaker,
                datetime,
                youtubeUrl: finalYoutubeUrl,
                description
            };

            speeches.push(newSpeech);
            fs.writeFileSync(speechesFilePath, JSON.stringify(speeches, null, 2), 'utf8');

            // Send Final Success Response
            await writer.write(encoder.encode(JSON.stringify({ type: 'complete', speech: newSpeech }) + '\n'));

        } catch (error: any) {
            console.error('Error processing speech:', error);
            await writer.write(encoder.encode(JSON.stringify({ type: 'error', message: error.message || 'Failed to process request' }) + '\n'));
        } finally {
            await writer.close();
        }
    })();

    return new NextResponse(stream.readable, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
        }
    });
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Speech ID is required' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(speechesFilePath, 'utf8');
        let speeches: Speech[] = JSON.parse(fileData);

        const speechToDelete = speeches.find(s => s.id === id);

        if (!speechToDelete) {
            return NextResponse.json({ error: 'Speech not found' }, { status: 404 });
        }

        // Delete from YouTube if URL exists
        if (speechToDelete.youtubeUrl) {
            try {
                // Extract video ID from URL
                let videoId = '';
                if (speechToDelete.youtubeUrl.includes('youtu.be/')) {
                    videoId = speechToDelete.youtubeUrl.split('youtu.be/')[1].split('?')[0];
                } else if (speechToDelete.youtubeUrl.includes('v=')) {
                    videoId = speechToDelete.youtubeUrl.split('v=')[1].split('&')[0];
                }

                if (videoId) {
                    await deleteVideo(videoId);
                }
            } catch (ytError) {
                console.error('Failed to delete video from YouTube:', ytError);
                // Continue with DB deletion
            }
        }

        speeches = speeches.filter(s => s.id !== id);
        fs.writeFileSync(speechesFilePath, JSON.stringify(speeches, null, 2), 'utf8');

        return NextResponse.json({ message: 'Speech deleted successfully' });
    } catch (error) {
        console.error('Error deleting speech:', error);
        return NextResponse.json({ error: 'Failed to delete speech' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const { id, masjidId, title, speaker, datetime, description } = data;

        if (!id || !masjidId || !title || !speaker || !datetime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(speechesFilePath, 'utf8');
        let speeches: Speech[] = JSON.parse(fileData);

        const speechIndex = speeches.findIndex(s => s.id === id);

        if (speechIndex === -1) {
            return NextResponse.json({ error: 'Speech not found' }, { status: 404 });
        }

        // Verify ownership
        if (speeches[speechIndex].masjidId !== masjidId) {
            return NextResponse.json({ error: 'Unauthorized: You can only edit your own speeches' }, { status: 403 });
        }

        // Sync with YouTube
        try {
            if (speeches[speechIndex].youtubeUrl) {
                let videoId = '';
                if (speeches[speechIndex].youtubeUrl.includes('youtu.be/')) {
                    videoId = speeches[speechIndex].youtubeUrl.split('youtu.be/')[1].split('?')[0];
                } else if (speeches[speechIndex].youtubeUrl.includes('v=')) {
                    videoId = speeches[speechIndex].youtubeUrl.split('v=')[1].split('&')[0];
                }

                if (videoId) {
                    const ytTitle = `${title} - ${speaker}`;
                    const ytDescription = `${description || ''}\n\nRecorded at: ${datetime}\nMasjid: ${masjidId}`;
                    await updateVideoMetadata(videoId, ytTitle, ytDescription);
                }
            }
        } catch (ytError) {
            console.error('Failed to sync with YouTube:', ytError);
            // Non-blocking: continue to update DB even if YouTube sync fails
        }

        // Update fields (preserve original ID and YouTube URL)
        speeches[speechIndex] = {
            ...speeches[speechIndex],
            title,
            speaker,
            datetime,
            description: description || ''
        };

        fs.writeFileSync(speechesFilePath, JSON.stringify(speeches, null, 2), 'utf8');

        return NextResponse.json(speeches[speechIndex]);
    } catch (error) {
        console.error('Error updating speech:', error);
        return NextResponse.json({ error: 'Failed to update speech' }, { status: 500 });
    }
}
