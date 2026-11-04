'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, MapPin, MessageCircle, ArrowRight } from 'lucide-react';
import { StoryGroup, StorySlide } from '../data/storiesData';
import { WHATSAPP_NUMBER } from '../data/mockData';

interface StoryViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: StoryGroup[];
  initialGroupIndex: number;
  onOpenTradeIn?: () => void;
  onExploreCatalog?: () => void;
}

const SLIDE_DURATION_MS = 5000;

export default function StoryViewerModal({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex,
  onOpenTradeIn,
  onExploreCatalog,
}: StoryViewerModalProps) {
  const [currentGroupIdx, setCurrentGroupIdx] = useState(initialGroupIndex);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = storyGroups[currentGroupIdx] || storyGroups[0];
  const slides = currentGroup?.slides || [];
  const currentSlide: StorySlide | undefined = slides[currentSlideIdx];

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sincroniza índice inicial
  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIdx(initialGroupIndex);
      setCurrentSlideIdx(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen, initialGroupIndex]);

  // Avança para o próximo slide ou próximo grupo
  const handleNext = useCallback(() => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx((prev) => prev + 1);
      setProgress(0);
    } else if (currentGroupIdx < storyGroups.length - 1) {
      setCurrentGroupIdx((prev) => prev + 1);
      setCurrentSlideIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentSlideIdx, slides.length, currentGroupIdx, storyGroups.length, onClose]);

  // Volta para o slide anterior ou grupo anterior
  const handlePrev = useCallback(() => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx((prev) => prev - 1);
      setProgress(0);
    } else if (currentGroupIdx > 0) {
      setCurrentGroupIdx((prev) => prev - 1);
      const prevGroupSlides = storyGroups[currentGroupIdx - 1]?.slides || [];
      setCurrentSlideIdx(Math.max(0, prevGroupSlides.length - 1));
      setProgress(0);
    }
  }, [currentSlideIdx, currentGroupIdx, storyGroups]);

  // Timer de avanço automático
  useEffect(() => {
    if (!isOpen || isPaused) return;

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION_MS) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isOpen, isPaused, handleNext]);

  // Teclas de atalho (Esc, Setas)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !currentSlide) return null;

  const handleCtaClick = () => {
    if (currentSlide.ctaAction === 'tradein') {
      onClose();
      onOpenTradeIn?.();
    } else if (currentSlide.ctaAction === 'catalog') {
      onClose();
      onExploreCatalog?.();
    } else if (currentSlide.ctaAction === 'map') {
      window.open(
        'https://www.google.com/maps?q=Feira+dos+Importados+de+Brasilia+SIA+Trecho+7+Loja+D439',
        '_blank'
      );
    } else {
      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Olá! Vi o Story "${currentGroup.title}" no site da RR Store e gostaria de falar com a equipe.`
        )}`,
        '_blank'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      {/* Botão de Fechar no topo */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
        aria-label="Fechar Story"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Setas Laterais Desktop */}
      <button
        type="button"
        onClick={handlePrev}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center cursor-pointer transition-all"
        aria-label="Story Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        type="button"
        onClick={handleNext}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center cursor-pointer transition-all"
        aria-label="Próximo Story"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Caixa do Story (Proporção de Celular 9:16) */}
      <div
        className="relative w-full h-full sm:h-[88vh] sm:max-w-md sm:rounded-3xl overflow-hidden shadow-2xl border border-white/15 bg-black flex flex-col justify-between select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Imagem de Fundo em Tela Cheia */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.mediaUrl}
            alt={currentSlide.headline}
            className="w-full h-full object-cover"
          />
          {/* Gradientes para leitura de texto */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />
        </div>

        {/* Topo do Story: Barras de Progresso + Identificação do Grupo */}
        <div className="relative z-20 p-4 sm:p-5 space-y-3">
          {/* Barras de Progresso */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => {
              let widthPct = 0;
              if (idx < currentSlideIdx) widthPct = 100;
              else if (idx === currentSlideIdx) widthPct = progress;

              return (
                <div
                  key={idx}
                  className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-75"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Avatar e Título do Grupo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-[#7C63E6] to-[#34D399]">
                <img
                  src={currentGroup.coverImage}
                  alt={currentGroup.title}
                  className="w-full h-full rounded-full object-contain bg-[#111119] p-0.5"
                />
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">
                  {currentGroup.title}
                </p>
                <p className="text-[10px] text-white/70 font-semibold">
                  {currentGroup.subtitle}
                </p>
              </div>
            </div>

            <span className="text-[10px] font-black uppercase tracking-wider text-[#34D399] bg-[#10B981]/20 border border-[#10B981]/40 px-2 py-0.5 rounded-full">
              RR Store
            </span>
          </div>
        </div>

        {/* Áreas Invisíveis de Clique Lateral para Navegação (Toque à Esquerda / Direita) */}
        <div className="absolute inset-0 z-10 grid grid-cols-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="h-full cursor-pointer"
            aria-label="Voltar slide"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="h-full cursor-pointer"
            aria-label="Avançar slide"
          />
        </div>

        {/* Rodapé do Story: Texto e CTA */}
        <div className="relative z-20 p-5 sm:p-6 space-y-3 pointer-events-auto">
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#A78BFA] bg-[#7C63E6]/25 border border-[#7C63E6]/40 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {currentSlide.tag}
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {currentSlide.headline}
          </h3>

          <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
            {currentSlide.caption}
          </p>

          {currentSlide.ctaText && (
            <button
              type="button"
              onClick={handleCtaClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#7C63E6] hover:bg-[#684ddb] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#7C63E6]/40 transition-all cursor-pointer mt-2"
            >
              <span>{currentSlide.ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
