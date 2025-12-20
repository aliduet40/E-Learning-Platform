import React from 'react';
import { BookOpen } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <BookOpen className="h-6 w-6 text-primary-600 mr-2" />
                        <span className="font-bold text-gray-900">EduPlatform</span>
                    </div>
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} E-Learning Platform. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
