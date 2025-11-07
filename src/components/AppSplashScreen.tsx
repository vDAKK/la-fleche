import { useEffect, useState } from "react";

interface AppSplashScreenProps {
  onComplete: () => void;
}

export const AppSplashScreen = ({ onComplete }: AppSplashScreenProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for fade out animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="flex flex-col items-center gap-8 animate-fade-in">
        <div className="relative">
          <img
            src="/icon-1024.png"
            srcSet="/icon-1024.png 1024w, /logo-icon.png 256w, /icon.png 128w"
            sizes="(min-width: 640px) 128px, 96px"
            alt="Logo La Flèche"
            className="w-24 h-24 sm:w-32 sm:h-32"
            loading="eager"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        </div>
        <p className="text-2xl font-semibold text-foreground animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Que le meilleur gagne
        </p>
      </div>
    </div>
  );
};
