import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Donor } from '@/types';

const donorsFilePath = path.join(process.cwd(), 'data', 'donors.json');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, name, email, mobile, address, location } = body;

        if (!username || !password || !name || !email || !mobile || !address) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate Indian Mobile Number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            return NextResponse.json({ error: 'Invalid mobile number. Must be 10 digits starting with 6-9.' }, { status: 400 });
        }

        const fileData = fs.readFileSync(donorsFilePath, 'utf8');
        const donors: Donor[] = JSON.parse(fileData);

        if (donors.some(d => d.username === username)) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
        }

        const newDonor: Donor = {
            id: Date.now().toString(),
            username,
            password, // In a real app, hash this!
            name,
            email,
            mobile,
            address,
            location,
            status: 'pending',
        };

        donors.push(newDonor);
        fs.writeFileSync(donorsFilePath, JSON.stringify(donors, null, 2));

        return NextResponse.json({ message: 'Registration successful', donor: { ...newDonor, password: undefined } }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
