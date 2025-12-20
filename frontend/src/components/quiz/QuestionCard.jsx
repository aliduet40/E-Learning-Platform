import React from 'react';

const QuestionCard = ({ question, selectedOption, onSelectOption }) => {
    if (!question) return null;

    return (
        <div className="p-8">
            <h3 className="text-xl font-medium text-gray-900 mb-6">{question.text}</h3>
            <div className="space-y-3">
                {question.options.map((option) => (
                    <div
                        key={option.id}
                        onClick={() => onSelectOption(option.id)}
                        className={`
              p-4 rounded-lg border cursor-pointer transition-all flex items-center
              ${selectedOption === option.id
                                ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-500'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }
            `}
                    >
                        <div className={`
              w-5 h-5 rounded-full border flex items-center justify-center mr-3
              ${selectedOption === option.id
                                ? 'border-primary-600 bg-primary-600'
                                : 'border-gray-300 bg-white'
                            }
            `}>
                            {selectedOption === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={selectedOption === option.id ? 'text-primary-900 font-medium' : 'text-gray-700'}>
                            {option.text}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionCard;
