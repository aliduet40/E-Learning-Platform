import React from 'react';
import { Calendar, FileText, Download } from 'lucide-react';

const AssignmentView = ({ assignment }) => {
    if (!assignment) return <div>Assignment not found</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{assignment.title}</h2>
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span className="font-medium text-primary-600">{assignment.points} Points</span>
                    </div>
                </div>
            </div>

            <div className="prose max-w-none mb-8 text-gray-700">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Instructions</h3>
                <p>{assignment.description}</p>
            </div>

            {assignment.attachments && assignment.attachments.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 uppercase tracking-wide">Resources</h3>
                    <div className="space-y-2">
                        {assignment.attachments.map((file, idx) => (
                            <a
                                key={idx}
                                href={file.url}
                                className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <div className="bg-primary-50 p-2 rounded text-primary-600 mr-3">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                    <div className="text-xs text-gray-500">{file.size}</div>
                                </div>
                                <Download className="w-5 h-5 text-gray-400" />
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignmentView;
