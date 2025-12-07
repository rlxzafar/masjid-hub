import { google } from 'googleapis';
import fs from 'fs';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.YOUTUBE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URL, potentially irrelevant for refresh token flow but required
);

if (REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
    });
}

export const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
});

export async function createPlaylist(title: string, description: string) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.warn('YouTube credentials missing. Skipping playlist creation.');
        return null;
    }

    try {
        const response = await youtube.playlists.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: title,
                    description: description
                },
                status: {
                    privacyStatus: 'public' // or 'private' / 'unlisted'
                }
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error creating YouTube playlist:', error);
        return null; // Don't crash the app if YouTube fails
    }
}

export async function uploadVideo(filePath: string, title: string, description: string) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('YouTube credentials missing.');
    }

    try {
        const response = await youtube.videos.insert({
            part: ['snippet', 'status'],
            requestBody: {
                snippet: {
                    title: title,
                    description: description
                },
                status: {
                    privacyStatus: 'public'
                }
            },
            media: {
                body: fs.createReadStream(filePath)
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error uploading YouTube video:', error);
        throw error;
    }
}

export async function deleteVideo(videoId: string) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('YouTube credentials missing.');
    }

    try {
        await youtube.videos.delete({
            id: videoId
        });
        console.log(`Deleted YouTube video: ${videoId}`);
        return true;
    } catch (error) {
        console.error('Error deleting YouTube video:', error);
        return false;
    }
}

export async function updateVideoMetadata(videoId: string, title: string, description: string) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        throw new Error('YouTube credentials missing.');
    }

    try {
        // We need to provide the categoryId, defaulting to 22 (People & Blogs) if strictly required,
        // but let's try to minimal update first. 
        // Note: verify if categoryId matches original upload.
        await youtube.videos.update({
            part: ['snippet'],
            requestBody: {
                id: videoId,
                snippet: {
                    title: title,
                    description: description,
                    categoryId: '22' // Defaulting to avoid "missing categoryId" error
                }
            }
        });
        console.log(`Updated YouTube video metadata: ${videoId}`);
        return true;
    } catch (error) {
        console.error('Error updating YouTube video metadata:', error);
        return false; // Fail silently on YouTube side but log it
    }
}
