import React from 'react';
import './About.css';
import brotherSisterImage from '@/assets/brother-sister-duo.jpg';
import { Flame, Heart, Leaf } from 'lucide-react';

const About = () => {
    return (
        <section id="about" className="py-20 bg-card relative overflow-hidden">
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
                    <div className="text-center p-6 rounded-xl bg-background border border-border hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                            <Flame className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1">FLAME GRILLED</h3>
                        <p className="font-montserrat text-sm text-muted-foreground">Every patty kissed by real flames for that smoky crunch.</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-background border border-border hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                            <Heart className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1">MADE WITH LOVE</h3>
                        <p className="font-montserrat text-sm text-muted-foreground">Homemade sauces & recipes perfected over years.</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-background border border-border hover:border-primary transition-all duration-300" style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-4">
                            <Leaf className="h-7 w-7 text-primary-foreground" />
                        </div>
                        <h3 className="font-bebas text-2xl text-foreground tracking-wide mb-1">FRESH DAILY</h3>
                        <p className="font-montserrat text-sm text-muted-foreground">Quality ingredients, sourced fresh — no shortcuts ever.</p>
                    </div>
                </div>

                {/* Story section */}
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="oval-image-wrapper">
                        <div className="oval-frame">
                            <img src={brotherSisterImage} alt="Brother and Sister Duo - Founders of Burger Rox" className="oval-image" width="350" height="350" loading="lazy" decoding="async" />
                        </div>
                    </div>
                    <div className="space-y-5">
                        <h3 className="font-bebas text-3xl md:text-4xl text-foreground tracking-wider">
                            OUR STORY
                        </h3>
                        <div className="w-12 h-1 bg-primary" aria-hidden="true" />
                        <p className="font-montserrat text-base md:text-lg text-muted-foreground leading-relaxed">
                            A brother-sister duo on a mission to serve fresh, crispy, and flavourful burgers – no shortcuts, no gimmicks.
                        </p>
                        <p className="font-montserrat text-base md:text-lg text-muted-foreground leading-relaxed">
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
