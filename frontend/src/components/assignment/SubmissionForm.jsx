import React, { useState } from 'react';
import { UploadCloud, File, X } from 'lucide-react';

const SubmissionForm = ({ assignmentId, onSubmit }) => {
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState('');

    const handleFileChange = (e) => {
        // Mock file handling for UI
        const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
        setFiles([...files, ...newFiles]);
    };

    const removeFile = (v) => {
        setFiles(files.filter(f => f !== v));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ assignmentId, files, comment });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Submission</h3>

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload Files</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center">
                            <UploadCloud className="h-10 w-10 text-gray-400 mb-3" />
                            <span className="text-sm font-medium text-primary-600 hover:text-primary-500">Upload a file</span>
                            <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="flex items-center">
                                        <File className="w-4 h-4 text-gray-500 mr-2" />
                                        <span className="text-sm text-gray-700">{file.name}</span>
                                    </div>
                                    <button type="button" onClick={() => removeFile(file)} className="text-gray-400 hover:text-red-500">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
                    <textarea
                        rows="4"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Add any additional notes for the instructor..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-medium shadow-sm"
                    >
                        Submit Assignment
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmissionForm;
