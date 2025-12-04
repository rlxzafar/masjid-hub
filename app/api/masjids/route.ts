import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Masjid } from '@/types';

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

export async function GET() {
    try {
        ensureFile();
        const fileData = fs.readFileSync(masjidsFilePath, 'utf8');
        const masjids: Masjid[] = JSON.parse(fileData);
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

        return NextResponse.json(newMasjid, { status: 201 });
    } catch (error) {
        console.error('Error adding masjid:', error);
        return NextResponse.json({ error: 'Failed to add masjid' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, address, imamName, contact, image, username, password } = body;

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

        masjids[index] = {
            ...masjids[index],
            name: name || masjids[index].name,
            address: address || masjids[index].address,
            imamName: imamName || masjids[index].imamName,
            contact: contact || masjids[index].contact,
            image: image || masjids[index].image,
            username: username || masjids[index].username,
            password: password || masjids[index].password
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
        masjids = masjids.filter(m => m.id !== id);

        if (masjids.length === initialLength) {
            return NextResponse.json({ error: 'Masjid not found' }, { status: 404 });
        }

        fs.writeFileSync(masjidsFilePath, JSON.stringify(masjids, null, 2), 'utf8');

        return NextResponse.json({ message: 'Masjid deleted successfully' });
    } catch (error) {
        console.error('Error deleting masjid:', error);
        return NextResponse.json({ error: 'Failed to delete masjid' }, { status: 500 });
    }
}
