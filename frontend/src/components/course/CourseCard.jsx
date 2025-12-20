import React from 'react';
import { Star, User, Clock, Layers, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course, isFromMyLearning = false }) => {
    const {
        id,
        title,
        instructor_name,
        average_rating = 0,
        review_count = 0,
        thumbnail,
        total_duration = 0,
        price = 0,
        category_name
    } = course || {};

    const displayRating = Number(average_rating).toFixed(1);
    const displayThumbnail = thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070';

    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group flex flex-col h-full transform hover:-translate-y-1">
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
                <img
                    src={displayThumbnail}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-md text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        {category_name || 'General'}
                    </span>
                </div>
                {/* Price Tag Overlay */}
                <div className="absolute bottom-3 right-3">
                    <div className="bg-gray-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-sm font-black shadow-lg">
                        {price === 0 || price === "0.00" || !price ? 'FREE' : `$${price}`}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center text-[10px] font-bold text-muted-foreground mb-3 space-x-4 uppercase tracking-widest">
                    <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1.5 text-primary" />
                        {total_duration} min
                    </div>
                    <div className="flex items-center">
                        <Layers className="h-3 w-3 mr-1.5 text-primary" />
                        Lessons
                    </div>
                </div>

                <Link to={isFromMyLearning ? `/courses/${id}/learn` : `/courses/${id}`} className="block flex-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
                        {title}
                    </h3>
                </Link>

                <div className="flex items-center text-sm text-muted-foreground mb-4">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center mr-2 border border-border overflow-hidden">
                        {course?.instructor_avatar ? (
                            <img src={course.instructor_avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <User size={12} />
                        )}
                    </div>
                    <span className="font-medium truncate">{instructor_name}</span>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="flex items-center text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={12} className={i < Math.floor(average_rating) ? "fill-current" : "text-gray-200"} />
                            ))}
                            <span className="ml-2 text-sm font-black text-foreground">{displayRating}</span>
                        </div>
                        {!isFromMyLearning && (
                            <span className="text-[10px] text-muted-foreground font-bold ml-1">({review_count})</span>
                        )}
                    </div>

                    <Link to={isFromMyLearning ? `/courses/${id}/learn` : `/courses/${id}`} className="text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        <ChevronRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
