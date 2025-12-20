import React from 'react';
import ProgressBar from '../../components/course/ProgressBar';

const StudentProgress = () => {
    const students = [
        { id: 1, name: 'Alice Johnson', course: 'React Masterclass', progress: 75, lastActive: '2 hours ago' },
        { id: 2, name: 'Bob Smith', course: 'React Masterclass', progress: 30, lastActive: '1 day ago' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Progress</h1>

            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <ul className="divide-y divide-gray-200">
                    {students.map(student => (
                        <li key={student.id} className="p-6 flex items-center justify-between">
                            <div className="flex-1 pr-8">
                                <div className="flex justify-between mb-1">
                                    <h3 className="text-sm font-medium text-gray-900">{student.name}</h3>
                                    <span className="text-xs text-gray-500">{student.lastActive}</span>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{student.course}</p>
                                <div className="w-full max-w-xs">
                                    <ProgressBar progress={student.progress} size="sm" showLabel={true} />
                                </div>
                            </div>
                            <div>
                                <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">View Details</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default StudentProgress;
