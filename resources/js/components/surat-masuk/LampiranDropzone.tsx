import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import Icon from '../ui/Icon';

interface LampiranDropzoneProps {
    files: File[];
    onChange: (files: File[]) => void;
    error?: string | null;
}

const MAX_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

function formatUkuran(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(file: File): string {
    return `${file.name}-${file.size}-${file.lastModified}`;
}

export default function LampiranDropzone({ files, onChange, error }: LampiranDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [localErrors, setLocalErrors] = useState<string[]>([]);

    function addFiles(incoming: File[]): void {
        const errors: string[] = [];
        const existing = new Set(files.map(fileKey));
        const accepted = incoming.filter((file) => {
            const validType = ACCEPTED_TYPES.includes(file.type);
            const validSize = file.size <= MAX_SIZE;

            if (!validType) {
                errors.push(`${file.name}: format harus PDF, JPG, atau PNG.`);
            } else if (!validSize) {
                errors.push(`${file.name}: ukuran melebihi 10 MB.`);
            } else if (existing.has(fileKey(file))) {
                errors.push(`${file.name}: sudah ditambahkan.`);
            }

            return validType && validSize && !existing.has(fileKey(file));
        });

        setLocalErrors(errors);

        if (accepted.length > 0) {
            onChange([...files, ...accepted]);
        }
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>): void {
        addFiles(Array.from(event.target.files ?? []));
        event.target.value = '';
    }

    function handleDrop(event: DragEvent<HTMLDivElement>): void {
        event.preventDefault();
        setDragging(false);
        addFiles(Array.from(event.dataTransfer.files ?? []));
    }

    function removeFile(key: string): void {
        onChange(files.filter((file) => fileKey(file) !== key));
        setLocalErrors([]);
    }

    const messages = [...localErrors, ...(error ? [error] : [])];

    return (
        <div>
            <div
                className={`rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${dragging ? 'border-brand-800 bg-brand-50' : 'border-slate-200 bg-canvas'}`}
                onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={(event) => { event.preventDefault(); setDragging(false); }}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDrop={handleDrop}
            >
                <Icon className="mx-auto text-slate-300" name="file" size={28} />
                <p className="mt-3 text-xs font-medium text-slate-500">Tarik file ke sini atau pilih dari perangkat</p>
                <p className="mt-1 text-[11px] text-slate-400">PDF, JPG, atau PNG · maks 10 MB</p>
                <button
                    className="mt-4 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-200 hover:text-brand-900"
                    onClick={() => inputRef.current?.click()}
                    type="button"
                >
                    Pilih file
                </button>
                <input
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="hidden"
                    multiple
                    onChange={handleInputChange}
                    ref={inputRef}
                    type="file"
                />
            </div>

            {messages.length > 0 ? (
                <div className="mt-3 space-y-1">
                    {messages.map((message) => (
                        <p className="text-xs text-red-600" key={message}>{message}</p>
                    ))}
                </div>
            ) : null}

            {files.length > 0 ? (
                <ul className="ea-scrollbar mt-4 max-h-52 space-y-2 overflow-y-auto">
                    {files.map((file) => (
                        <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-canvas px-3 py-2.5" key={fileKey(file)}>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-900">
                                <Icon name="file" size={16} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-ink">{file.name}</p>
                                <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">{formatUkuran(file.size)}</p>
                            </div>
                            <button
                                aria-label={`Hapus ${file.name}`}
                                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                onClick={() => removeFile(fileKey(file))}
                                type="button"
                            >
                                <Icon name="close" size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}

            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/50 px-3 py-2.5">
                <div className="flex items-center gap-2 text-brand-900">
                    <Icon name="sparkles" size={16} />
                    <div>
                        <p className="text-xs font-semibold">Ekstrak Otomatis AI</p>
                        <p className="text-[11px] text-slate-500">Segera Hadir</p>
                    </div>
                </div>
                <button
                    className="cursor-not-allowed rounded-lg border border-brand-200 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-brand-800"
                    disabled
                    title="Fitur ekstraksi otomatis tersedia pada Tahap 3"
                    type="button"
                >
                    Segera Hadir
                </button>
            </div>
        </div>
    );
}
