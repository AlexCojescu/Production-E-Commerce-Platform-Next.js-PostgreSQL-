'use client'
import BestSelling from "@/components/BestSelling";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";
import LatestProducts from "@/components/LatestProducts";
import ImageCarousel from "@/components/ImageCarousel";

export default function Home() {
    return (
        <div>
            <ImageCarousel />
            <Hero />
            <LatestProducts />
            <BestSelling />
            <Newsletter />
        </div>
    );
}
