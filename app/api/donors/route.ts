import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Donor } from '@/types';

const donorsFilePath = path.join(process.cwd(), 'data', 'donors.json');

export async function GET() {
    try {
        if (!fs.existsSync(donorsFilePath)) {
            return NextResponse.json([]);
        }
        const fileData = fs.readFileSync(donorsFilePath, 'utf8');
        const donors: Donor[] = JSON.parse(fileData);

        // Return only necessary info to protect privacy if needed, 
        // but for admin dashboard full info is usually fine.
        return NextResponse.json(donors);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch donors' }, { status: 500 });
    }
}
