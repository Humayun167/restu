import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import heroSlide1 from "@/assets/hero-slide-1.jpg";
import heroSlide2 from "@/assets/hero-slide-2.jpg";
import heroSlide3 from "@/assets/hero-slide-3.jpg";
import video from "@/assets/vdo.mp4";
const slides = [
  {
    id: 1,
    image: heroSlide1,
    subtitle: "Hello, new friend!",
    title: "Welcome Back\nto Restu",
    description: "Quaerat debitis, vel, sapiente dicta sequi\nlabore porro pariatur harum expedita.",
    primaryButton: "RESERVATION",
    secondaryButton: "OPEN MENU",
  },
  {
    id: 2,
    image: heroSlide2,
    subtitle: "Hello, new friend!",
    title: "Reserve Your\nTable Today",
    description: "Quaerat debitis, vel, sapiente dicta sequi\nlabore porro pariatur harum expedita.",
    primaryButton: "RESERVATION",
    secondaryButton: "ONLINE SHOP",
  },
  {
    id: 3,
    video: video,
    subtitle: "Hello, new friend!",
    title: "Visit to Our\nOnline Shop",
    description: "Quaerat debitis, vel, sapiente dicta sequi\nlabore porro pariatur harum expedita.",
    primaryButton: "GO TO SHOP",
    secondaryButton: "OPEN MENU",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            index === currentSlide ? "opacity-100" : "opacity-0"
          )}
        >
          {slide.video ? (
            <div className="absolute inset-0">
              <video
                autoPlay
                muted
                loop
                className="w-full h-full object-cover"
              >
                <source src={slide.video} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}
          
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-px bg-primary w-12" />
                  <p className="text-primary font-medium tracking-wider uppercase text-sm">
                    {slide.subtitle}
                  </p>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                  {slide.title.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                
                <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
                  {slide.description.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 text-base"
                  >
                    {slide.primaryButton}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-foreground text-foreground hover:bg-foreground hover:text-background px-8 py-4 text-base"
                  >
                    {slide.secondaryButton}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
      >
        <ChevronLeft className="h-6 w-6 text-foreground" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
      >
        <ChevronRight className="h-6 w-6 text-foreground" />  
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-3 w-3 rounded-full transition-colors",
              index === currentSlide ? "bg-primary" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;