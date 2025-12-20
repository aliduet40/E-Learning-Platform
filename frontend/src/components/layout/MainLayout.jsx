import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { Outlet, useLocation } from 'react-router-dom';

const MainLayout = () => {
    const location = useLocation();
    const isLandingPage = location.pathname === '/';

    return (
        <div className="min-h-screen bg-background font-sans text-text flex flex-col md:flex-row">
            {/* Sidebar is hidden on landing page or mobile */}
            {!isLandingPage && <Sidebar />}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar />
                <main className={`flex-1 overflow-y-auto ${isLandingPage ? '' : 'p-4 md:p-8'}`}>
                    <div className={`${isLandingPage ? 'w-full' : 'max-w-7xl mx-auto w-full'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};


export default MainLayout;
