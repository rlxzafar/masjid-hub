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
