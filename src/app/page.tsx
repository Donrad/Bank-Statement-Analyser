'use client';

import { Button } from '@/components/ui/button';
import { StatementAnalysis, StatementDetails } from '@/components/statement-analysis';
import { useRef, useState, DragEvent, FormEvent } from 'react';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<StatementDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile?.type !== 'application/pdf') {
      setError('Invalid file type. Please upload a PDF.');
      setFile(null);
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, isOver: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isOver);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files?.[0] ?? null);
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'An unknown error occurred during parsing.');
      } else {
        setResult(data as StatementDetails);
      }
    } catch {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative max-w-xl mx-auto my-16 p-6 bg-zinc-50/70 rounded-2xl shadow-2xl border border-zinc-200 ring-1 ring-sky-200/40 backdrop-blur-lg overflow-hidden">
      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-sky-300/30 blur-2xl opacity-40 z-0" />
      <h1 className="relative z-10 text-xl font-bold mb-6 text-zinc-800">Statement Analyser</h1>

      <form onSubmit={handleSubmit} className="relative z-10 flex flex-col gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="hidden"
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer shadow-lg bg-white/70 overflow-hidden group transition-all duration-300
            ${isDragging ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-300/40' : 'border-zinc-300 hover:border-sky-400 hover:ring-2 hover:ring-sky-200/40'}`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-sky-200/30 blur-xl opacity-50 group-hover:opacity-80 transition-all duration-300 z-0" />

          {file ? (
            <div className="relative z-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-2 drop-shadow-lg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-base font-semibold text-sky-800">{file.name}</p>
              <p className="text-xs text-zinc-500">
                {(file.size / 1024).toFixed(2)} KB | {file.type}
              </p>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="mt-2 text-xs text-red-500 hover:text-red-700 font-semibold underline underline-offset-2"
              >
                Clear file
              </button>
            </div>
          ) : (
            <div className="relative z-10 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-sky-300 mb-2 drop-shadow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-zinc-600">
                <span className="font-bold text-sky-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-zinc-500">PDF files only</p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!file || loading}
          className="bg-sky-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-sky-700 focus:ring-2 focus:ring-sky-400/60 font-bold text-base tracking-tight disabled:bg-zinc-400 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Analysing...
            </span>
          ) : 'Analyse'}
        </Button>
      </form>

      {error && (
        <p className="relative z-10 text-red-600 bg-red-50/80 border border-red-200 rounded-lg px-4 py-2 mt-4 shadow-sm font-semibold text-center">
          {error}
        </p>
      )}

      {result && !error && (
        <div className="mt-8">
          <StatementAnalysis data={result} />
        </div>
      )}
    </main>
  );
}
