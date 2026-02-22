import { Search, FileText, Cloud, TrendingUp, Download, Hourglass, RotateCw } from "lucide-react";

const stats = [
    { label: "TOTAL FILES", value: "1,248", icon: FileText, iconBg: "bg-zinc-100", iconColor: "text-zinc-500" },
    { label: "STORAGE USED", value: "4.2 GB", icon: Cloud, iconBg: "bg-zinc-100", iconColor: "text-zinc-500" },
    { label: "THIS MONTH", value: "+124", valueColor: "text-red-500", icon: TrendingUp, iconBg: "bg-red-50", iconColor: "text-red-500" },
];

const historyData = [
    { id: 1, name: "Q3_Financial_Report.pdf", date: "Oct 24, 2023", time: "10:42 AM", size: "2.4 MB", status: "Ready" },
    { id: 2, name: "Client_Invoice_004.pdf", date: "Oct 23, 2023", time: "09:15 AM", size: "450 KB", status: "Processing" },
    { id: 3, name: "HR_Policy_Update_v2.pdf", date: "Oct 22, 2023", time: "04:30 PM", size: "—", status: "Failed" },
    { id: 4, name: "Marketing_Deck_Final.pdf", date: "Oct 20, 2023", time: "02:12 PM", size: "15.8 MB", status: "Ready" },
    { id: 5, name: "Employee_Handbook_2024.pdf", date: "Oct 18, 2023", time: "11:00 AM", size: "3.1 MB", status: "Ready" },
    { id: 6, name: "Contract_Vendor_XYZ.pdf", date: "Oct 15, 2023", time: "08:45 AM", size: "1.8 MB", status: "Ready" },
];

export default function HistoryPage() {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Ready":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Ready
                    </span>
                );
            case "Processing":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                        <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        Processing
                    </span>
                );
            case "Failed":
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Failed
                    </span>
                );
            default:
                return null;
        }
    };

    const getActionButton = (status: string) => {
        switch (status) {
            case "Ready":
                return (
                    <button className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto">
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                );
            case "Processing":
                return (
                    <button disabled className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-400 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed w-full sm:w-auto">
                        <Hourglass className="w-4 h-4" />
                        Wait...
                    </button>
                );
            case "Failed":
                return (
                    <button className="flex items-center justify-center gap-2 border border-zinc-200 hover:bg-zinc-50 text-zinc-900 px-4 py-2 rounded-lg font-semibold text-sm transition-colors w-full sm:w-auto">
                        <RotateCw className="w-4 h-4" />
                        Retry
                    </button>
                );
        }
    };

    const getFileIconColors = (status: string) => {
        switch (status) {
            case "Ready":
                return "bg-red-50 text-red-500";
            case "Processing":
                return "bg-blue-50 text-blue-500";
            case "Failed":
                return "bg-red-50 text-red-500";
            default:
                return "bg-zinc-50 text-zinc-500";
        }
    };

    return (
        <div className="min-h-screen bg-white p-8 max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
                        Generation History
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Manage your past PDF generation tasks.
                    </p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Search filename..."
                        className="w-full pl-10 pr-4 py-3 bg-zinc-50 border-none rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm font-medium"
                    />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex items-start justify-between">
                        <div className="flex flex-col gap-2">
                            <span className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
                                {stat.label}
                            </span>
                            <span className={`text-3xl font-bold ${stat.valueColor || "text-zinc-900"}`}>
                                {stat.value}
                            </span>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.iconBg} ${stat.iconColor}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Data Table */}
            <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 bg-zinc-50/50 text-xs font-bold tracking-widest text-zinc-500 uppercase">
                    <div className="col-span-5">File Name</div>
                    <div className="col-span-3">Date Created</div>
                    <div className="col-span-1">Size</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-zinc-100">
                    {historyData.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                            {/* File Name */}
                            <div className="col-span-5 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileIconColors(item.status)}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-zinc-900 truncate">
                                    {item.name}
                                </span>
                            </div>

                            {/* Date Created */}
                            <div className="col-span-3 flex items-center gap-2 text-sm font-medium text-zinc-600">
                                <span>{item.date}</span>
                                <span className="text-zinc-400 text-xs">{item.time}</span>
                            </div>

                            {/* Size */}
                            <div className="col-span-1 text-sm font-medium text-zinc-600">
                                {item.size}
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                {getStatusBadge(item.status)}
                            </div>

                            {/* Action */}
                            <div className="col-span-2 flex justify-end">
                                {getActionButton(item.status)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 flex items-center justify-between text-sm font-medium">
                    <span className="text-zinc-500">
                        Showing 1 to 6 of 48 entries
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 transition-colors">
                            &lt;
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-bold shadow-sm">
                            1
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded text-zinc-600 hover:bg-zinc-100 transition-colors">
                            2
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded text-zinc-600 hover:bg-zinc-100 transition-colors">
                            3
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-zinc-400">
                            ...
                        </span>
                        <button className="w-8 h-8 flex items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 transition-colors">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
