import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NeedyPerson } from '@/types';

const needyFilePath = path.join(process.cwd(), 'data', 'needy.json');
const donationsFilePath = path.join(process.cwd(), 'data', 'donations.json');

export async function GET(request: Request) {
    try {
        if (!fs.existsSync(needyFilePath)) {
            return NextResponse.json([]);
        }
        const needyData = fs.readFileSync(needyFilePath, 'utf8');
        const needy: NeedyPerson[] = JSON.parse(needyData);

        let donations: any[] = [];
        if (fs.existsSync(donationsFilePath)) {
            const donationsData = fs.readFileSync(donationsFilePath, 'utf8');
            donations = JSON.parse(donationsData);
        }

        const needyWithRaised = needy.map(person => {
            const raised = donations
                .filter((d: any) => d.needyId === person.id)
                .reduce((sum: number, d: any) => sum + d.amount, 0);
            return { ...person, amountRaised: raised };
        });

        return NextResponse.json(needyWithRaised);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // In a real app, verify admin session here

        const { name, description, contact, amountNeeded } = body;

        if (!name || !description || !contact || !amountNeeded) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        let needy: NeedyPerson[] = [];
        if (fs.existsSync(needyFilePath)) {
            const fileData = fs.readFileSync(needyFilePath, 'utf8');
            needy = JSON.parse(fileData);
        }

        const newPerson: NeedyPerson = {
            id: Date.now().toString(),
            name,
            description,
            contact,
            amountNeeded: Number(amountNeeded),
            status: 'open'
        };

        needy.push(newPerson);
        fs.writeFileSync(needyFilePath, JSON.stringify(needy, null, 2));

        return NextResponse.json({ message: 'Added successfully', person: newPerson }, { status: 201 });
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

        if (!fs.existsSync(needyFilePath)) {
            return NextResponse.json({ error: 'Database not found' }, { status: 404 });
        }

        const fileData = fs.readFileSync(needyFilePath, 'utf8');
        let needy: NeedyPerson[] = JSON.parse(fileData);

        const index = needy.findIndex(p => p.id === id);
        if (index === -1) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        needy[index] = { ...needy[index], ...updates };

        fs.writeFileSync(needyFilePath, JSON.stringify(needy, null, 2));

        return NextResponse.json({ message: 'Updated successfully', person: needy[index] });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
