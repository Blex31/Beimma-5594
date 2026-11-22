import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // Delay in milliseconds
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number; // Duration in milliseconds
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  duration = 400,
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If the browser doesn't support IntersectionObserver, show it immediately
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        }
      },
      {
        threshold: 0.05, // Trigger when 5% of the item is in viewport
        rootMargin: "0px 0px -20px 0px", // Trigger slightly before it scrolls too far in
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  const directionClasses = {
    up: "translate-y-6",
    down: "-translate-y-6",
    left: "translate-x-6",
    right: "-translate-x-6",
    none: "",
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "transition-all ease-out",
        isVisible
          ? "opacity-100 translate-y-0 translate-x-0"
          : cn("opacity-0", directionClasses[direction]),
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
