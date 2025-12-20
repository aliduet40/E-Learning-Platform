import React from 'react';

const ProgressBar = ({ progress, size = 'md', showLabel = true }) => {
    const sizes = {
        sm: 'h-1',
        md: 'h-2.5',
        lg: 'h-4'
    };

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Course Progress</span>
                    <span className="text-sm font-medium text-primary-600">{Math.round(progress)}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full ${sizes[size]}`}>
                <div
                    className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
