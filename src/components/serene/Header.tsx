
'use client';

import { Sparkles, Calendar } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeSwitcherDialog } from '@/components/serene/ThemeSwitcher';

export function Header({ isSettingsOpen, onSettingsChange }) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center">
        <Sparkles className="mr-2 text-foreground" size={18} />
        <h1 className="text-sm font-bold text-muted-foreground">
          Serenity Start by Shreyash
        </h1>
      </div>
      <div className="flex items-center space-x-2">
        <Link
            href="/timetablecreator/index2.html"
            className={cn(buttonVariants({ variant: 'outline' }))}
            target="_blank"
        >
            <Calendar className="mr-2 h-4 w-4" />
            Timetable Creator
        </Link>
        <ThemeSwitcherDialog open={isSettingsOpen} onOpenChange={onSettingsChange} />
      </div>
    </header>
  );
}
