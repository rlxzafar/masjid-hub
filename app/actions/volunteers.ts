'use server';

import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { Volunteer } from '@/types';

const dataFilePath = path.join(process.cwd(), 'data', 'volunteers.json');

export async function createVolunteer(formData: FormData) {
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const image = formData.get('image') as string;

    if (!name || !role || !email) {
        throw new Error('Missing required fields');
    }

    const newVolunteer: Volunteer = {
        id: Date.now().toString(),
        name,
        role,
        email,
        phone,
        image: image || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop', // Default image
    };

    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf-8');
        const volunteers = JSON.parse(fileContent) as Volunteer[];

        volunteers.push(newVolunteer);

        await fs.writeFile(dataFilePath, JSON.stringify(volunteers, null, 4));

        revalidatePath('/volunteers');
        revalidatePath('/dashboard/admin/volunteers');

        return { success: true };
    } catch (error) {
        console.error('Error creating volunteer:', error);
        return { success: false, error: 'Failed to create volunteer' };
    }
}
