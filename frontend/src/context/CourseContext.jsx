import React, { createContext, useContext, useState } from 'react';

const CourseContext = createContext();

export const useCourse = () => useContext(CourseContext);

export const CourseProvider = ({ children }) => {
    const [currentCourse, setCurrentCourse] = useState(null);
    const [courseProgress, setCourseProgress] = useState({});

    const selectCourse = (course) => {
        setCurrentCourse(course);
    };

    const updateProgress = (courseId, progressData) => {
        setCourseProgress(prev => ({
            ...prev,
            [courseId]: progressData
        }));
    };

    return (
        <CourseContext.Provider value={{ currentCourse, selectCourse, courseProgress, updateProgress }}>
            {children}
        </CourseContext.Provider>
    );
};
