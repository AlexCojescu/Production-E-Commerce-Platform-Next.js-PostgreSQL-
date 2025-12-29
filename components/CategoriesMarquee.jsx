const CategoriesMarquee = () => {
    const brands = [
      "Balenciaga",
      "Vetements",
      "Rick Owens",
      "ERD (Enfants Riches Déprimés)",
      "Gucci",
      "Prada",
      "Acne Studios",
    ]
  
    return (
      <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
        {/* Left gradient */}
        <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
  
        {/* Track */}
        <div className="flex min-w-[200%] animate-[marqueeScroll_10s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-3 sm:gap-4">
          {[...brands, ...brands, ...brands, ...brands].map((brand, index) => (
            <button
              key={index}
              type="button"
              className="inline-flex items-center max-w-[180px] sm:max-w-[220px] px-4 py-2 rounded-full bg-slate-100 text-slate-500 text-xs sm:text-sm hover:bg-slate-600 hover:text-white active:scale-95 transition-all duration-200"
            >
              <span className="block w-full truncate text-left">
                {brand}
              </span>
            </button>
          ))}
        </div>
  
        {/* Right gradient */}
        <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
      </div>
    )
  }
  
  export default CategoriesMarquee
  