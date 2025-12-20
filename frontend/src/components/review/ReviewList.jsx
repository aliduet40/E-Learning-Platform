import React from 'react';
import StarRating from './StarRating';
import { User } from 'lucide-react';

const ReviewList = ({ reviews = [] }) => {
    if (reviews.length === 0) {
        return <div className="text-gray-500">No reviews yet. Be the first to review!</div>;
    }

    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <div key={review.id} className="border-b border-border/50 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center mb-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-3 overflow-hidden">
                            {review.student_avatar ? (
                                <img src={review.student_avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <User size={14} className="text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-foreground">{review.student_name}</div>
                            <div className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <StarRating rating={review.rating} readonly size={16} />
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{review.review}</p>
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
