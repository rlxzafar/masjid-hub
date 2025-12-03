import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Donor, Masjid } from '@/types';

const donorsFilePath = path.join(process.cwd(), 'data', 'donors.json');
const masjidsFilePath = path.join(process.cwd(), 'data', 'masjids.json');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        console.log('Login attempt:', { username, password });

        if (!username || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        // 1. Check Donors
        if (fs.existsSync(donorsFilePath)) {
            const donorsData = fs.readFileSync(donorsFilePath, 'utf8');
            const donors: Donor[] = JSON.parse(donorsData);
            const donor = donors.find(d => d.username === username && d.password === password);

            if (donor) {
                if (donor.status !== 'approved') {
                    return NextResponse.json({ error: 'Account pending approval' }, { status: 403 });
                }
                const { password: _, ...userWithoutPassword } = donor;
                return NextResponse.json({ message: 'Login successful', user: { ...userWithoutPassword, role: 'donor' } });
            }
        }

        // 2. Check Masjids
        if (fs.existsSync(masjidsFilePath)) {
            const masjidsData = fs.readFileSync(masjidsFilePath, 'utf8');
            const masjids: Masjid[] = JSON.parse(masjidsData);
            const masjid = masjids.find(m => m.username === username && m.password === password);

            if (masjid) {
                const { password: _, ...userWithoutPassword } = masjid;
                // For Masjids, we treat them as 'masjid' role. 
                // The frontend expects 'masjidId' in localStorage for masjids, or user object.
                // We'll return a user object with role 'masjid'.
                return NextResponse.json({ message: 'Login successful', user: { ...userWithoutPassword, role: 'masjid' } });
            }
        }

        // 3. Check Admin (Hardcoded for MVP as seen in frontend, but good to have here too if needed, 
        // though frontend handles admin check locally for demo credentials. 
        // Let's support it here for consistency if the frontend sends it).
        if (username === 'admin' && password === 'adminpassword') {
            return NextResponse.json({ message: 'Login successful', user: { username: 'admin', role: 'admin' } });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

