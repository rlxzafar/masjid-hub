import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PrayerTimes } from '@/types';

const prayersFilePath = path.join(process.cwd(), 'data', 'prayers.json');

const ensureFile = () => {
    const dir = path.dirname(prayersFilePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(prayersFilePath)) {
        fs.writeFileSync(prayersFilePath, '[]', 'utf8');
    }
};

export async function GET(request: Request) {
    try {
        ensureFile();
        const { searchParams } = new URL(request.url);
        const masjidId = searchParams.get('masjidId');

        const fileData = fs.readFileSync(prayersFilePath, 'utf8');
        const prayers: PrayerTimes[] = JSON.parse(fileData);

        if (masjidId) {
            const masjidPrayers = prayers.find(p => p.masjidId === masjidId);
            return NextResponse.json(masjidPrayers || null);
        }

        return NextResponse.json(prayers);
    } catch (error) {
        console.error('Error reading prayers:', error);
        return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { masjidId, date, fajr, dhuhr, asr, maghrib, isha, jummah } = body;

        if (!masjidId) {
            return NextResponse.json({ error: 'Masjid ID is required' }, { status: 400 });
        }

        ensureFile();
        const fileData = fs.readFileSync(prayersFilePath, 'utf8');
        let prayers: PrayerTimes[] = JSON.parse(fileData);

        const index = prayers.findIndex(p => p.masjidId === masjidId);

        const newPrayerTimes: PrayerTimes = {
            masjidId,
            date: date || new Date().toISOString().split('T')[0],
            fajr, dhuhr, asr, maghrib, isha, jummah
        };

        if (index !== -1) {
            prayers[index] = { ...prayers[index], ...newPrayerTimes };
        } else {
            prayers.push(newPrayerTimes);
        }

        fs.writeFileSync(prayersFilePath, JSON.stringify(prayers, null, 2), 'utf8');

        return NextResponse.json(newPrayerTimes);
    } catch (error) {
        console.error('Error updating prayers:', error);
        return NextResponse.json({ error: 'Failed to update prayers' }, { status: 500 });
    }
}
