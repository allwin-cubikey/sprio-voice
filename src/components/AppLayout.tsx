import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { ToastContainer } from './ui/Toast';
import { CommandPalette } from './ui/CommandPalette';
import { OutboundCallModal } from './OutboundCallModal';

export function AppLayout() {
    const location = useLocation();
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 min-h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
            <ToastContainer />
            <CommandPalette />
            <OutboundCallModal />
        </div>
    );
}
