import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

const ErrorMessage = ({ message, type = 'error' }) => {
    if (!message) return null;

    const styles = {
        error: 'bg-red-50 text-red-700 border-red-200',
        warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    };

    const icons = {
        error: <XCircle className="h-5 w-5 text-red-400 mr-2" />,
        warning: <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />,
    };

    return (
        <div className={`border-l-4 p-4 rounded-r-md ${styles[type]} flex items-start mb-4`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <div>
                <p className="text-sm font-medium">{message}</p>
            </div>
        </div>
    );
};

export default ErrorMessage;
