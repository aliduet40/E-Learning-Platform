import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onChange, readonly = false, size = 20 }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || rating);

                return (
                    <button
                        key={star}
                        type="button"
                        disabled={readonly}
                        className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
                        onClick={() => onChange && onChange(star)}
                        onMouseEnter={() => !readonly && setHoverRating(star)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                    >
                        <Star
                            size={size}
                            className={`${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
