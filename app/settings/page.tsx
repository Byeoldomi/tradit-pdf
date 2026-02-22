import { User, CreditCard, Sliders, Shield } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
            {/* Header Area */}
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">
                    Settings
                </h1>
                <p className="text-zinc-500 font-medium h-[24px]">
                    Manage your account preferences and security.
                </p>
            </div>

            <div className="space-y-12">
                {/* Section 1: Account Profile */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold text-zinc-900">Account Profile</h2>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                            {/* Avatar Outline placeholder */}
                            <div className="w-24 h-24 rounded-full bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-300 font-black text-2xl flex-shrink-0">
                                JD
                            </div>

                            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue="John Doe"
                                        disabled
                                        className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl text-zinc-900 font-medium outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="john.doe@example.com"
                                        disabled
                                        className="w-full px-4 py-3 bg-zinc-50 border border-transparent rounded-xl text-zinc-900 font-medium outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            <button className="text-zinc-500 hover:text-zinc-800 font-semibold text-sm transition-colors">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </section>

                {/* Section 2: Subscription Plan */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold text-zinc-900">Subscription Plan</h2>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-extrabold text-zinc-900 tracking-tight">Pro Plan</span>
                                <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-500 text-xs font-bold uppercase tracking-wider">
                                    Active
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm font-medium">
                                Billed annually. Next billing date: Oct 24, 2024
                            </p>
                        </div>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors w-full sm:w-auto">
                            Upgrade Plan
                        </button>
                    </div>
                </section>

                {/* Section 3: General Preferences */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Sliders className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold text-zinc-900">General Preferences</h2>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm divide-y divide-zinc-100">
                        {/* Setting Item */}
                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-zinc-900">Interface Language</span>
                                <span className="text-sm font-medium text-zinc-500">
                                    Select your preferred language for the dashboard.
                                </span>
                            </div>
                            <select className="w-full sm:w-48 px-4 py-2.5 bg-zinc-50 border border-transparent rounded-xl text-zinc-900 font-medium outline-none focus:ring-2 focus:ring-zinc-200 appearance-none cursor-pointer">
                                <option>English (US)</option>
                                <option>Korean (KR)</option>
                            </select>
                        </div>

                        {/* Setting Item */}
                        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-zinc-900">Default Translation Target</span>
                                <span className="text-sm font-medium text-zinc-500">
                                    Automatically set target language for new PDF uploads.
                                </span>
                            </div>
                            <select className="w-full sm:w-48 px-4 py-2.5 bg-zinc-50 border border-transparent rounded-xl text-zinc-900 font-medium outline-none focus:ring-2 focus:ring-zinc-200 appearance-none cursor-pointer">
                                <option>Spanish (ES)</option>
                                <option>Korean (KR)</option>
                                <option>English (US)</option>
                            </select>
                        </div>

                        {/* Setting Item: Dark Mode Toggle */}
                        <div className="p-6 flex items-center justify-between gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-zinc-900">Dark Mode</span>
                                <span className="text-sm font-medium text-zinc-500">
                                    Switch between light and dark themes.
                                </span>
                            </div>
                            {/* Fake Toggle Switch UI */}
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-200 cursor-pointer transition-colors mr-2">
                                <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white transition-transform shadow-sm"></span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Security */}
                <section>
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="w-5 h-5 text-zinc-400" />
                        <h2 className="text-lg font-bold text-zinc-900">Security</h2>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-zinc-900">Password</span>
                            <span className="text-sm font-medium text-zinc-500">
                                Last changed 3 months ago.
                            </span>
                        </div>
                        <button className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 px-6 py-2.5 rounded-lg font-bold text-sm shadow-sm transition-colors w-full sm:w-auto whitespace-nowrap">
                            Change Password
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
