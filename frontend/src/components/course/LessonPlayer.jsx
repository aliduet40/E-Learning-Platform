import React from 'react';
import { PlayCircle, FileText } from 'lucide-react';

const LessonPlayer = ({ lesson, onComplete, isCompleted }) => {
    if (!lesson) return <div className="h-96 flex items-center justify-center bg-black text-white">Select a lesson</div>;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="bg-black aspect-video flex items-center justify-center relative group">
                {lesson.type === 'video' ? (
                    // Placeholder for video player (e.g., HTML5 video or YouTube embed)
                    <div className="text-white text-center">
                        <PlayCircle size={64} className="mx-auto mb-4 opacity-80 group-hover:opacity-100 transition-opacity" />
                        <p>Video Player Placeholder</p>
                    </div>
                ) : (
                    <div className="text-white text-center p-8 bg-gray-800 w-full h-full flex flex-col justify-center items-center">
                        <FileText size={48} className="mb-4 text-gray-400" />
                        <p>Reading Material</p>
                    </div>
                )}
            </div>

            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{lesson.title}</h2>
                <div className="prose max-w-none text-gray-600">
                    {lesson.content || "Lesson content description goes here."}
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onComplete}
                        disabled={isCompleted}
                        className={`px-6 py-2 rounded-md font-medium transition-colors ${isCompleted
                                ? 'bg-green-100 text-green-700 cursor-default'
                                : 'bg-primary-600 text-white hover:bg-primary-700'
                            }`}
                    >
                        {isCompleted ? 'Completed' : 'Mark as Complete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
