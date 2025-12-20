import React, { useState } from 'react';
import StarRating from './StarRating';

const ReviewForm = ({ onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) return; // Prevent submission without rating
        onSubmit({ rating, comment });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                <StarRating rating={rating} onChange={setRating} size={24} />
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                <textarea
                    rows="4"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us about your experience..."
                    required
                />
            </div>

            <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium"
            >
                Submit Review
            </button>
        </form>
    );
};

export default ReviewForm;
