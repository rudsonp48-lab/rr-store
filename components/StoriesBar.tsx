'use client';

import React from 'react';
import { Sparkles, Play } from 'lucide-react';
import { STORE_STORIES, StoryGroup } from '../data/storiesData';

interface StoriesBarProps {
  onSelectStory: (story: StoryGroup, index: number) => void;
  stories?: StoryGroup[];
}

export default function StoriesBar({
  onSelectStory,
  stories = STORE_STORIES,
}: StoriesBarProps) {
  return (
    <div className="w-full bg-[#0D0D14] border-b border-white/10 py-3 sm:py-4 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center gap-3 sm:gap-5 overflow-x-auto no-scrollbar">
        {/* Badge Inicial */}
        <div className="hidden md:flex flex-col items-center justify-center pr-3 border-r border-white/10 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A78BFA] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Destaques
          </span>
          <span className="text-[11px] font-bold text-white/60">RR Store</span>
        </div>

        {/* Círculos dos Stories */}
        {stories.map((story, idx) => (
          <button
            key={story.id}
            type="button"
            onClick={() => onSelectStory(story, idx)}
            className="group flex flex-col items-center gap-1.5 shrink-0 cursor-pointer focus:outline-none transition-transform hover:scale-105 active:scale-95"
          >
            {/* Anel Gradiente Estilo Instagram / Apple */}
            <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#7C63E6] via-[#34D399] to-amber-400 shadow-md shadow-[#7C63E6]/20">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-[#12121e] border-2 border-[#0D0D14] flex items-center justify-center p-1">
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Selo ao vivo / play */}
              {story.isLive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#EF4444] text-white text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border border-black shadow">
                  LOJA
                </span>
              )}
            </div>

            <span className="text-[11px] sm:text-xs font-bold text-white/90 group-hover:text-white truncate max-w-[72px] sm:max-w-[80px] text-center leading-tight">
              {story.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
