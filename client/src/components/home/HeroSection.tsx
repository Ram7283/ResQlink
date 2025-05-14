import { useEffect, useRef } from "react";
import { Link } from "wouter";
import lottie from "lottie-web";

const HeroSection = () => {
  const lottieContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lottieContainer.current) {
      const animation = lottie.loadAnimation({
        container: lottieContainer.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets10.lottiefiles.com/packages/lf20_UgZWvP.json', // Earth spinning with connection lines
      });

      return () => {
        animation.destroy();
      };
    }
  }, []);

  return (
    <main className="container mx-auto px-4 py-12 md:py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row items-center gap-10">
        <div className="lg:w-1/2">
          <div className="badge-green mb-6">
            <svg
              className="w-5 h-5 mr-2 text-green-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
            </svg>
            <span>Disaster Management Platform</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-secondary leading-tight mb-6">
            Smart Crisis <br className="hidden md:block" />
            Response with <br className="hidden md:block" />
            <span className="text-primary">ResQLink</span>
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 max-w-xl">
            Connect communities, empower volunteers, and coordinate rapid responses when every minute counts during disaster situations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="btn-primary">
              Get Started Now
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              <svg
                className="w-5 h-5 mr-2 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polygon points="10 8 16 12 10 16 10 8"></polygon>
              </svg>
              How it works
            </Link>
          </div>
        </div>
        
        <div className="lg:w-1/2 flex justify-center">
          <div 
            ref={lottieContainer} 
            className="w-full max-w-md"
            aria-label="Interactive globe showing worldwide disaster response network"
          ></div>
        </div>
      </div>
    </main>
  );
};

export default HeroSection;
