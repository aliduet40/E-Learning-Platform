import React, { useState } from 'react';

const GradingInterface = ({ submission, onGrade }) => {
    const [grade, setGrade] = useState(submission?.grade || '');
    const [feedback, setFeedback] = useState(submission?.feedback || '');

    const handleSave = () => {
        onGrade({ submissionId: submission.id, grade, feedback });
    };

    if (!submission) return null;

    return (
        <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4">Grading</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grade (out of 100)</label>
                    <input
                        type="number"
                        max="100"
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                    <textarea
                        rows="4"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleSave}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                    Save Grade
                </button>
            </div>
        </div>
    );
};

export default GradingInterface;
