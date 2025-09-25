
'use client'

import { DateTimeDisplay } from '@/components/serene/DateTimeDisplay';
import { PomodoroTimer } from '@/components/serene/PomodoroTimer';
import { TodoList } from '@/components/serene/TodoList';
import { WelcomeMessage } from '@/components/serene/WelcomeMessage';
import { useAppContext } from '@/hooks/use-theme'; // Use the new central context
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useMemo } from 'react';
import { cn } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';
import { InstallPWAButton } from '@/components/serene/InstallPWAButton';
import { Header } from '@/components/serene/Header';

export default function Home() {
  // Pull all state directly from the new central context.
  const { theme, customWallpaper, name, tasks, isDataLoaded } = useAppContext();
  const isMobile = useIsMobile();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Only check to open the settings dialog after the initial data has loaded.
    if (isDataLoaded) {
      const timer = setTimeout(() => {
        // If the user is a guest and has no name, prompt them to set one.
        if (!name) {
          setIsSettingsOpen(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [name, isDataLoaded]);

  // Memoize the welcome message. It now gets its tasks directly from the context.
  const memoizedWelcomeMessage = useMemo(() => (
    <WelcomeMessage tasks={tasks} />
  ), [tasks, name]); // name is a dependency to force re-render on login/logout.

  // Display a loading skeleton until the initial data load is complete.
  if (!isDataLoaded) {
    return <LoadingSkeleton isMobile={isMobile} />;
  }

  // Mobile-specific layout
  if (isMobile) {
    return (
      <main 
        className={cn(
          "min-h-screen text-foreground font-body selection:bg-primary/20",
          (theme !== 'custom' || !customWallpaper) && 'bg-background'
        )}
      >
        <div className="fixed top-4 right-4 z-50">
          <InstallPWAButton />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <Header isSettingsOpen={isSettingsOpen} onSettingsChange={setIsSettingsOpen} />
          <div className="flex flex-col gap-4">

            <div className={cn(
              "flex flex-col gap-4 mt-4",
              theme === 'custom' && 'bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-lg p-6'
            )}>
              <div className="flex-grow">
                {memoizedWelcomeMessage}
              </div>
            </div>

            <PomodoroTimer />
            <TodoList />

          </div>
        </div>
      </main>
    );
  }

  // Desktop layout
  return (
    <main 
      className={cn(
        "text-foreground font-body selection:bg-primary/20",
        (theme !== 'custom' || !customWallpaper) && 'bg-background'
      )}
    >
      <div className="fixed top-4 right-4 z-50">
        <InstallPWAButton />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <Header isSettingsOpen={isSettingsOpen} onSettingsChange={setIsSettingsOpen} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className={cn(
            "lg:col-span-3 flex flex-col lg:flex-row justify-between lg:items-center gap-4 mt-4",
            theme === 'custom' && 'bg-card/80 backdrop-blur-sm border-border/50 shadow-lg rounded-lg p-6'
          )}>
              <div className="flex-grow">
                {memoizedWelcomeMessage}
              </div>
              <DateTimeDisplay />
          </div>

          <div className="lg:col-span-2">
            <TodoList />
          </div>

          <div className="lg:col-span-1">
            <PomodoroTimer />
          </div>

        </div>
      </div>
    </main>
  );
}

// A simple loading skeleton component to prevent layout shifts on load.
function LoadingSkeleton({ isMobile }: { isMobile: boolean }) {
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
          <Header isSettingsOpen={false} onSettingsChange={() => {}} />
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
            </div>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <Header isSettingsOpen={false} onSettingsChange={() => {}} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-1/2" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
