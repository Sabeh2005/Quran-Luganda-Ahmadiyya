import React, { useState } from 'react';
import { Header } from '@/components/Header';
import AppInfo from '@/assets/app-information.svg';
import { SettingsPanel } from '@/components/SettingsPanel';
import { NavigationModal } from '@/components/NavigationModal';

const AboutPage = () => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [navigationOpen, setNavigationOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header
                title="About"
                showBack={true}
                onSettingsClick={() => setSettingsOpen(true)}
                onMenuClick={() => setNavigationOpen(true)}
            />
            <main className="flex-1 container mx-auto px-2 pt-2 pb-8 flex flex-col items-center justify-start">
                <div className="w-full max-w-lg bg-card border rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <img
                            src={AppInfo}
                            alt="App Information"
                            className="w-full h-auto drop-shadow-md"
                        />
                    </div>
                </div>

                <p className="mt-8 text-sm text-muted-foreground font-medium">
                    © {new Date().getFullYear()} Holy Quran Luganda
                </p>
            </main>

            <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            <NavigationModal isOpen={navigationOpen} onClose={() => setNavigationOpen(false)} />
        </div>
    );
};

export default AboutPage;
