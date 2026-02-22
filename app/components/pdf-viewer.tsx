"use client";

import { useEffect, useRef, useState } from "react";
import { translateBatch } from "@/utils/antigravity-api";
import { Download, FileText, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PdfViewerProps {
    file: File;
}

interface TextItemData {
    id: string;
    str: string;
    originalText: string;
    translatedText?: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fontSize: number;
    fontFamily: string;
    transform: number[];
}

export function PdfViewer({ file }: PdfViewerProps) {
    const originalCanvasRef = useRef<HTMLCanvasElement>(null);
    const translatedCanvasRef = useRef<HTMLCanvasElement>(null);
    const translatedContainerRef = useRef<HTMLDivElement>(null);
    const [textItems, setTextItems] = useState<TextItemData[]>([]);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [viewportSettings, setViewportSettings] = useState<{ scale: number; width: number; height: number } | null>(null);
    const [pdfPage, setPdfPage] = useState<any>(null);

    const handleDownloadPdf = async () => {
        if (!translatedCanvasRef.current || !viewportSettings) return;
        try {
            setIsGeneratingPdf(true);
            const canvas = translatedCanvasRef.current;
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? "landscape" : "portrait",
                unit: "px",
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
            pdf.save(`tradit_translated_${file.name}`);
        } catch (error) {
            console.error("PDF generation failed:", error);
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const loadPdf = async () => {
            try {
                const pdfjsLib = await import("pdfjs-dist");
                if (typeof window !== "undefined") {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                }
                const arrayBuffer = await file.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdfDoc = await loadingTask.promise;
                const page = await pdfDoc.getPage(1);
                const scale = 1.5;
                const viewport = page.getViewport({ scale });
                if (isMounted) {
                    setViewportSettings({ scale, width: viewport.width, height: viewport.height });
                    setPdfPage(page);
                }
            } catch (err) {
                console.error("Error loading PDF:", err);
            }
        };
        loadPdf();
        return () => { isMounted = false; };
    }, [file]);

    useEffect(() => {
        if (!pdfPage || !viewportSettings || !originalCanvasRef.current) return;
        let isMounted = true;
        const renderAndExtract = async () => {
            try {
                const canvas = originalCanvasRef.current!;
                const context = canvas.getContext("2d")!;
                canvas.height = viewportSettings.height;
                canvas.width = viewportSettings.width;
                const renderContext = {
                    canvasContext: context,
                    viewport: pdfPage.getViewport({ scale: viewportSettings.scale }),
                };
                await pdfPage.render(renderContext).promise;
                if (!isMounted) return;

                const tCanvas = translatedCanvasRef.current;
                if (tCanvas) {
                    const tContext = tCanvas.getContext("2d")!;
                    tCanvas.height = viewportSettings.height;
                    tCanvas.width = viewportSettings.width;
                    tContext.drawImage(canvas, 0, 0);
                }

                const textContent = await pdfPage.getTextContent();
                const scale = viewportSettings.scale;
                const extractedItems: TextItemData[] = textContent.items
                    .filter((item: any) => item.str.trim() !== "")
                    .map((item: any, index: number) => {
                        const transform = item.transform;
                        const fontSize = Math.sqrt((transform[0] * transform[0]) + (transform[1] * transform[1]));
                        const tx = transform[4] * scale;
                        const ty = viewportSettings.height - (transform[5] * scale) - (fontSize * scale);
                        const itemWidth = item.width * scale;
                        const itemHeight = (item.height || fontSize) * scale;
                        return {
                            id: `text-${index}`,
                            str: item.str,
                            originalText: item.str,
                            x: tx,
                            y: ty,
                            width: itemWidth,
                            height: itemHeight,
                            fontSize: fontSize * scale,
                            fontFamily: item.fontName || "sans-serif",
                            transform: transform
                        };
                    });

                if (isMounted) {
                    setTextItems(extractedItems);
                    if (extractedItems.length > 0) {
                        setIsTranslating(true);
                        const stringsToTranslate = extractedItems.map(item => item.originalText);
                        const translatedResults = await translateBatch(stringsToTranslate, "ko");
                        if (isMounted) {
                            setTextItems(prev => {
                                const updatedItems = prev.map((item, idx) => ({
                                    ...item,
                                    translatedText: translatedResults[idx]?.translatedText || item.str
                                }));
                                const tCanvas = translatedCanvasRef.current;
                                if (tCanvas) {
                                    const ctx = tCanvas.getContext("2d")!;
                                    // --- 1. Container Grouping ---
                                    const groupedItems: any[] = [];
                                    let currentGroup: any = null;

                                    updatedItems.forEach(item => {
                                        const text = item.translatedText || item.str;
                                        const isTable = /^\|.*\|$/.test(text.trim());
                                        const isList = /^(\s*[-*•]|\d+\.)\s+(.*)/.test(text.trim());

                                        const type = isTable ? 'table' : (isList ? 'list' : 'text');

                                        if (currentGroup && (type === 'table' || type === 'list') && currentGroup.type === type) {
                                            currentGroup.text += '\n' + text;
                                            currentGroup.x = Math.min(currentGroup.x, item.x);
                                            currentGroup.width = Math.max(currentGroup.x + currentGroup.width, item.x + item.width) - currentGroup.x;
                                            currentGroup.height = (item.y + item.height) - currentGroup.y;
                                            currentGroup.items.push(item);
                                        } else {
                                            if (currentGroup) groupedItems.push(currentGroup);
                                            currentGroup = {
                                                type,
                                                text: text,
                                                x: item.x,
                                                y: item.y,
                                                width: item.width,
                                                height: item.height,
                                                fontSize: item.fontSize,
                                                fontFamily: item.fontFamily,
                                                items: [item]
                                            };
                                        }
                                    });
                                    if (currentGroup) groupedItems.push(currentGroup);

                                    // --- 2. Utils for rendering ---
                                    const getVisualLength = (str: string) => {
                                        let len = 0;
                                        for (let i = 0; i < str.length; i++) {
                                            const code = str.charCodeAt(i);
                                            if (code > 0x1100 && ((code >= 0x1100 && code <= 0x11FF) || (code >= 0x3130 && code <= 0x318F) || (code >= 0xAC00 && code <= 0xD7A3) || (code >= 0x4E00 && code <= 0x9FFF))) {
                                                len += 2;
                                            } else {
                                                len += 1;
                                            }
                                        }
                                        return len;
                                    };

                                    const alignMarkdownTable = (text: string): string => {
                                        const lines = text.split('\n');
                                        const tableLines = lines.filter(line => /^\|.*\|$/.test(line.trim()));
                                        if (tableLines.length === 0) return text;

                                        const rows = tableLines.map(line => {
                                            const content = line.trim();
                                            return content.substring(1, content.length - 1).split('|').map(cell => cell.trim());
                                        });

                                        const colCount = Math.max(...rows.map(r => r.length));
                                        const colWidths = new Array(colCount).fill(0);

                                        rows.forEach(row => {
                                            row.forEach((cell, i) => {
                                                const vLen = getVisualLength(cell);
                                                if (vLen > colWidths[i]) colWidths[i] = vLen;
                                            });
                                        });

                                        const alignedLines = rows.map(row => {
                                            const paddedCells = row.map((cell, i) => {
                                                const currentLen = getVisualLength(cell);
                                                const diff = colWidths[i] - currentLen;
                                                return diff > 0 ? cell + ' '.repeat(diff) : cell;
                                            });
                                            return '| ' + paddedCells.join(' | ') + ' |';
                                        });

                                        let tableIdx = 0;
                                        return lines.map(line => {
                                            if (/^\|.*\|$/.test(line.trim())) {
                                                return alignedLines[tableIdx++];
                                            }
                                            return line;
                                        }).join('\n');
                                    };

                                    const calculateOptimalFontSize = (
                                        ctx: CanvasRenderingContext2D,
                                        text: string,
                                        maxWidth: number,
                                        maxHeight: number,
                                        initialFontSize: number,
                                        fontFamily: string
                                    ) => {
                                        const lineHeightRatio = 1.25;
                                        ctx.font = `${initialFontSize}px ${fontFamily}`;

                                        const wrapLines = (text: string, widthLimit: number): string[] => {
                                            const words = text.split(' ');
                                            const lines: string[] = [];
                                            let currentLine = words[0];
                                            for (let i = 1; i < words.length; i++) {
                                                const word = words[i];
                                                const width = ctx.measureText(currentLine + " " + word).width;
                                                if (width < widthLimit) {
                                                    currentLine += " " + word;
                                                } else {
                                                    lines.push(currentLine);
                                                    currentLine = word;
                                                }
                                            }
                                            lines.push(currentLine);
                                            return lines;
                                        };

                                        let lines = text.split('\n');
                                        const wrappedLines: string[] = [];
                                        lines.forEach(line => {
                                            if (/^\|.*\|$/.test(line.trim())) {
                                                wrappedLines.push(line);
                                            } else {
                                                const listMatch = line.match(/^(\s*[-*•]|\d+\.)\s+(.*)/);
                                                if (listMatch) {
                                                    const bullet = listMatch[1];
                                                    const bulletWidth = ctx.measureText(bullet).width + 10;
                                                    const contentLines = wrapLines(listMatch[2], maxWidth - bulletWidth);
                                                    contentLines.forEach((cl, i) => {
                                                        if (i === 0) wrappedLines.push(`${bullet} ${cl}`);
                                                        else wrappedLines.push(`  ${cl}`); // indent child lines
                                                    });
                                                } else {
                                                    wrappedLines.push(...wrapLines(line, maxWidth));
                                                }
                                            }
                                        });

                                        let totalHeight = wrappedLines.length * initialFontSize * lineHeightRatio;
                                        let maxLineWidth = 0;
                                        wrappedLines.forEach(line => {
                                            let w = 0;
                                            const listMatch = line.match(/^(\s*[-*•]|\d+\.)\s+(.*)/);
                                            if (listMatch) {
                                                w = ctx.measureText(listMatch[1]).width + 10 + ctx.measureText(listMatch[2]).width;
                                            } else {
                                                w = ctx.measureText(line).width;
                                            }
                                            if (w > maxLineWidth) maxLineWidth = w;
                                        });

                                        const heightScale = totalHeight > maxHeight ? (maxHeight / totalHeight) : 1;
                                        const widthScale = maxLineWidth > maxWidth ? (maxWidth / maxLineWidth) : 1;
                                        const shrinkScale = Math.min(heightScale, widthScale, 1.0);

                                        return {
                                            fontSize: initialFontSize * shrinkScale,
                                            finalLines: wrappedLines
                                        };
                                    };

                                    // --- 3. Render Groups ---
                                    groupedItems.forEach(group => {
                                        ctx.fillStyle = "#ffffff";
                                        ctx.fillRect(group.x - 2, group.y - 2, group.width + 4, group.height + 4);

                                        let text = group.text;
                                        if (group.type === 'table') {
                                            text = alignMarkdownTable(text);
                                        }

                                        const baseFontFamily = `"D2Coding", "Consolas", "Courier New", monospace, "Malgun Gothic"`;
                                        const initialFontSize = group.fontSize * 0.95;

                                        const { fontSize, finalLines } = calculateOptimalFontSize(ctx, text, group.width, group.height, initialFontSize, baseFontFamily);

                                        ctx.fillStyle = "#000000";
                                        ctx.textBaseline = "top";
                                        const lineHeight = fontSize * 1.25;
                                        const startY = group.y + (fontSize * 0.1);

                                        finalLines.forEach((line, index) => {
                                            const lineY = startY + (index * lineHeight);

                                            const isTitle = /^(\d+\.|#+)\s+/.test(line.trim());
                                            if (isTitle) {
                                                ctx.font = `bold ${fontSize}px ${baseFontFamily}`;
                                            } else {
                                                ctx.font = `${fontSize}px ${baseFontFamily}`;
                                            }

                                            const listMatch = line.match(/^(\s*[-*•]|\d+\.)\s+(.*)/);
                                            if (listMatch) {
                                                const bullet = listMatch[1];
                                                const content = listMatch[2];
                                                ctx.fillText(bullet, group.x, lineY);
                                                const bulletWidth = ctx.measureText(bullet).width;
                                                ctx.fillText(content, group.x + bulletWidth + 10, lineY);
                                            } else {
                                                ctx.fillText(line, group.x, lineY);
                                            }
                                        });
                                    });
                                }
                                return updatedItems;
                            });
                            setIsTranslating(false);
                        }
                    }
                }
            } catch (err) {
                console.error("Error in render/extract:", err);
                setIsTranslating(false);
            }
        };
        renderAndExtract();
        return () => { isMounted = false; };
    }, [pdfPage, viewportSettings]);

    return (
        <div className="relative w-full overflow-hidden bg-zinc-50 border border-zinc-200 rounded-xl shadow-sm flex flex-col items-center">
            {viewportSettings && (
                <div className="flex flex-col w-full">
                    {/* Header Controls */}
                    <div className="flex w-full items-center justify-between p-4 bg-white border-b border-zinc-200 shadow-sm z-10">
                        <h3 className="font-semibold text-zinc-800 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-500" /> 문서 비교 뷰어
                        </h3>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf || isTranslating}
                            className="flex items-center gap-2 px-5 py-2 text-sm bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                        >
                            {isGeneratingPdf ? <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</> : <><Download className="w-4 h-4" /> 문장 다운로드</>}
                        </button>
                    </div>

                    {/* Side-by-side Canvas Scroll Container */}
                    <div className="flex flex-col xl:flex-row w-full h-[70vh] min-h-[500px] overflow-auto gap-4 p-4 bg-zinc-100/50">

                        {/* Left: Original */}
                        <div className="flex flex-col items-center flex-1 shrink-0">
                            <div className="w-full flex justify-between items-center mb-2 px-2">
                                <h4 className="font-medium text-xs text-zinc-500 uppercase tracking-wider">Original Document</h4>
                            </div>
                            <div className="relative bg-white shadow-sm ring-1 ring-zinc-200/50" style={{ width: viewportSettings.width, height: viewportSettings.height, margin: '0 auto' }}>
                                <canvas ref={originalCanvasRef} className="block w-full h-auto" />
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden xl:flex w-px bg-zinc-200 h-full mx-2" />

                        {/* Right: Translated */}
                        <div className="flex flex-col items-center flex-1 shrink-0">
                            <div className="w-full flex justify-between items-center mb-2 px-2">
                                <h4 className="font-medium text-xs text-red-500 uppercase tracking-wider">Translated Document</h4>
                            </div>
                            <div ref={translatedContainerRef} className="relative bg-white shadow-sm ring-1 ring-red-100/50" style={{ width: viewportSettings.width, height: viewportSettings.height, margin: '0 auto' }}>
                                <canvas ref={translatedCanvasRef} className="block w-full h-auto" />
                                {isTranslating && (
                                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-10 transition-all">
                                        <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-red-100 flex items-center gap-3 animate-pulse">
                                            <div className="w-5 h-5 rounded-full border-t-2 border-red-500 animate-spin" />
                                            <span className="text-zinc-800 font-medium text-sm">레이아웃 맵핑 엔진 가동 중...</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!viewportSettings && (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                    <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-red-500 animate-spin" />
                    문서 렌더링 준비 중...
                </div>
            )}
            {viewportSettings && textItems.length > 0 && (
                <div className="w-full bg-white border-t border-zinc-200">
                    <div className="p-4 bg-zinc-50 border-b border-zinc-100 flex items-center">
                        <h3 className="text-sm font-semibold text-zinc-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-zinc-400" />
                            Raw Data Mapper
                        </h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto w-full">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-zinc-50/50 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="px-4 py-2 font-medium text-zinc-500 border-b border-zinc-200 w-1/2">Original Bounding Box</th>
                                    <th className="px-4 py-2 font-medium text-zinc-500 border-b border-zinc-200 w-1/2">Translated String</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {textItems.map((item) => (
                                    <tr key={`preview-${item.id}`} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-4 py-3 align-top text-zinc-600 font-mono whitespace-pre-wrap leading-relaxed">{item.originalText}</td>
                                        <td className="px-4 py-3 align-top text-zinc-900 leading-relaxed break-words">{item.translatedText || item.str}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
