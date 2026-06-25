import React from 'react';
import './About.css';
import brotherSisterImage from '@/assets/brother-sister-duo.jpg';
import { Flame, Heart, Leaf } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-20 bg-background relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" aria-hidden="true" />

            <div className="container mx-auto px-4">
                <header className="text-center mb-14">
                    <h2 className="font-bebas text-5xl md:text-7xl text-foreground tracking-wider mb-2">
                        WHY WE ROX
                    </h2>
                    <div className="w-16 h-1 bg-primary mx-auto mb-3" aria-hidden="true" />
                    <p className="font-allura text-2xl md:text-3xl text-primary" role="doc-subtitle">
                        Fresh burgers, honest flavours, zero shortcuts
                    </p>
                </header>

                {/* USP Cards */}
                <div className="grid sm:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
                    <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4 shadow-brand">
                            <Flame className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1.5">FLAME GRILLED</h3>
                        <p className="font-montserrat text-sm text-muted-foreground leading-relaxed">Every patty kissed by real flames for that smoky crunch.</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4 shadow-brand">
                            <Heart className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1.5">MADE WITH LOVE</h3>
                        <p className="font-montserrat text-sm text-muted-foreground leading-relaxed">Homemade sauces & recipes perfected over years.</p>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4 shadow-brand">
                            <Leaf className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1.5">FRESH DAILY</h3>
                        <p className="font-montserrat text-sm text-muted-foreground leading-relaxed">Quality ingredients, sourced fresh — no shortcuts ever.</p>
                    </div>
                </div>

                {/* Story section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
                    <div className="oval-image-wrapper">
                        <div className="oval-frame border-[6px] border-card ring-8 ring-primary/10 shadow-2xl">
                            <img src={brotherSisterImage} alt="Brother and Sister Duo - Founders of Burger Rox" className="oval-image" width="350" height="350" loading="lazy" decoding="async" />
                        </div>
                    </div>
                    <div className="space-y-5 lg:pl-4">
                        <h3 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wider">
                            OUR STORY
                        </h3>
                        <div className="w-12 h-1 bg-primary" aria-hidden="true" />
                        <p className="font-montserrat text-base text-muted-foreground leading-relaxed">
                            A brother-sister duo on a mission to serve fresh, crispy, and flavourful burgers – no shortcuts, no gimmicks.
                        </p>
                        <p className="font-montserrat text-base text-muted-foreground leading-relaxed">
                            She perfected her craft over years, winning over everyone lucky enough to grab a bite. He saw something bigger – a brand built on trust and real flavor. Quality ingredients, honest recipes, and burgers made with care.
                        </p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary" aria-hidden="true" />
        </section>
    );
};

export default About;
