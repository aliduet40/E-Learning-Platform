import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import QuizResults from './QuizResults';

const QuizInterface = ({ quiz, onComplete }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!quiz) return <div>Loading quiz...</div>;

    const questions = quiz.questions || [];
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    const handleAnswerSelect = (questionId, optionId) => {
        setAnswers({ ...answers, [questionId]: optionId });
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsSubmitted(true);
            onComplete && onComplete(answers);
        } else {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    if (isSubmitted) {
        return <QuizResults quiz={quiz} answers={answers} />;
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>Time Remaining: 10:00</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <QuestionCard
                    question={currentQuestion}
                    selectedOption={answers[currentQuestion?.id]}
                    onSelectOption={(optId) => handleAnswerSelect(currentQuestion?.id, optId)}
                />

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-gray-600 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
                    >
                        {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizInterface;
