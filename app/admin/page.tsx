'use client';

import { useState, useEffect, useRef } from 'react';

export default function AdminPage() {
    const [dragging, setDragging] = useState(false);
    const [description, setDescription] = useState('');
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const [uploading, setUploading] = useState(false);
    const [gallery, setGallery] = useState<any[]>([]);

    // File input ref for clicking
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchGallery = async () => {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        setGallery(data);
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);
        formData.append('descriptionLeft', leftText);
        formData.append('descriptionRight', rightText);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setDescription(''); // Clear desc
                setLeftText('');
                setRightText('');
                fetchGallery(); // Refresh list
            } else {
                alert('Upload failed.');
            }
        } catch (err) {
            console.error(err);
            alert('Error during upload.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this memory?')) return;

        try {
            const res = await fetch('/api/gallery', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) {
                fetchGallery();
            } else {
                alert('Failed to delete.');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting.');
        }
    };

    return (
        <main className="min-h-screen bg-neutral-900 text-white p-8 font-sans">
            <h1 className="text-4xl font-light mb-8 tracking-widest uppercase text-center text-white/80">Galaxy Control Center</h1>

            <div className="max-w-2xl mx-auto space-y-8">

                {/* Text Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm uppercase tracking-wider text-white/50">Left Narrative</label>
                        <textarea
                            value={leftText}
                            onChange={(e) => setLeftText(e.target.value)}
                            placeholder="Left side text..."
                            className="w-full bg-black/50 border border-white/20 p-4 rounded text-sm font-mono focus:border-white focus:outline-none transition-colors min-h-[100px]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm uppercase tracking-wider text-white/50">Center Caption</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Type the memory description here..."
                            className="w-full bg-black/50 border border-white/20 p-4 rounded text-lg font-mono focus:border-white focus:outline-none transition-colors min-h-[100px]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm uppercase tracking-wider text-white/50">Right Narrative</label>
                        <textarea
                            value={rightText}
                            onChange={(e) => setRightText(e.target.value)}
                            placeholder="Right side text..."
                            className="w-full bg-black/50 border border-white/20 p-4 rounded text-sm font-mono focus:border-white focus:outline-none transition-colors min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    className={`
                        relative border-2 border-dashed rounded-lg h-64 flex flex-col items-center justify-center transition-all cursor-pointer
                        ${dragging ? 'border-white bg-white/10' : 'border-white/20 hover:border-white/50 bg-black/30'}
                        ${uploading ? 'opacity-50 pointer-events-none' : ''}
                    `}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    {uploading ? (
                        <p className="animate-pulse text-xl">TRANSMITTING TO VOID...</p>
                    ) : (
                        <div className="text-center space-y-2">
                            <p className="text-2xl font-light">2. DROP OR TAP IMAGE</p>
                            <p className="text-sm text-white/40 uppercase tracking-widest">Mobile Ready</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Preview */}
            <div className="max-w-6xl mx-auto mt-20">
                <h2 className="text-2xl font-light mb-6 border-b border-white/10 pb-4">Captured Memories ({gallery.length})</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {gallery.map((item, idx) => (
                        <div key={idx} className="group relative aspect-[3/4] bg-black border border-white/10 overflow-hidden hover:border-white/50 transition-colors">
                            <img src={item.src} alt="Memory" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(item.id, e)}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                                    color: 'white',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: 'pointer',
                                    zIndex: 50,
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                }}
                                title="Delete Memory"
                            >
                                ×
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 text-xs font-mono text-white/70 truncate">
                                {item.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
