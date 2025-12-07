import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Masjid } from '@/types';
import { createPlaylist } from '@/lib/youtube';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary';
import { generateMasjidBackground } from '@/lib/masjid-bg-generator';

const masjidsFilePath = path.join(process.cwd(), 'data', 'masjids.json');

// Helper to ensure data directory and file exist
const ensureFile = () => {
    const dir = path.dirname(masjidsFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(masjidsFilePath)) {
        fs.writeFileSync(masjidsFilePath, '[]', 'utf8');
    }
};

export async function GET(request: Request) {
    try {
        ensureFile();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        const fileData = fs.readFileSync(masjidsFilePath, 'utf8');
        const masjids: Masjid[] = JSON.parse(fileData);

        if (id) {
            const masjid = masjids.find(m => m.id === id);
            if (masjid) {
                return NextResponse.json(masjid);
            } else {
                return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
            }
        }

        return NextResponse.json(masjids);
    } catch (error) {
        console.error('Error reading masjids:', error);
        return NextResponse.json({ error: 'Failed to fetch masjids' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, address, imamName, contact, image, username, password } = body;

        if (!name || !address || !username || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(masjidsFilePath, 'utf8');
        const masjids: Masjid[] = JSON.parse(fileData);

        // Check if username already exists
        if (masjids.some(m => m.username === username)) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const newMasjid: Masjid = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            address,
            imamName: imamName || '',
            contact: contact || '',
            image: image || '/masjid-placeholder.png',
            username,
            password // Storing plain text as requested for MVP
        };

        masjids.push(newMasjid);
        fs.writeFileSync(masjidsFilePath, JSON.stringify(masjids, null, 2), 'utf8');

        // Create YouTube Playlist (Fire and forget, don't block response)
        // Create YouTube Playlist (Fire and forget)
        createPlaylist(
            newMasjid.name,
            `Official playlist for ${newMasjid.name}. Address: ${newMasjid.address}`
        ).then(playlist => {
            if (playlist) {
                console.log(`Created YouTube playlist for ${newMasjid.name}: ${playlist.id}`);
            }
        }).catch(ytError => {
            console.error('Failed to create YouTube playlist:', ytError);
        });

        // Generate Unique Background (Fire and forget)
        generateMasjidBackground(newMasjid.id).then((path) => {
            if (path) console.log(`Background generated at ${path}`);
        });

        return NextResponse.json(newMasjid, { status: 201 });
    } catch (error) {
        console.error('Error adding masjid:', error);
        return NextResponse.json({ error: 'Failed to add masjid' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, address, imamName, contact, image, username, password, isDisabled } = body;

        if (!id) {
            return NextResponse.json({ error: 'Masjid ID is required' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(masjidsFilePath, 'utf8');
        let masjids: Masjid[] = JSON.parse(fileData);

        const index = masjids.findIndex(m => m.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
        }

        // Check if username exists for other masjids
        if (username && masjids.some(m => m.username === username && m.id !== id)) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        // If image changed, delete old image from Cloudinary
        if (image && image !== masjids[index].image) {
            const oldPublicId = getPublicIdFromUrl(masjids[index].image || '');
            if (oldPublicId) {
                await deleteImage(oldPublicId);
            }
        }

        masjids[index] = {
            ...masjids[index],
            name: name || masjids[index].name,
            address: address || masjids[index].address,
            imamName: imamName || masjids[index].imamName,
            contact: contact || masjids[index].contact,
            image: image || masjids[index].image,
            username: username || masjids[index].username,
            password: password || masjids[index].password,
            isDisabled: isDisabled !== undefined ? isDisabled : masjids[index].isDisabled
        };

        fs.writeFileSync(masjidsFilePath, JSON.stringify(masjids, null, 2), 'utf8');

        return NextResponse.json(masjids[index]);
    } catch (error) {
        console.error('Error updating masjid:', error);
        return NextResponse.json({ error: 'Failed to update masjid' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Masjid ID is required' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(masjidsFilePath, 'utf8');
        let masjids: Masjid[] = JSON.parse(fileData);

        const initialLength = masjids.length;
        const masjidToDelete = masjids.find(m => m.id === id);

        if (!masjidToDelete) {
            return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
        }

        // Delete image from Cloudinary
        if (masjidToDelete.image) {
            const publicId = getPublicIdFromUrl(masjidToDelete.image);
            if (publicId) {
                await deleteImage(publicId);
            }
        }

        masjids = masjids.filter(m => m.id !== id);

        fs.writeFileSync(masjidsFilePath, JSON.stringify(masjids, null, 2), 'utf8');

        return NextResponse.json({ message: 'Masjid deleted successfully' });
    } catch (error) {
        console.error('Error deleting masjid:', error);
        return NextResponse.json({ error: 'Failed to delete masjid' }, { status: 500 });
    }
}
