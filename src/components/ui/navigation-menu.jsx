"use client";

import * as React from "react";
import { motion as Motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "House of Thrill", href: "#" },
  { name: "Mini H.O.T", href: "#" },
  { name: "Book Now", href: "#" },
];

const EXPAND_SCROLL_THRESHOLD = 80;

const containerVariants = {
  expanded: {
    y: 0,
    opacity: 1,
    width: "max-content",
    transition: {
      y: { type: "spring", damping: 18, stiffness: 250 },
      opacity: { duration: 0.3 },
      type: "spring",
      damping: 20,
      stiffness: 300,
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    width: "3.5rem",
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 300,
      when: "afterChildren",
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const logoVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: { opacity: 0, x: -25, rotate: -180, transition: { duration: 0.3 } },
};

const itemVariants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: { opacity: 0, x: -20, scale: 0.95, transition: { duration: 0.2 } },
};

const collapsedIconVariants = {
  expanded: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  collapsed: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 300,
      delay: 0.15,
    },
  },
};

export function AnimatedNavFramer() {
  const [isExpanded, setExpanded] = React.useState(true);

  const { scrollY } = useScroll();
  const lastScrollY = React.useRef(0);
  const scrollPositionOnCollapse = React.useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;

    if (isExpanded && latest > previous && latest > 150) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      setExpanded(true);
    }

    lastScrollY.current = latest;
  });

  const handleNavClick = (e) => {
    if (!isExpanded) {
      e.preventDefault();
      setExpanded(true);
    }
  };

  return (
    <div className="fixed top-3 sm:top-6 left-1/2 -translate-x-1/2 z-50">
      <Motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={containerVariants}
        whileHover={!isExpanded ? { scale: 1.1 } : {}}
        whileTap={!isExpanded ? { scale: 0.95 } : {}}
        onClick={handleNavClick}
        className={cn(
          "w-max max-w-[calc(100vw-14px)] flex items-center overflow-hidden rounded-full border border-white/55 bg-[#d8dadd]/95 text-[#5f718b] shadow-[0_8px_22px_rgba(0,0,0,0.22)] backdrop-blur-sm min-h-[3.65rem] sm:min-h-14 h-auto py-2 px-1.5 sm:px-2",
          !isExpanded && "cursor-pointer justify-center"
        )}
      >
        <Motion.div
          variants={logoVariants}
          className="flex-shrink-0 flex items-center font-semibold pl-1.5 pr-2 sm:pr-3"
        >
          <img
            src="/navbar-logo.jpg"
            alt="Brand logo"
            className="h-10 w-10 rounded-full object-cover ring-1 ring-black/25"
            loading="eager"
            decoding="async"
          />
        </Motion.div>

        <Motion.div
          className={cn(
            "min-w-0 flex items-center flex-nowrap gap-0.5 sm:gap-7 pr-1.5 sm:pr-4",
            !isExpanded && "pointer-events-none"
          )}
        >
          {navItems.map((item) => (
            <Motion.a
              key={item.name}
              href={item.href}
              variants={itemVariants}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "text-[0.9rem] sm:text-sm font-semibold leading-tight flex-shrink-0 text-[#5f718b] hover:text-[#42546d] transition-colors px-1 sm:px-0 py-1 inline-flex items-center justify-center text-center",
                item.name === "House of Thrill" &&
                  "whitespace-normal max-w-[5.4rem] sm:max-w-none sm:whitespace-nowrap",
                item.name !== "House of Thrill" && "whitespace-nowrap"
              )}
            >
              {item.name}
            </Motion.a>
          ))}
        </Motion.div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Motion.div
            variants={collapsedIconVariants}
            animate={isExpanded ? "expanded" : "collapsed"}
          >
            <Menu className="h-6 w-6" />
          </Motion.div>
        </div>
      </Motion.nav>
    </div>
  );
}
