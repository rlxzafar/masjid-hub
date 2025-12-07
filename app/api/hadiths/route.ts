import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const hadithsFilePath = path.join(process.cwd(), 'data', 'hadiths.json');

export async function GET() {
    try {
        if (!fs.existsSync(hadithsFilePath)) {
            return NextResponse.json([]);
        }
        const fileData = fs.readFileSync(hadithsFilePath, 'utf8');
        const hadiths = JSON.parse(fileData);
        return NextResponse.json(hadiths);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch hadiths' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { arabic, english, source, topic } = body;

        if (!arabic || !english || !source || !topic) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        let hadiths = [];
        if (fs.existsSync(hadithsFilePath)) {
            const fileData = fs.readFileSync(hadithsFilePath, 'utf8');
            hadiths = JSON.parse(fileData);
        }

        const newHadith = {
            id: Date.now().toString(),
            arabic,
            english,
            source,
            topic
        };

        hadiths.push(newHadith);
        fs.writeFileSync(hadithsFilePath, JSON.stringify(hadiths, null, 2));

        return NextResponse.json({ message: 'Hadith added successfully', hadith: newHadith }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        if (!fs.existsSync(hadithsFilePath)) {
            return NextResponse.json({ error: 'Database not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(hadithsFilePath, 'utf8');
        let hadiths = JSON.parse(fileData);

        const index = hadiths.findIndex((h: any) => h.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
        }

        hadiths[index] = { ...hadiths[index], ...updates };
        fs.writeFileSync(hadithsFilePath, JSON.stringify(hadiths, null, 2));

        return NextResponse.json({ message: 'Hadith updated successfully', hadith: hadiths[index] });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        if (!fs.existsSync(hadithsFilePath)) {
            return NextResponse.json({ error: 'Database not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(hadithsFilePath, 'utf8');
        let hadiths = JSON.parse(fileData);

        const filteredHadiths = hadiths.filter((h: any) => h.id !== id);

        if (hadiths.length === filteredHadiths.length) {
            return NextResponse.json({ error: 'Hadith not found' }, { status: 404 });
        }

        fs.writeFileSync(hadithsFilePath, JSON.stringify(filteredHadiths, null, 2));

        return NextResponse.json({ message: 'Hadith deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
