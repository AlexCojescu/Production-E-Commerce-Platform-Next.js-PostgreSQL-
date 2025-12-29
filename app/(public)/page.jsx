'use client'
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import LatestProducts from "@/components/LatestProducts";
import ImageCarousel from "@/components/ImageCarousel";
import CuratedDrop from "@/components/CuratedDrop";
import CuratedDrop1 from "@/components/CuratedDrop1";
import CuratedDrop2 from "@/components/CuratedDrop2";

export default function Home() {
    return (
      <div className="min-h-screen bg-white">
        <ImageCarousel />
        <Hero />
  
        {/* Curated row wrapper */}
        <section className="w-full flex justify-center">
          <div className="w-full max-w-6xl px-4">
            <div className="grid gap-6 md:grid-cols-3 justify-items-center">
              <CuratedDrop />
              <CuratedDrop1 />
              <CuratedDrop2 />
            </div>
          </div>
        </section>
  
        <LatestProducts />
        <Newsletter />
      </div>
    );
  }
  