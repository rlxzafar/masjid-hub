import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Donor } from '@/types';

const donorsFilePath = path.join(process.cwd(), 'data', 'donors.json');

export async function GET(request: Request) {
    // In a real app, verify admin session here
    const fileData = fs.readFileSync(donorsFilePath, 'utf8');
    const donors: Donor[] = JSON.parse(fileData);
    // Return all donors except passwords
    const safeDonors = donors.map(({ password, ...rest }) => rest);
    return NextResponse.json(safeDonors);
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        // In a real app, verify admin session here

        const fileData = fs.readFileSync(donorsFilePath, 'utf8');
        const donors: Donor[] = JSON.parse(fileData);

        const donorIndex = donors.findIndex(d => d.id === id);
        if (donorIndex === -1) {
            return NextResponse.json({ error: 'Donor not found' }, { status: 404 });
        }

        donors[donorIndex].status = status;
        fs.writeFileSync(donorsFilePath, JSON.stringify(donors, null, 2));

        return NextResponse.json({ message: 'Donor updated', donor: donors[donorIndex] });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
