import React from 'react';
import { Check, X } from 'lucide-react';

const CourseModeration = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Course Moderation</h1>
            <div className="text-gray-500 bg-white p-8 rounded-lg border border-gray-200 text-center">
                No courses pending approval.
            </div>
        </div>
    );
};
export default CourseModeration;
