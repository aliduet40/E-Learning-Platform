import React, { useState, useEffect } from 'react';
import { Award, Download, BookOpen } from 'lucide-react';
import * as courseApi from '../../api/courses.api';
import Loader from '../../components/common/Loader';

const Certificates = () => {
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificates = async () => {
            try {
                setLoading(true);
                const response = await courseApi.getEnrolledCourses();
                // Filter for completed courses (progress === 100 or completed_at is not null)
                // Note: The API returns `enrollments` joined with `courses`.
                const courses = response.data.data || [];
                const completed = courses.filter(c => c.progress === 100 || c.completed_at);
                setCertificates(completed);
            } catch (error) {
                console.error("Failed to load certificates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, []);

    if (loading) return <div className="flex justify-center py-20"><Loader /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-black text-foreground tracking-tight">My Certificates</h1>

            {certificates.length === 0 ? (
                <div className="text-center py-24 bg-card rounded-3xl border-2 border-dashed border-border shadow-sm">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                        <Award size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-foreground">No certificates yet</h3>
                    <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
                        Complete a course to earn your first certificate!
                    </p>
                    <div className="mt-8">
                        <a href="/student/dashboard" className="inline-flex items-center px-8 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                            Go to Dashboard
                        </a>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.map(cert => (
                        <div key={cert.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-all group">
                            <div className="bg-emerald-100 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                                <Award className="h-10 w-10 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-1">{cert.title}</h3>
                            <p className="text-muted-foreground text-sm">
                                Completed on {cert.completed_at ? new Date(cert.completed_at).toLocaleDateString() : 'Just now'}
                            </p>
                            <p className="text-foreground font-medium mt-2">Grade: {cert.grade || '100%'}</p>

                            <button className="mt-6 flex items-center px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary hover:text-white transition-all">
                                <Download className="mr-2 h-4 w-4" /> Download PDF
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Certificates;
