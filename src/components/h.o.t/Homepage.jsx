import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { BsArrowReturnRight } from "react-icons/bs";
import 'lenis/dist/lenis.css';
import MetalKeyCanvas from '../MetalKeyCanvas';
import Demo from './Demo';
import PlayJourney from './PlayJourney';
import './Homepage.css';

gsap.registerPlugin(ScrollTrigger);

const MOBILE_BREAKPOINT = 760;
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT}px)`;

const Homepage = () => {
    const keyRef = useRef(null);
    const mobileKeyRef = useRef(null);
    const showcaseRef = useRef(null);
    const homepageRef = useRef(null);
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia(MOBILE_QUERY).matches;
    });
    const [isStatic, setIsStatic] = useState(isMobile);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const lenis = new Lenis({
            duration: 1.15,
            smoothWheel: true,
            gestureOrientation: 'vertical',
            touchMultiplier: 1.1,
        });

        const onLenisScroll = () => ScrollTrigger.update();
        const onTick = (time) => lenis.raf(time * 1000);

        lenis.on('scroll', onLenisScroll);
        gsap.ticker.add(onTick);
        gsap.ticker.lagSmoothing(0);

        const refreshOnResize = () => ScrollTrigger.refresh();
        window.addEventListener('resize', refreshOnResize);

        return () => {
            window.removeEventListener('resize', refreshOnResize);
            lenis.off?.('scroll', onLenisScroll);
            lenis.destroy();
            gsap.ticker.remove(onTick);
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia(MOBILE_QUERY);
        const handleChange = (event) => setIsMobile(event.matches);

        setIsMobile(mediaQuery.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    useEffect(() => {
        setIsStatic(isMobile);
    }, [isMobile]);

    useEffect(() => {
        if (!keyRef.current || !homepageRef.current || !showcaseRef.current) {
            return undefined;
        }

        const context = gsap.context(() => {
            const demoStage = showcaseRef.current.querySelector('.demo-stage');
            const sequenceEl = keyRef.current.querySelector('.animation-sequence');

            gsap.set(keyRef.current, {
                x: 0,
                y: 0,
                rotation: 0,
                scale: 1,
                opacity: 1,
                pointerEvents: 'none',
                transformOrigin: '50% 50%',
                immediateRender: true,
            });

            if (sequenceEl) {
                gsap.set(sequenceEl, {
                    rotation: 0,
                    transformOrigin: '50% 50%',
                    immediateRender: true,
                });
            }

            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: homepageRef.current,
                    start: 'top top',
                    endTrigger: demoStage || showcaseRef.current,
                    end: demoStage ? 'bottom top' : 'bottom top',
                    scrub: 1.5,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => setIsStatic(self.progress > 0.88),
                },
            });

            timeline.to(keyRef.current, {
                x: () => {
                    const parent = keyRef.current?.parentElement;

                    if (!parent) {
                        return 0;
                    }

                    const rect = parent.getBoundingClientRect();
                    return (window.innerWidth / 2) - (rect.left + rect.width / 2);
                },
                y: 0,
                opacity: 1,
                duration: 0.65,
                ease: 'none',
                immediateRender: false,
            }, 0);

            if (sequenceEl) {
                timeline.to(sequenceEl, {
                    rotation: 80,
                    duration: 0.65,
                    ease: 'none',
                    immediateRender: false,
                }, 0);
            }

            gsap.to(keyRef.current, {
                autoAlpha: 0,
                ease: 'none',
                immediateRender: false,
                scrollTrigger: {
                    trigger: demoStage || homepageRef.current,
                    start: demoStage ? 'top 68%' : 'bottom 45%',
                    end: demoStage ? 'top 28%' : 'bottom top',
                    scrub: true,
                    invalidateOnRefresh: true,
                },
            });
        }, showcaseRef);

        ScrollTrigger.refresh();

        return () => context.revert();
    }, [isMobile]);

    useEffect(() => {
        if (!homepageRef.current || !showcaseRef.current) {
            return undefined;
        }

        const reduceMotion =
            typeof window !== 'undefined' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            return undefined;
        }

        const context = gsap.context(() => {
            const heroTitle = homepageRef.current.querySelector('.hero-title');
            const kicker = homepageRef.current.querySelector('.hero-kicker');
            const titleLines = [...homepageRef.current.querySelectorAll('.hero-title-line')];
            const cta = homepageRef.current.querySelector('.hero-cta');
            const lowerText = [
                ...homepageRef.current.querySelectorAll('.hero-support, .hero-powered'),
            ];
            const mobileKey = mobileKeyRef.current;

            if (!heroTitle) {
                return;
            }

            gsap.set([kicker, ...titleLines, cta, ...lowerText, mobileKey].filter(Boolean), {
                autoAlpha: 1,
            });

            const introTl = gsap.timeline({
                defaults: { ease: 'power3.out' },
            });

            introTl
                .fromTo(
                    kicker,
                    { y: 18, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.56 },
                    0
                )
                .fromTo(
                    titleLines,
                    { y: 36, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.82, stagger: 0.08 },
                    0.08
                )
                .fromTo(
                    cta,
                    { y: 28, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.7 },
                    0.3
                )
                .fromTo(
                    lowerText,
                    { y: 24, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.62, stagger: 0.08 },
                    0.38
                );

            if (mobileKey) {
                introTl.fromTo(
                    mobileKey,
                    { y: 22, scale: 1, autoAlpha: 0 },
                    { y: 0, scale: 1, autoAlpha: 1, duration: 0.78, ease: 'power2.out' },
                    0.14
                );
            }

            if (isMobile) {
                gsap.set([kicker, ...titleLines, cta, ...lowerText].filter(Boolean), {
                    autoAlpha: 1,
                    y: 0,
                });
                return;
            }

            gsap.to([kicker, ...titleLines], {
                y: -12,
                autoAlpha: 0.78,
                ease: 'none',
                stagger: 0.04,
                scrollTrigger: {
                    trigger: homepageRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });

            if (cta || lowerText.length) {
                gsap.to([cta, ...lowerText].filter(Boolean), {
                    y: -16,
                    autoAlpha: 0.68,
                    ease: 'none',
                    stagger: 0.05,
                    scrollTrigger: {
                        trigger: homepageRef.current,
                        start: 'top 5%',
                        end: 'bottom top',
                        scrub: true,
                    },
                });
            }

            if (!isMobile && keyRef.current) {
                gsap.fromTo(
                    '.brand-image-box',
                    { autoAlpha: 0, scale: 1 },
                    {
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.9,
                        ease: 'power2.out',
                    }
                );
            }
        }, showcaseRef);

        return () => context.revert();
    }, [isMobile]);

    const renderHeroTitle = () => (
        <h1 className="hero-title">
            <span className="hero-title-line">Launch Manage</span>
            <span className="hero-title-line">Lead your</span>
            <span className="hero-title-line hero-title-red">Thrill.</span>
        </h1>
    );

    return (
    <div className={`hot-showcase${isMobile ? ' is-mobile' : ''}`} ref={showcaseRef}>
        <div className="shared-key-layer" aria-hidden="true">
            {!isMobile ? (
                <div className="brand-image-box">
                    <div className="key-stage" ref={keyRef}>
                        <div
                            className="animation-wrapper"
                            style={{ animationPlayState: isStatic ? 'paused' : 'running' }}
                        >
                            <div className="animation-sequence">
                                <MetalKeyCanvas isStatic={isStatic} />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mobile-key-box" ref={mobileKeyRef}>
                    <div className="mobile-key-stage" ref={keyRef}>
                        <div
                            className="animation-wrapper"
                            style={{ animationPlayState: isStatic ? 'paused' : 'running' }}
                        >
                            <div className="animation-sequence">
                                <MetalKeyCanvas isStatic={isStatic} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <section className="homepage-container" ref={homepageRef}>
            <main className="content-grid">
                <div className="hero-copy">
                    <div className="hero-kicker-wrap">
                        <p className="hero-kicker">
                            Escape Rooms · VR <br/> Gaming · Axe Throwing · Archery
                        </p>
                    </div>

                    <div className="hero-main-wrap">
                        {isMobile ? (
                            <div className="hero-mobile-top">
                                <div className="hero-title-wrap">
                                    {renderHeroTitle()}
                                </div>
                                
                            </div>
                        ) : (
                            renderHeroTitle()
                        )}
                    </div>

                    <div className="hero-cta-wrap">
                        <a className="hero-cta" href="#book-now" aria-label="Book your adventure now">
                            <span>Book Your Adventure</span>
                            <span className="hero-cta-arrow"><BsArrowReturnRight /></span>
                        </a>
                    </div>

                    <div className="hero-lower-wrap">
                        <p className="hero-support">
                              The ultimate entertainment destination. Perfect for friends, families, corporate team-building, and birthday parties. Book your adventure today.
                        </p>

                        <p className="hero-powered">
                            Powered by <span>Trill Platform</span>
                        </p>
                    </div>
                </div>
            </main>
        </section>

        <div className="first-demo-trigger">
            <Demo />
            <PlayJourney />
        </div>
    </div>
    );
};

export default Homepage;
