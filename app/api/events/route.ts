
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { MasjidEvent } from '@/types';

const eventsFilePath = path.join(process.cwd(), 'data', 'events.json');

const ensureFile = () => {
    const dir = path.dirname(eventsFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(eventsFilePath)) {
        fs.writeFileSync(eventsFilePath, '[]', 'utf8');
    }
};

export async function GET(request: Request) {
    try {
        ensureFile();
        const { searchParams } = new URL(request.url);
        const masjidId = searchParams.get('masjidId');

        const fileData = fs.readFileSync(eventsFilePath, 'utf8');
        let events: MasjidEvent[] = JSON.parse(fileData);

        if (masjidId) {
            events = events.filter(e => e.masjidId === masjidId);
        }

        return NextResponse.json(events);
    } catch (error) {
        console.error('Error reading events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { masjidId, title, type, datetime, description } = body;

        if (!masjidId || !title || !type || !datetime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(eventsFilePath, 'utf8');
        const events: MasjidEvent[] = JSON.parse(fileData);

        const newEvent: MasjidEvent = {
            id: Math.random().toString(36).substr(2, 9),
            masjidId,
            title,
            type,
            datetime,
            description: description || ''
        };

        events.push(newEvent);
        fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf8');

        return NextResponse.json(newEvent, { status: 201 });
    } catch (error) {
        console.error('Error adding event:', error);
        return NextResponse.json({ error: 'Failed to add event' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(eventsFilePath, 'utf8');
        let events: MasjidEvent[] = JSON.parse(fileData);

        const initialLength = events.length;
        events = events.filter(e => e.id !== id);

        if (events.length === initialLength) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2), 'utf8');

        return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
