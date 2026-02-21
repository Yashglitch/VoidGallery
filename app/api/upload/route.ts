import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const description = formData.get('description') as string;
        const descriptionLeft = formData.get('descriptionLeft') as string;
        const descriptionRight = formData.get('descriptionRight') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Sanitize filename or use UUID to prevent conflicts
        const filename = `${uuidv4()}_${file.name.replace(/\s+/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'gallery');

        // Ensure dir exists
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Write file
        await fs.writeFile(filePath, buffer);

        // Update JSON DB
        const dbPath = path.join(process.cwd(), 'data', 'gallery.json');
        let currentData = [];
        try {
            const dbContent = await fs.readFile(dbPath, 'utf-8');
            currentData = JSON.parse(dbContent);
        } catch {
            // ignore if file doesn't exist yet
        }

        const newEntry = {
            id: uuidv4(),
            src: `/gallery/${filename}`,
            description: description || '',
            leftText: descriptionLeft || '',
            rightText: descriptionRight || '',
            timestamp: new Date().toISOString()
        };

        currentData.unshift(newEntry); // Add to top
        await fs.writeFile(dbPath, JSON.stringify(currentData, null, 2));

        return NextResponse.json({ success: true, entry: newEntry });

    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
