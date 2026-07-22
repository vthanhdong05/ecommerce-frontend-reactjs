import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import banner_one from '../../assets/banner-one.png';
import banner_three from '../../assets/banner-three.png';
import banner_two from '../../assets/banner-two.png';

interface BannerItem {
  id: number;
  image: string;
}

// 2 banner độc lập - mỗi banner có 1-3 slides riêng
const BANNER_LEFT: BannerItem[] = [
  { id: 1, image: banner_one },
  { id: 2, image: banner_two },
  { id: 3, image: banner_three },
];

const BANNER_RIGHT: BannerItem[] = [
  { id: 4, image: banner_one },
  { id: 5, image: banner_one },
];

interface HeroBannerProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

interface SingleBannerProps {
  banners: BannerItem[];
  autoPlay: boolean;
  autoPlayInterval: number;
}

function SingleBanner({ banners, autoPlay, autoPlayInterval }: SingleBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const goToNext = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, banners.length]);

  const goToPrev = useCallback(() => {
    if (isTransitioning || banners.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, banners.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, currentIndex]
  );

  // Auto-play
  useEffect(() => {
    if (!autoPlay || banners.length <= 1 || isPaused) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, goToNext, isPaused, banners.length]);

  return (
    <div
      className="relative w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full bg-gray-100">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={banner.image}
              alt={`Banner ${banner.id}`}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
            aria-label="Banner trước"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20"
            aria-label="Banner tiếp theo"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? 'bg-primary w-6' : 'bg-white/50 hover:bg-white/75 w-2'
              }`}
              aria-label={`Chuyển đến banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroBanner({ autoPlay = true, autoPlayInterval = 5000 }: HeroBannerProps) {
  return (
    <div className="w-full h-100 overflow-hidden rounded-lg flex">
      {/* Left Banner - 60% */}
      <div className="relative h-full w-[60%]">
        <SingleBanner
          banners={BANNER_LEFT}
          autoPlay={autoPlay}
          autoPlayInterval={autoPlayInterval}
        />
      </div>

      {/* Right Banner - 40% */}
      <div className="relative h-full w-[40%] flex flex-col gap-2 pl-2">
        {BANNER_RIGHT.map((banner) => (
          <div key={banner.id} className="relative flex-1 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={banner.image}
              alt={`Side banner ${banner.id}`}
              className="w-full h-full"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default HeroBanner;
