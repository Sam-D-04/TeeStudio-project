"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HeroParallax() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { innerWidth, innerHeight } = window;
      // Calculate mouse position relative to center of screen (-1 to 1)
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setOffset({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{ minHeight: "calc(100vh - 64px)", paddingBottom: "4rem" }}
    >
      <div className="w-full max-w-[1500px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Slogan and CTA */}
      <div className="z-10 flex-1 max-w-2xl mt-16 md:mt-0 text-center md:text-left flex flex-col items-center md:items-start gap-6">
        <h1 
          className="text-5xl md:text-7xl font-extrabold text-slate-800 leading-tight tracking-tight"
          style={{
            transform: `translate(${offset.x * -10}px, ${offset.y * -10}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          Thiết kế <span className="text-sky-500">chất riêng</span><br />
          In ấn siêu tốc
        </h1>
        
        <p 
          className="text-lg md:text-xl text-slate-600 font-medium max-w-lg"
          style={{
            transform: `translate(${offset.x * -5}px, ${offset.y * -5}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          Trải nghiệm công cụ thiết kế lơ lửng hiện đại. Đặt áo theo yêu cầu chỉ với vài cú click chuột.
        </p>

        <div
          style={{
            transform: `translate(${offset.x * -2}px, ${offset.y * -2}px)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          <Link href="/design-studio" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all bg-sky-500 rounded-full shadow-lg hover:bg-sky-600 hover:-translate-y-1 hover:shadow-sky-500/30">
            Khám phá Design Studio
            <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </Link>
        </div>
      </div>

      {/* 3D Floating Mockups */}
      <div className="flex-1 relative w-full h-[400px] md:h-[600px] mt-12 md:mt-0 pointer-events-none">
        
        {/* Main Floating T-shirt */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[450px] animate-float z-20"
          style={{
            transform: `translate(calc(-50% + ${offset.x * 30}px), calc(-50% + ${offset.y * 30}px)) rotate(${offset.x * 5}deg)`,
            transition: "transform 0.15s ease-out",
            filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.2))"
          }}
        >
          <Image 
            src="/mockups/tshirt-white-front.png" 
            alt="T-shirt Mockup" 
            width={500} 
            height={500}
            className="w-full h-auto object-contain"
            priority
            unoptimized
          />
        </div>

        {/* Background elements */}
        <div 
          className="absolute top-[20%] left-[10%] w-[120px] md:w-[200px] opacity-40 blur-sm z-10"
          style={{
            transform: `translate(${offset.x * 60}px, ${offset.y * 60}px) rotate(-15deg)`,
            transition: "transform 0.2s ease-out"
          }}
        >
          <Image 
            src="/mockups/tshirt-black-front.png" 
            alt="Bg Mockup" 
            width={200} 
            height={200}
            className="w-full h-auto object-contain"
            unoptimized
          />
        </div>

        <div 
          className="absolute bottom-[10%] right-[10%] w-[150px] md:w-[250px] opacity-50 blur-[2px] z-30"
          style={{
            transform: `translate(${offset.x * -40}px, ${offset.y * -40}px) rotate(10deg)`,
            transition: "transform 0.1s ease-out"
          }}
        >
          <Image 
            src="/mockups/tshirt-white-front.png" 
            alt="Bg Mockup" 
            width={250} 
            height={250}
            className="w-full h-auto object-contain"
            style={{ filter: "blur(2px)", transform: "scaleX(-1)" }}
            unoptimized
          />
        </div>
        </div>
      </div>
    </section>
  );
}
