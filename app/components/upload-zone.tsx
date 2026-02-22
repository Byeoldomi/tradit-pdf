"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { PdfViewer } from "./pdf-viewer";

const validatePDFSecurity = async (file: File): Promise<string | null> => {
    try {
        const arrayBuffer = await file.arrayBuffer();

        // 1. Magic Bytes Check (%PDF-)
        const bytes = new Uint8Array(arrayBuffer.slice(0, 5));
        const isPdfMagic = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2D;

        if (!isPdfMagic) {
            return "보안 검사 실패: 올바른 PDF 형식이 아닙니다 (위조된 확장자 의심).";
        }

        const textDecoder = new TextDecoder('utf-8', { fatal: false });
        const textContent = textDecoder.decode(arrayBuffer);

        const maliciousPatterns = [
            /\/JS\b/i,
            /\/JavaScript\b/i,
            /\/AA\b/i,
            /\/OpenAction\b/i,
            /\/Launch\b/i
        ];

        for (const pattern of maliciousPatterns) {
            if (pattern.test(textContent)) {
                return "보안 검사 실패: 문서 내에 잠재적인 악성 스크립트 실행 요소가 발견되었습니다.";
            }
        }

        return null;
    } catch (error) {
        console.error("PDF validation error:", error);
        return "보안 검증 중 오류가 발생했습니다. 파일을 확인해 주세요.";
    }
};

export function UploadZone() {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [pageCount, setPageCount] = useState<number | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            await processFile(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            await processFile(file);
        }
    };

    const processFile = async (file: File) => {
        setUploadError(null);

        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith('.pdf')) {
            setUploadError("허용되지 않는 파일입니다. PDF 파일만 업로드 가능합니다.");
            return;
        }

        const MAX_FILE_SIZE = 20 * 1024 * 1024;
        if (file.size > MAX_FILE_SIZE) {
            setUploadError(`파일 용량이 너무 큽니다. (최대 20MB, 현재 ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
            return;
        }

        setIsUploading(true);
        const securityError = await validatePDFSecurity(file);
        if (securityError) {
            setUploadError(securityError);
            setIsUploading(false);
            return;
        }

        setUploadProgress(0);
        setUploadedFile(null);
        setPageCount(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }

        try {
            setUploadedFile(file);
            setPageCount(1);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { data: { session } } = await supabase.auth.getSession();
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

            if (!supabaseUrl || !supabaseKey) {
                throw new Error("Supabase 환경 변수가 설정되지 않았습니다.");
            }

            const token = session?.access_token || supabaseKey;

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setUploadProgress(100);
                        resolve();
                    } else {
                        reject(new Error(`업로드 실패 (상태 코드: ${xhr.status})`));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error("네트워크 오류로 업로드에 실패했습니다."));
                };

                const uploadUrl = `${supabaseUrl}/storage/v1/object/pdf-drive/${filePath}`;
                xhr.open("POST", uploadUrl, true);
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                xhr.setRequestHeader("apikey", supabaseKey);
                xhr.setRequestHeader("Content-Type", file.type || "application/pdf");
                xhr.send(file);
            });

        } catch (error: any) {
            setUploadError(error.message || "오류가 발생했습니다.");
            console.error("Upload error:", error);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const resetUpload = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setPageCount(null);
        setUploadedFile(null);
        setUploadError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className={`border-2 border-dashed rounded-2xl p-8 md:p-16 flex flex-col items-center justify-center bg-white shadow-sm transition-all w-full relative
                ${isDragging ? "border-red-400 bg-red-50 scale-[1.01]" : "border-zinc-200 hover:border-red-300"}
                ${isUploading ? "opacity-80 pointer-events-none" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,application/pdf"
                className="hidden"
            />

            {isUploading ? (
                <div className="flex flex-col items-center justify-center my-12 w-full max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </div>

                    <div className="w-full mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-zinc-700">업로드 진행 상태</span>
                            <span className="text-sm font-bold text-red-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200 shadow-inner">
                            <div
                                className="bg-red-500 h-2.5 rounded-full transition-all duration-300 ease-out relative"
                                style={{ width: `${uploadProgress}%` }}
                            >
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-[shimmer_2s_infinite] -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-2">PDF 업로드 및 분석 중...</h3>
                    <p className="text-zinc-500 font-medium text-center">
                        페이지 수와 파일 크기에 따라 다소 시간이 걸릴 수 있습니다
                    </p>
                </div>
            ) : uploadedFile ? (
                <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center justify-center mb-6 text-center">
                        <div>
                            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 className="w-6 h-6 border-white bg-green-50 rounded-full" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 leading-tight">업로드 완료</h3>
                        </div>
                    </div>

                    <div className="w-full mb-6 relative z-10">
                        <PdfViewer file={uploadedFile} />
                    </div>

                    <div className="flex flex-col gap-3 mb-8 w-full p-5 bg-zinc-50/80 rounded-xl border border-zinc-100">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 text-sm font-medium flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                파일명
                            </span>
                            <span className="text-zinc-900 text-sm font-semibold truncate max-w-[200px]" title={uploadedFile.name}>
                                {uploadedFile.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-500 text-sm font-medium">크기</span>
                            <span className="text-zinc-900 text-sm font-semibold">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                        </div>
                        {pageCount !== null && (
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm font-medium">총 페이지</span>
                                <span className="text-zinc-900 text-sm font-bold bg-white px-2 py-0.5 rounded border border-zinc-200">
                                    {pageCount} 페이지
                                </span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={resetUpload}
                        className="text-sm px-6 py-2.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 font-semibold rounded-lg shadow-sm transition-all"
                    >
                        다른 파일 업로드하기
                    </button>
                </div>
            ) : (
                <>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                            ${isDragging ? "bg-red-100 text-red-600 scale-110" : "bg-red-50 text-red-500"}
                        `}>
                        <UploadCloud className="w-8 h-8" />
                    </div>

                    <h3 className="text-xl font-bold text-zinc-900 mb-2">
                        {isDragging ? "여기로 드롭하세요" : "Upload Zone"}
                    </h3>

                    {uploadError && (
                        <div className="flex items-center gap-2 text-red-500 mb-4 bg-red-50 px-3 py-1.5 rounded-md text-sm">
                            <AlertCircle className="w-4 h-4 min-w-[16px]" />
                            <span>{uploadError}</span>
                        </div>
                    )}

                    <p className={`mb-2 font-medium text-center max-w-xs transition-colors
                            ${isDragging ? "text-red-500" : "text-zinc-500"}
                        `}>
                        Drag & drop your PDF here or browse files
                    </p>
                    <p className="text-sm font-medium text-zinc-400 mb-6 text-center">
                        최대 20MB / PDF 파일 전용
                    </p>
                    <button
                        onClick={handleButtonClick}
                        className="px-6 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-900 font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
                    >
                        Select File
                    </button>
                </>
            )}
        </div>
    );
}
