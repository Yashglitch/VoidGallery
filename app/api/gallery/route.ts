import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const dataFilePath = path.join(process.cwd(), 'data', 'gallery.json');

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const fileBuffer = await fs.readFile(dataFilePath, 'utf-8');
        const data = JSON.parse(fileBuffer);
        return NextResponse.json(data);
    } catch (e) {
        // If file doesn't exist or is error, return empty
        return NextResponse.json([]);
    }
}

export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        // Read DB
        const fileBuffer = await fs.readFile(dataFilePath, 'utf-8');
        let data = JSON.parse(fileBuffer);

        // Find item to delete
        const itemIndex = data.findIndex((item: any) => item.id === id);
        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const item = data[itemIndex];

        // Delete File
        // item.src is like "/gallery/filename.jpg", we need absolute path
        // process.cwd() + public + item.src
        const relativePath = item.src;
        const absolutePath = path.join(process.cwd(), 'public', relativePath);

        try {
            await fs.unlink(absolutePath);
        } catch (err) {
            console.error('Failed to delete file:', err);
            // Continue to delete from DB even if file missing
        }

        // Remove from DB
        data.splice(itemIndex, 1);
        await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
