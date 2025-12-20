import React from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    Users,
    Star,
    Award,
    ChevronRight,
    Play,
    CheckCircle2,
    Globe,
    Zap,
    GraduationCap,
    ArrowRight
} from 'lucide-react';

const Landing = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 text-center lg:text-left">
                            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold">
                                <Zap size={14} className="fill-primary" />
                                <span>Future of Learning is Here</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
                                Master New Skills <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
                                    With Confidence
                                </span>
                            </h1>

                            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Join over 10,000 students learning from top-tier instructors.
                                Access high-quality courses, interactive content, and earn certificates.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2">
                                        <span>Get Started Free</span>
                                        <ArrowRight size={20} />
                                    </button>
                                </Link>
                                <Link to="/courses" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-muted text-foreground font-bold rounded-2xl hover:bg-muted/80 transition-all flex items-center justify-center space-x-2">
                                        <Play size={20} className="fill-foreground" />
                                        <span>Browse Courses</span>
                                    </button>
                                </Link>
                            </div>

                            <div className="pt-8 flex items-center justify-center lg:justify-start space-x-8 opacity-60">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">10k+</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">Students</span>
                                </div>
                                <div className="h-8 w-px bg-border"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">500+</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">Courses</span>
                                </div>
                                <div className="h-8 w-px bg-border"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black">4.9/5</span>
                                    <span className="text-xs font-bold uppercase tracking-widest">Rating</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-2xl group-hover:bg-primary/30 transition-colors -z-10 rotate-3"></div>
                            <div className="relative bg-card border border-border p-2 rounded-[2.5rem] shadow-2xl overflow-hidden">
                                <img
                                    src="/src/assets/hero-landing.png"
                                    alt="Learning Platform"
                                    className="w-full h-auto rounded-[2rem] object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop';
                                    }}
                                />
                            </div>

                            {/* Floating elements */}
                            <div className="absolute -top-6 -right-6 bg-card border border-border p-4 rounded-2xl shadow-xl animate-bounce duration-[3000ms]">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-500 p-2 rounded-full">
                                        <CheckCircle2 className="text-white" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black">Certified Tutor</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expertise Verified</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-6 -left-6 bg-card border border-border p-4 rounded-2xl shadow-xl animate-pulse">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-primary p-2 rounded-full">
                                        <Star className="text-white fill-white" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black">4.9/5 Average</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Course Reviews</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Why Choose Us</h2>
                        <h3 className="text-4xl md:text-5xl font-black">Designed for Excellence</h3>
                        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                            We provide the tools and resources you need to achieve your goals and excel in your professional journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: <Globe className="text-primary" size={32} />,
                                title: "Learn Anywhere",
                                desc: "Access your courses on any device, anytime. Learn at your own pace."
                            },
                            {
                                icon: <GraduationCap className="text-primary" size={32} />,
                                title: "Expert Mentors",
                                desc: "Learn from industry professionals with years of practical experience."
                            },
                            {
                                icon: <BookOpen className="text-primary" size={32} />,
                                title: "Diverse Library",
                                desc: "Thousands of courses across tech, business, design, and more."
                            },
                            {
                                icon: <Award className="text-primary" size={32} />,
                                title: "Certification",
                                desc: "Earn prestigious certificates that enhance your resume and career."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group">
                                <div className="bg-muted p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Popular Categories */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                        <div className="space-y-4 text-center md:text-left">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Categories</h2>
                            <h3 className="text-4xl font-black">Explore Our Popular Topics</h3>
                        </div>
                        <Link to="/courses" className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-all">
                            View All Categories
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: "Development", count: "120+ Courses", color: "from-blue-500/10 to-blue-500/5" },
                            { name: "Business", count: "85+ Courses", color: "from-purple-500/10 to-purple-500/5" },
                            { name: "Design", count: "60+ Courses", color: "from-pink-500/10 to-pink-500/5" },
                            { name: "Marketing", count: "45+ Courses", color: "from-orange-500/10 to-orange-500/5" },
                            { name: "Finance", count: "30+ Courses", color: "from-green-500/10 to-green-500/5" },
                            { name: "Personal Growth", count: "50+ Courses", color: "from-yellow-500/10 to-yellow-500/5" },
                        ].map((cat, idx) => (
                            <div key={idx} className={`relative p-8 rounded-3xl bg-gradient-to-br ${cat.color} border border-border hover:border-primary/40 cursor-pointer transition-all group overflow-hidden`}>
                                <div className="relative z-10 transition-transform group-hover:translate-x-2">
                                    <h4 className="text-xl font-black mb-1">{cat.name}</h4>
                                    <p className="text-sm text-muted-foreground font-medium">{cat.count}</p>
                                </div>
                                <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                    <ChevronRight />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-primary/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Testimonials</h2>
                            <h3 className="text-4xl md:text-5xl font-black leading-tight">
                                What Our Students <br /> Say About Us
                            </h3>
                            <div className="space-y-6">
                                <div className="bg-card p-8 rounded-[2rem] border border-border shadow-xl relative">
                                    <div className="flex space-x-1 mb-4">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-lg italic text-foreground/80 leading-relaxed mb-6">
                                        "The quality of instructions and the platform's ease of use exceeded my expectations. I was able to transition into a developer role within 6 months of starting my first course here."
                                    </p>
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-full bg-muted overflow-hidden">
                                            <img src="https://i.pravatar.cc/150?u=1" alt="Student" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Sarah Jenkins</p>
                                            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Fullstack Developer</p>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 bg-primary text-white p-3 rounded-2xl rotate-12">
                                        <Users size={24} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { name: "Mike Ross", role: "UI/UX Designer", text: "Amazing curriculum and very supportive community. Highly recommended!" },
                                { name: "Elena Gilbert", role: "Data Scientist", text: "The hands-on projects helped me build a portfolio that got me hired." }
                            ].map((test, idx) => (
                                <div key={idx} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                                    <div className="flex space-x-1 mb-3">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}
                                    </div>
                                    <p className="text-sm text-foreground/70 mb-4 line-clamp-3">"{test.text}"</p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                                        <div>
                                            <p className="text-sm font-bold">{test.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-black">{test.role}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-primary rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                        <div className="relative z-10 space-y-8">
                            <h3 className="text-3xl md:text-6xl font-black text-white leading-tight">
                                Ready to Start Your <br /> Learning Journey?
                            </h3>
                            <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto">
                                Join our community of learners today and take the first step towards mastering your future.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                                <Link to="/signup" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-10 py-5 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-all shadow-xl">
                                        Create Free Account
                                    </button>
                                </Link>
                                <Link to="/courses" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-10 py-5 bg-primary-foreground/10 text-white font-black rounded-2xl border border-white/20 hover:bg-white/10 transition-all">
                                        Explore Courses
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary p-2 rounded-xl">
                                <BookOpen className="text-white" size={20} />
                            </div>
                            <span className="text-2xl font-black tracking-tight">EduPlatform</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-8">
                            <Link to="/courses" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Courses</Link>
                            <Link to="/about" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                            <Link to="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
                        </div>

                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
                            © 2025 EduPlatform. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
