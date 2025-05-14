import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface StatProps {
  count: number;
  label: string;
  icon: React.ReactNode;
  suffix: string;
  bgColor: string;
  iconColor: string;
}

const StatCard = ({ count, label, icon, suffix, bgColor, iconColor }: StatProps) => {
  const [displayCount, setDisplayCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  
  useEffect(() => {
    if (isInView) {
      const duration = 2000; // Animation duration in ms
      const startTime = Date.now();
      const increment = count / (duration / 16); // Update every 16ms for ~60fps
      
      const timer = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const currentCount = Math.floor(progress * count);
        
        setDisplayCount(currentCount);
        
        if (progress === 1) {
          clearInterval(timer);
        }
      }, 16);
      
      return () => clearInterval(timer);
    }
  }, [isInView, count]);
  
  return (
    <div ref={ref} className="stat-card">
      <div className={`${bgColor} stat-icon`}>
        {icon}
      </div>
      <div>
        <div className="flex items-end">
          <span className="text-3xl font-bold text-secondary">{displayCount}</span>
          <span className={`text-xl font-bold ${iconColor} ml-1`}>{suffix}</span>
        </div>
        <p className="text-gray-500 uppercase text-sm font-medium tracking-wider">{label}</p>
      </div>
    </div>
  );
};

const StatsSection = () => {
  const stats = [
    {
      count: 300,
      label: "CRISES RESOLVED",
      suffix: "+",
      bgColor: "bg-blue-50",
      iconColor: "text-primary",
      icon: (
        <svg
          className="w-6 h-6 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    {
      count: 750,
      label: "ACTIVE VOLUNTEERS",
      suffix: "+",
      bgColor: "bg-green-50",
      iconColor: "text-accent",
      icon: (
        <svg
          className="w-6 h-6 text-accent"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      count: 15,
      label: "PEOPLE HELPED",
      suffix: "K+",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-500",
      icon: (
        <svg
          className="w-6 h-6 text-purple-500"
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
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 container mx-auto px-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          count={stat.count}
          label={stat.label}
          icon={stat.icon}
          suffix={stat.suffix}
          bgColor={stat.bgColor}
          iconColor={stat.iconColor}
        />
      ))}
    </div>
  );
};

export default StatsSection;
