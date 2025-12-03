import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Donation } from '@/types';

const donationsFilePath = path.join(process.cwd(), 'data', 'donations.json');

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const donorId = searchParams.get('donorId');

    try {
        if (!fs.existsSync(donationsFilePath)) {
            return NextResponse.json([]);
        }
        const fileData = fs.readFileSync(donationsFilePath, 'utf8');
        const donations: Donation[] = JSON.parse(fileData);

        if (donorId) {
            const donorDonations = donations.filter(d => d.donorId === donorId);
            return NextResponse.json(donorDonations);
        }

        return NextResponse.json(donations);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch donations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { donorId, needyId, amount } = body;

        if (!donorId || !needyId || !amount) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        let donations: Donation[] = [];
        if (fs.existsSync(donationsFilePath)) {
            const fileData = fs.readFileSync(donationsFilePath, 'utf8');
            donations = JSON.parse(fileData);
        }

        const newDonation: Donation = {
            id: Date.now().toString(),
            donorId,
            needyId,
            amount: Number(amount),
            date: new Date().toISOString(),
        };

        donations.push(newDonation);
        fs.writeFileSync(donationsFilePath, JSON.stringify(donations, null, 2));

        return NextResponse.json({ message: 'Donation successful', donation: newDonation }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
