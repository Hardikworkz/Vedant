import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import play from '../../assets/play.webp';
import './PlayJourney.css';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    keyword: "ENTER",
    step: "01",
    tagline: "Step through the door — leave reality behind.",
    highlights: ["60-min countdown", "Up to 8 players", "Cinematic briefing"],
    paragraphs: [
      `Your escape room experience in Bhopal begins the moment you walk through our doors. A live Game Master briefs your team on the mission — the story, the stakes, and the single objective: get out before time runs out.`,
      `Whether you're here with friends, family, or colleagues on a team building adventure, the pre-game ritual builds real tension, aligns your crew, and primes you for something unlike anything you've done before.`,
      `No prior experience needed. No special skills required. Just a sharp mind, a willing team, and the courage to step into the unknown together.`,
    ],
    img: play,
    stat: { value: "60", unit: "Minutes" },
  },
  {
    keyword: "DECODE",
    step: "02",
    tagline: "Every clue counts. Every second matters.",
    highlights: ["Multi-layer puzzles", "Live hint system", "Real-time pressure"],
    paragraphs: [
      `The clock starts ticking. The door locks behind you. Every object in the room is now a potential clue hiding in plain sight. Search, communicate, crack codes — and do it all before the timer hits zero.`,
      `House of Thrill's escape rooms in Bhopal are engineered to stress-test your logic, creativity, and teamwork simultaneously. You'll laugh, argue, panic, and celebrate — sometimes all within the same 60 seconds.`,
      `Stuck at a puzzle? Your Game Master is watching live and a hint is never more than a request away — but every second you spend asking is a second off the clock.`,
    ],
    img: play,
    stat: { value: "10+", unit: "Puzzles" },
  },
  {
    keyword: "ESCAPE",
    step: "03",
    tagline: "The rush of that final click — you'll never forget it.",
    highlights: ["Victory photo", "City leaderboard", "Book your next room"],
    paragraphs: [
      `The final lock clicks open. The door swings wide. And in that one moment — every second of confusion, every wrong turn, every frantic search — it all becomes worth it instantly.`,
      `Win or lose, you leave with something real. House of Thrill is among the highest-rated group activities in Bhopal — the go-to for birthday celebrations, corporate team outings, and unforgettable date nights.`,
      `Most players are booking their next room before they've caught their breath. The only question left is — which room are you taking on next?`,
    ],
    img: play,
    stat: { value: "98%", unit: "Would Return" },
  },
];

export default function PlayJourney() {
  const wrapperRef = useRef(null);
  const sectionRefs = useRef([]);
  const fillRefs = useRef([]);
  const imgRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const label = wrapperRef.current.querySelector(".adv-label");

          gsap.fromTo(
        wrapperRef.current,
        { scale: 0.85   },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 100%",   
            end: "top 0%",       
            scrub: 1.5,
          },
        }
      );

      gsap.fromTo(
        label,
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 88%",
            end: "top 58%",
            scrub: 1,
          },
        }
      );

      features.forEach((_, i) => {
        const section = sectionRefs.current[i];
        const fill = fillRefs.current[i];
        const img = imgRefs.current[i];
        const keywordWrap = section.querySelector(".adv-keyword-wrap");
        const tagline = section.querySelector(".adv-tagline");
        const paras = section.querySelectorAll(".adv-para");
        const textEls = [tagline, ...paras];

        gsap.set(fill, { clipPath: "inset(0 100% 0 0)" });
        gsap.set(keywordWrap, { opacity: 0, y: 28 });
        gsap.set(textEls, { opacity: 0, y: 28 });

        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 74%",
            end: "top 34%",
            scrub: 1,
          },
        }).to(keywordWrap, {
          opacity: 1,
          y: 0,
          ease: "none",
        });

        // Keyword fill: gray → red
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "top 25%",
            scrub: 1.2,
          },
        }).to(fill, {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
        });

        // Keyword unfill: red → gray on exit
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom 65%",
            end: "bottom 20%",
            scrub: 1.2,
          },
        }).to(fill, {
          clipPath: "inset(0 100% 0 0)",
          ease: "none",
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom 70%",
            end: "bottom 24%",
            scrub: 1,
          },
        }).to(keywordWrap, {
          opacity: 0.2,
          y: -20,
          ease: "none",
        });

        // Paragraphs stagger in
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            end: "top 5%",
            scrub: 1,
          },
        }).to(textEls, {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          ease: "none",
        });

        // Paragraphs fade out on exit
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom 75%",
            end: "bottom 30%",
            scrub: 1,
          },
        }).to(textEls, {
          opacity: 0,
          y: -22,
          stagger: 0.06,
          ease: "none",
        });

        // Image cross-fade in
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 65%",
            end: "top 20%",
            scrub: 1,
          },
        }).fromTo(img, { opacity: 0, scale: 0.88 }, { opacity: 1, scale: 1, ease: "none" });

        // Image fade out
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "bottom 65%",
            end: "bottom 15%",
            scrub: 1,
          },
        }).to(img, { opacity: 0, scale: 0.9, ease: "none" });
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="adv-wrapper" ref={wrapperRef}>
      <h3 className="adv-label">How the game unfolds</h3>

      <div className="adv-body">
        {/* LEFT — sticky image stack */}
        <div className="adv-left">
          <div className="adv-img-stack">
            {features.map((f, i) => (
              <img
                key={f.keyword}
                src={f.img}
                alt={f.keyword}
                className="adv-img"
                ref={(el) => (imgRefs.current[i] = el)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT — scrollable feature list */}
        <div className="adv-right">
          {features.map((f, i) => (
            <div
              className="adv-feature"
              key={f.keyword}
              ref={(el) => (sectionRefs.current[i] = el)}
            >
              <div className="adv-keyword-wrap">
                <span className="adv-keyword adv-keyword--base">{f.keyword}</span>
                <span
                  className="adv-keyword adv-keyword--fill"
                  ref={(el) => (fillRefs.current[i] = el)}
                >
                  {f.keyword}
                </span>
              </div>

              <p className="adv-tagline">{f.tagline}</p>

              {f.paragraphs.map((p, j) => (
                <p className="adv-para" key={j}>{p}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
