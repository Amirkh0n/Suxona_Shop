/**
 * BannerCarousel — banner carousel component with swipe support.
 *
 * Used on: Home Page.
 *
 * Requirements (UI/UX Spec):
 * - Displays promotions, seasonal offers, featured stores
 * - Supports swipe gestures
 *
 * Phase 3A: UI only, no API calls. Mock data. Simple auto-scroll implementation.
 */
import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface Banner {
  id: number
  image: string
  title: string
  link?: string
}

export interface BannerCarouselProps {
  banners: Banner[]
  autoScrollInterval?: number
}

export function BannerCarousel({
  banners,
  autoScrollInterval = 5000,
}: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (banners.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, autoScrollInterval)

    return () => clearInterval(timer)
  }, [banners.length, autoScrollInterval])

  // Scroll to current banner
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const bannerWidth = container.offsetWidth
    container.scrollTo({
      left: bannerWidth * currentIndex,
      behavior: 'smooth',
    })
  }, [currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (banners.length === 0) return null

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface">
      {/* Banner Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 snap-center"
            style={{ aspectRatio: '16/9' }}
          >
            <img
              src={banner.image}
              alt={banner.title}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows (desktop only) */}
      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Previous banner"
            className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white md:block"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next banner"
            className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white md:block"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to banner ${index + 1}`}
              className={[
                'h-2 rounded-full transition-all',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/75',
              ].join(' ')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
