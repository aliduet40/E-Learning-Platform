import React from 'react';
import { Search, Filter, X } from 'lucide-react';

const CourseFilters = ({ onSearch, onCategoryChange, categories = [], selectedCategories = [] }) => {
    return (
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-8 sticky top-24">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center">
                    <Filter size={18} className="mr-2 text-primary" /> Filters
                </h2>
                <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    Reset
                </button>
            </div>

            {/* Search Input */}
            <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Search</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-sm placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                        placeholder="Search for anything..."
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Categories</h3>
                <div className="space-y-2.5">
                    {categories.map((category) => (
                        <label
                            key={category.id}
                            className="flex items-center group cursor-pointer"
                        >
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer appearance-none h-5 w-5 bg-background border border-input rounded-md checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => onCategoryChange(category.id)}
                                />
                                <div className="absolute text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <span className="ml-3 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {category.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Price Filter Mockups for UX */}
            <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                    {['Beginner', 'Intermediate', 'Expert'].map(level => (
                        <button key={level} className="px-3 py-1.5 rounded-lg border border-border text-[10px] font-bold uppercase tracking-tight hover:bg-muted transition-colors">
                            {level}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CourseFilters;
