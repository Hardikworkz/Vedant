import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { rooms } from "../../lib/data";
import "./cards.css";

gsap.registerPlugin(ScrollTrigger);

const INITIAL_INDEX = rooms.length;
const MIN_DRAG_DISTANCE = 6;

const Demo = () => {
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const frameRef = useRef(null);
  const wheelTimeoutRef = useRef(null);
  const wheelFrameRef = useRef(null);
  const scrollTargetRef = useRef(0);
  const scrollEaseRef = useRef(0.16);
  const isDraggingRef = useRef(false);
  const activeIndexRef = useRef(INITIAL_INDEX);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef({
    pointerId: null,
    x: 0,
    scrollLeft: 0,
    moved: false,
  });
  const [activeIndex, setActiveIndex] = useState(INITIAL_INDEX);
  const [isDragging, setIsDragging] = useState(false);

  const totalItems = rooms.length;
  const loopedRooms = [...rooms, ...rooms, ...rooms];

  const clampScrollLeft = useCallback((value) => {
    const slider = scrollRef.current;
    if (!slider) return value;

    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    return Math.min(maxScroll, Math.max(0, value));
  }, []);

  const stopWheelAnimation = useCallback(() => {
    if (wheelFrameRef.current) {
      cancelAnimationFrame(wheelFrameRef.current);
      wheelFrameRef.current = null;
    }
  }, []);

  const queueSnapRestore = useCallback((delay = 160) => {
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);

    wheelTimeoutRef.current = setTimeout(() => {
      const slider = scrollRef.current;
      if (!slider || isDraggingRef.current) return;

      slider.style.scrollSnapType = "x mandatory";
      slider.style.scrollBehavior = "smooth";
    }, delay);
  }, []);

  const stepWheelScroll = useCallback(function stepWheelScroll() {
    const slider = scrollRef.current;
    if (!slider) {
      wheelFrameRef.current = null;
      return;
    }

    const diff = scrollTargetRef.current - slider.scrollLeft;
    if (Math.abs(diff) < 0.6) {
      slider.scrollLeft = scrollTargetRef.current;
      wheelFrameRef.current = null;
      queueSnapRestore();
      return;
    }

    slider.scrollLeft += diff * scrollEaseRef.current;
    wheelFrameRef.current = requestAnimationFrame(stepWheelScroll);
  }, [queueSnapRestore]);

  const startWheelScroll = useCallback(
    (targetLeft, { easing = 0.16 } = {}) => {
      const slider = scrollRef.current;
      if (!slider) return;

      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);

      slider.style.scrollSnapType = "none";
      slider.style.scrollBehavior = "auto";

      scrollEaseRef.current = easing;
      scrollTargetRef.current = clampScrollLeft(targetLeft);

      if (!wheelFrameRef.current) {
        wheelFrameRef.current = requestAnimationFrame(stepWheelScroll);
      }
    },
    [clampScrollLeft, stepWheelScroll]
  );

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return undefined;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      return undefined;
    }

    const section = slider.closest(".demo-stage");
    if (!section) return undefined;

    const context = gsap.context(() => {
      const heading = section.querySelector(".solutions-heading");
      const subtitle = section.querySelector(".solutions-subtitle");
      const controls = section.querySelectorAll(".scroller-btn");
      const cards = section.querySelectorAll(".card-frame");
      const images = section.querySelectorAll(".card-image-wrapper");
      const contentBlocks = section.querySelectorAll(".card-content");
      const cardText = section.querySelectorAll(
        ".card-tag, .card-title, .card-desc, .stat-item, .card-action-btn"
      );

      gsap.set([heading, subtitle, ...controls, ...cards, ...cardText], { autoAlpha: 1 });

      const introTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true,
        },
      });

      introTl
        .fromTo(
          heading,
          { y: 60, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.48, ease: "none" },
          0
        )
        .fromTo(
          subtitle,
          { y: 34, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.44, ease: "none" },
          0.08
        )
        .fromTo(
          controls,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06, ease: "none" },
          0.14
        )
        .fromTo(
          cards,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.03, ease: "none" },
          0.12
        )
        .fromTo(
          cardText,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.34, stagger: 0.01, ease: "none" },
          0.18
        );

      gsap.fromTo(
        images,
        { autoAlpha: 0.35 },
        {
          autoAlpha: 1,
          stagger: 0.05,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );

      gsap.fromTo(
        contentBlocks,
        { autoAlpha: 0.42 },
        {
          autoAlpha: 1,
          stagger: 0.05,
          duration: 0.55,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 72%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, section);

    return () => context.revert();
  }, []);

  const syncActiveCard = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const slider = scrollRef.current;
      if (!slider) return;

      const viewportCenter = slider.scrollLeft + slider.clientWidth / 2;
      let closestIndex = activeIndexRef.current;
      let closestDistance = Number.POSITIVE_INFINITY;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const firstCard = cardRefs.current[0];
      if (firstCard) {
        const computedStyles = window.getComputedStyle(slider);
        const gap = parseFloat(computedStyles.columnGap || computedStyles.gap || 0);
        const cardSpan = firstCard.offsetWidth + gap;
        const totalSetWidth = cardSpan * totalItems;

        // Circular Threshold Jump (Flick)
        // We jump only when we reach the absolute ends of the clones
        if (closestIndex <= 0) {
          slider.style.scrollSnapType = "none";
          slider.scrollLeft += totalSetWidth;
          scrollTargetRef.current += totalSetWidth;
          closestIndex += totalItems;
          requestAnimationFrame(() => {
            if (slider && !isDraggingRef.current) slider.style.scrollSnapType = "x mandatory";
          });
        } else if (closestIndex >= totalItems * 3 - 1) {
          slider.style.scrollSnapType = "none";
          slider.scrollLeft -= totalSetWidth;
          scrollTargetRef.current -= totalSetWidth;
          closestIndex -= totalItems;
          requestAnimationFrame(() => {
            if (slider && !isDraggingRef.current) slider.style.scrollSnapType = "x mandatory";
          });
        }
      }

      setActiveIndex(closestIndex);
    });
  }, [totalItems]);

  const getCardSlot = (index) => {
    const distance = index - activeIndex;
    if (distance === 0) return "center";
    if (distance === -1) return "left";
    if (distance === 1) return "right";
    if (distance === -2) return "far-left";
    if (distance === 2) return "far-right";
    return "hidden";
  };

  useEffect(() => {
    const slider = scrollRef.current;
    const targetCard = cardRefs.current[INITIAL_INDEX];

    if (!slider || !targetCard) return undefined;

    const centerCard = () => {
      slider.scrollLeft =
        targetCard.offsetLeft - (slider.clientWidth - targetCard.offsetWidth) / 2;
      scrollTargetRef.current = slider.scrollLeft;
      activeIndexRef.current = INITIAL_INDEX;
      setActiveIndex(INITIAL_INDEX);
    };

    centerCard();
    window.addEventListener("resize", centerCard);

    return () => {
      window.removeEventListener("resize", centerCard);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      stopWheelAnimation();
      if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    };
  }, [stopWheelAnimation]);

  const handleScroll = () => {
    syncActiveCard();
  };

  const handleWheel = (event) => {
    const slider = scrollRef.current;
    if (!slider) return;

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

    if (delta === 0) return;

    event.preventDefault();
    const baseTarget = wheelFrameRef.current ? scrollTargetRef.current : slider.scrollLeft;
    startWheelScroll(baseTarget + delta * 0.92, { easing: 0.14 });
  };

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const slider = scrollRef.current;
    if (!slider) return;

    stopWheelAnimation();
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);

    isDraggingRef.current = true;
    setIsDragging(true);
    slider.style.scrollSnapType = "none";
    slider.style.scrollBehavior = "auto";
    scrollTargetRef.current = slider.scrollLeft;

    dragStateRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      scrollLeft: slider.scrollLeft,
      moved: false,
    };

    suppressClickRef.current = false;
    slider.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!isDraggingRef.current) return;
    if (dragStateRef.current.pointerId !== event.pointerId) return;

    event.preventDefault();
    const slider = scrollRef.current;
    if (!slider) return;

    const walk = (event.clientX - dragStateRef.current.x) * 1.5;
    slider.scrollLeft = dragStateRef.current.scrollLeft - walk;

    if (Math.abs(walk) > MIN_DRAG_DISTANCE) {
      dragStateRef.current.moved = true;
      suppressClickRef.current = true;
    }
  };

  const resetDragState = () => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);
    const slider = scrollRef.current;
    if (slider) {
      scrollTargetRef.current = slider.scrollLeft;
      slider.style.scrollBehavior = "smooth";
      queueSnapRestore(70);
    }

    requestAnimationFrame(() => {
      suppressClickRef.current = false;
    });
  };

  const handlePointerUp = (event) => {
    if (
      dragStateRef.current.pointerId !== null &&
      dragStateRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const slider = scrollRef.current;
    if (slider) {
      slider.releasePointerCapture?.(event.pointerId);
    }

    dragStateRef.current.pointerId = null;
    resetDragState();
  };
  const scrollToIndex = useCallback(
    (targetIndex) => {
      const slider = scrollRef.current;
      if (!slider) return;

      let normalizedIndex = targetIndex;
      if (normalizedIndex < 0) normalizedIndex = 0;
      if (normalizedIndex >= totalItems * 3) normalizedIndex = totalItems * 3 - 1;

      const targetCard = cardRefs.current[normalizedIndex];
      if (!targetCard) return;

      startWheelScroll(
        targetCard.offsetLeft - (slider.clientWidth - targetCard.offsetWidth) / 2,
        { easing: 0.18 }
      );
    },
    [startWheelScroll, totalItems]
  );

  const handlePrev = useCallback(() => {
    scrollToIndex(activeIndexRef.current - 1);
  }, [scrollToIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(activeIndexRef.current + 1);
  }, [scrollToIndex]);

  const handlePointerCancel = () => {
    dragStateRef.current.pointerId = null;
    resetDragState();
  };

  const handleCardClickCapture = (event) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const getDifficulty = (rating) => {
    if (rating >= 4.9) return "Intense";
    if (rating >= 4.8) return "Advanced";
    return "Smart Fun";
  };

  return (
    <section className="demo-stage">
      <div className="solutions-section">
        <h1 className="solutions-heading">
          <span>BOOK</span>
          <span>YOUR EXPERIENCE</span>
        </h1>
        <p className="solutions-subtitle">
          Swipe through our signature rooms, explore the story, and choose the
          challenge that fits your crew.
        </p>
      </div>

      <div className="carousel-shell" data-lenis-prevent-horizontal>
        <button
          className="scroller-btn left"
          onClick={handlePrev}
          aria-label="Previous"
        >
          <span className="scroller-icon">&#8592;</span>
        </button>
        <button
          className="scroller-btn right"
          onClick={handleNext}
          aria-label="Next"
        >
          <span className="scroller-icon">&#8594;</span>
        </button>
        <div
          className={`slider-viewport ${isDragging ? "is-dragging" : ""}`}
          data-lenis-prevent-horizontal
          ref={scrollRef}
          onScroll={handleScroll}
          onWheelCapture={handleWheel}
          onPointerDownCapture={handlePointerDown}
          onPointerMoveCapture={handlePointerMove}
          onPointerUpCapture={handlePointerUp}
          onPointerCancelCapture={handlePointerCancel}
          onClickCapture={handleCardClickCapture}
        >
          {loopedRooms.map((room, index) => {
            const slot = getCardSlot(index);
            const logicalIndex = index % totalItems;

            return (
              <article
                key={`${room.name}-${index}`}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                className={`card-item slot-${slot}`}
                aria-hidden={slot === "hidden"}
              >
                <div className="card-frame" draggable="false">
                  <div className="card-image-wrapper" draggable="false">
                    <img src={room.image} alt={room.name} draggable="false" />
                    <div className="card-overlay" draggable="false" />
                    <div className="card-room-pill" aria-hidden="true">
                      Room #{logicalIndex + 1}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="card-tags" aria-hidden="true">
                      <span className="card-tag">Escape Room</span>
                      <span className="card-tag red">{getDifficulty(room.rating)}</span>
                    </div>

                    <h3 className="card-title">{room.name}</h3>
                    <p className="card-desc">{room.description}</p>

                    <div className="card-stats">
                      <div className="stat-item">
                        <span className="stat-label">Players</span>
                        <span className="stat-value">{room.players}+</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">{room.rating}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Duration</span>
                        <span className="stat-value">60 min</span>
                      </div>
                    </div>

                    <button className="card-action-btn">Book Experience</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Demo;
