import React from 'react';
import { BookOpen } from 'lucide-react';

const AuthCard = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <BookOpen className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                    {title}
                </h2>
                {subtitle && (
                    <div className="mt-2 text-center text-sm text-muted-foreground">
                        {subtitle}
                    </div>
                )}
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-card py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-border">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthCard;
