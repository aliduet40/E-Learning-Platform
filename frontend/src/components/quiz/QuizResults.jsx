import React from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const QuizResults = ({ quiz, answers }) => {
    // Simple calculation logic for display
    let score = 0;
    const questions = quiz.questions || [];

    questions.forEach(q => {
        if (answers[q.id] === q.correctOptionId) {
            score++;
        }
    });

    const percentage = Math.round((score / questions.length) * 100);
    const isPassed = percentage >= 70;

    return (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isPassed ? 'bg-green-100' : 'bg-red-100'}`}>
                {isPassed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isPassed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h2>
            <p className="text-gray-500 mb-6">
                You scored {percentage}% ({score} out of {questions.length} correct)
            </p>

            <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                <div
                    className={`h-4 rounded-full ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <button className="flex items-center justify-center mx-auto px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50">
                <RefreshCw className="mr-2 h-4 w-4" />
                Retake Quiz
            </button>
        </div>
    );
};

export default QuizResults;
