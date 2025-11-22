'use client'
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link!
import { assets } from '@/assets/assets';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 1. Add buttonHref property for navigation
  const slides = [
    { 
      src: assets.car1, 
      alt: 'Slide 1',
      subtitle: 'RICK OWENS, Vetements, + MORE',
      title: 'Trending Denim + Pants',
      buttonText: 'SHOP NOW',
      buttonHref: '/shop'
    },
    { 
      src: assets.car2, 
      alt: 'Slide 2',
      subtitle: 'NEW COLLECTION',
      title: 'Footware Favorites',
      buttonText: 'EXPLORE',
      buttonHref: '/shop'
    },
    { 
      src: assets.car3, 
      alt: 'Slide 3',
      subtitle: 'EXCLUSIVE DROPS',
      title: 'Limited Edition',
      buttonText: 'VIEW MORE',
      buttonHref: '/shop'
    },
    { 
      src: assets.car4, 
      alt: 'Slide 4',
      subtitle: 'TRENDING NOW',
      title: 'Street Style',
      buttonText: 'CREATE STORE',
      buttonHref: '/create-store'
    },
    { 
      src: assets.car5, 
      alt: 'Slide 5',
      subtitle: 'BEST SELLERS',
      title: 'Customer Favorites',
      buttonText: 'DISCOVER',
      buttonHref: '/shop'
    },
    { 
      src: assets.car6, 
      alt: 'Slide 6',
      subtitle: 'SPRING COLLECTION',
      title: 'Fresh Arrivals',
      buttonText: 'LOGIN',
      buttonHref: '/login'
    },
    { 
      src: assets.car7, 
      alt: 'Slide 7',
      subtitle: 'PREMIUM QUALITY',
      title: 'Luxury Pieces',
      buttonText: 'EXPLORE',
      buttonHref: '/shop'
    },
    { 
      src: assets.car8, 
      alt: 'Slide 8',
      subtitle: 'SALE EVENT',
      title: 'Up to 50% Off',
      buttonText: 'SHOP SALE',
      buttonHref: '/shop'
    },
    { 
      src: assets.car9, 
      alt: 'Slide 9',
      subtitle: 'FINAL PIECES',
      title: 'Last Chance',
      buttonText: 'SHOP NOW',
      buttonHref: '/shop'
    },
  ];

  const nextSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prevIndex) => prevIndex - 1);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning]);

  const goToSlide = (index) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  // Get the actual index for rendering (loops infinitely)
  const getSlideIndex = (index) => {
    return ((index % slides.length) + slides.length) % slides.length;
  };

  return (
    <section className="w-full relative overflow-hidden">
      <div className="relative w-full h-0 pb-[100%] sm:pb-[85%] md:pb-[37.5%] overflow-hidden bg-black">
        
        {/* Navigation Arrow Left */}
        <button 
          className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 z-[15] bg-white/10 backdrop-blur-sm border-0 text-white w-9 h-9 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 rounded"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Carousel Slides Container */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[currentIndex - 1, currentIndex, currentIndex + 1].map((position) => {
            const slideIndex = getSlideIndex(position);
            const slide = slides[slideIndex];
            
            return (
              <div
                key={position}
                className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(${(position - currentIndex) * 100}%)`,
                  zIndex: position === currentIndex ? 1 : 0,
                }}
              >
                {/* Image */}
                <Image 
                  src={slide.src} 
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={slideIndex === 0}
                  sizes="100vw"
                />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/30 to-black/40"></div>
                
                {/* Text Content - Attached to this slide */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white w-[90%] max-w-[600px]">
                  <h3 className="text-[0.6875rem] sm:text-[0.75rem] md:text-[0.875rem] font-medium tracking-[1.5px] md:tracking-[2px] uppercase mb-2 md:mb-3 opacity-95">
                    {slide.subtitle}
                  </h3>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-5 md:mb-8 leading-tight tracking-tight">
                    {slide.title}
                  </h1>
                  {/* 3. Use Link to wrap the button */}
                  <Link href={slide.buttonHref} passHref>
                    <button className="inline-block px-7 sm:px-8 md:px-10 py-2.5 md:py-3.5 bg-transparent text-white border-2 border-white text-[0.75rem] sm:text-[0.8125rem] md:text-[0.875rem] font-semibold tracking-[1.5px] uppercase cursor-pointer transition-all hover:bg-white hover:text-black hover:-translate-y-0.5 active:translate-y-0">
                      {slide.buttonText}
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrow Right */}
        <button 
          className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 z-[15] bg-white/10 backdrop-blur-sm border-0 text-white w-9 h-9 md:w-12 md:h-12 flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 rounded"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 md:gap-2.5 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border-0 cursor-pointer transition-all p-0 ${
                getSlideIndex(currentIndex) === index 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageCarousel;
