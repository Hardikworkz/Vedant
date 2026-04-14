import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
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
        if (isMobile || !keyRef.current || !homepageRef.current) {
            return undefined;
        }

        const context = gsap.context(() => {
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
                    end: 'bottom top',
                    scrub: 1.5,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => setIsStatic(self.progress > 0.65),
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

            timeline.to(keyRef.current, {
                opacity: 0,
                pointerEvents: 'none',
                duration: 0.35,
                ease: 'power2.in',
                immediateRender: false,
            }, 0.65);
        }, homepageRef);

        ScrollTrigger.refresh();

        return () => context.revert();
    }, [isMobile]);

    const renderHeroTitle = () => (
        <h1 className="hero-title">
            <span>Escape.</span>
            <span>Solve.</span>
            <span>Unlock your</span>
            <span className="hero-title-red">Thrill.</span>
        </h1>
    );

    return (
        <div className={`hot-showcase${isMobile ? ' is-mobile' : ''}`}>
            {!isMobile && (
                <div className="shared-key-layer" aria-hidden="true">
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
                </div>
            )}

            <section className="homepage-container" ref={homepageRef}>
                <main className="content-grid">
                    <div className="hero-copy">
                        {isMobile ? (
                            <div className="hero-mobile-top">
                                <div className="hero-title-wrap">
                                    {renderHeroTitle()}
                                </div>
                                <div className="mobile-key-box" aria-hidden="true">
                                    <MetalKeyCanvas isStatic />
                                </div>
                            </div>
                        ) : (
                            renderHeroTitle()
                        )}

                        <a className="hero-cta" href="#book-now" aria-label="Book now">
                            <span>Book Now</span>
                            <span className="hero-cta-arrow">-&gt;</span>
                        </a>
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