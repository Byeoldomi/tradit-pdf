import { FileText, MoreVertical } from "lucide-react";

const files = [
    {
        id: 1,
        name: "Q3_Financial_Report.pdf",
        time: "Edited 2 hours ago",
        size: "2.4 MB",
        status: "Translated",
        statusColor: "text-green-700 bg-green-50",
    },
    {
        id: 2,
        name: "Project_Alpha_Specs_v2.pdf",
        time: "Uploaded yesterday",
        size: "8.1 MB",
        status: "Original",
        statusColor: "text-zinc-700 bg-zinc-100",
    },
];

export function RecentFiles() {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-zinc-900">Recent Files</h3>
                <button className="text-sm font-medium text-zinc-500 hover:text-zinc-800 flex items-center gap-1 transition-colors">
                    View all <span>→</span>
                </button>
            </div>

            <div className="space-y-4">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-2xl shadow-sm hover:border-zinc-300 transition-colors"
                    >
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center ${file.status === "Translated"
                                        ? "bg-red-50 text-red-500"
                                        : "bg-blue-50 text-blue-500"
                                    }`}
                            >
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-zinc-900 leading-tight mb-1">
                                    {file.name}
                                </span>
                                <span className="text-sm text-zinc-500 font-medium">
                                    {file.time} • {file.size}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${file.statusColor}`}
                            >
                                {file.status}
                            </span>
                            <button className="p-1 text-zinc-400 hover:text-zinc-800 transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
