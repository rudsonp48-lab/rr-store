'use client';

import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'rr_store_pwa_banner_dismissed_v1';

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [installedJustNow, setInstalledJustNow] = useState(false);

  useEffect(() => {
    // Registra Service Worker para habilitar instalação PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silencioso
      });
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    if (!standalone) {
      const dismissed = sessionStorage.getItem(DISMISS_KEY);
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setInstalledJustNow(true);
      setDeferredPrompt(null);
      setShowBanner(false);
      setTimeout(() => setShowModal(false), 1800);
    };

    const onOpenInstallModal = () => {
      if (deferredPrompt) {
        void handleNativeInstall();
      } else {
        setShowModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    window.addEventListener('rr-open-install-app', onOpenInstallModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
      window.removeEventListener('rr-open-install-app', onOpenInstallModal);
    };
  }, [deferredPrompt]);

  const handleNativeInstall = async () => {
    if (!deferredPrompt) {
      setShowModal(true);
      return;
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalledJustNow(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch {
      setShowModal(true);
    }
  };

  const dismissBanner = () => {
    setShowBanner(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Ignore
    }
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Faixa de convite discreta para baixar o App no celular/PC */}
      {showBanner && (
        <div className="bg-gradient-to-r from-[#121212] via-[#161616] to-[#121212] border-b border-[#D4AF37]/30 px-3.5 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt="RR Mobile App"
                className="w-9 h-9 rounded-xl border border-[#D4AF37]/40 object-cover shrink-0 shadow-md"
              />
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-white truncate">
                  App RR Mobile no seu aparelho
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  Acesso rápido em 1 toque, ofertas exclusivas e rastreio DF
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleNativeInstall}
                className="inline-flex items-center gap-1.5 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-xs px-3 py-1.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Baixar App</span>
              </button>
              <button
                type="button"
                onClick={dismissBanner}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Fechar aviso de aplicativo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Instalação (iOS / Android / Desktop) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121212] border border-white/15 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/icon-192.png"
                alt="RR Mobile"
                className="w-16 h-16 rounded-2xl border-2 border-[#D4AF37]/50 shadow-lg object-cover shrink-0"
              />
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#34D399] bg-[#10B981]/15 border border-[#10B981]/30 px-2 py-0.5 rounded-full">
                  <Smartphone className="w-3 h-3" /> Aplicativo Oficial
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  Instalar RR Mobile
                </h3>
                <p className="text-xs text-zinc-400">
                  Adicione à tela inicial do seu celular ou computador sem ocupar memória.
                </p>
              </div>
            </div>

            {installedJustNow ? (
              <div className="rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 p-4 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto" />
                <p className="text-sm font-black text-white">
                  Aplicativo instalado com sucesso!
                </p>
                <p className="text-xs text-zinc-300">
                  O ícone da RR Mobile já está disponível na sua tela inicial.
                </p>
              </div>
            ) : deferredPrompt ? (
              <button
                type="button"
                onClick={handleNativeInstall}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-[#0A0A0A] font-black text-sm py-3.5 px-5 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Instalar Agora em 1 Clique</span>
              </button>
            ) : isIOS ? (
              <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 space-y-3 text-xs text-zinc-200">
                <p className="font-bold text-[#34D399]">
                  Como instalar no seu iPhone / iPad:
                </p>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-[#34D399] shrink-0">
                    1
                  </span>
                  <p className="flex-1">
                    Toque no botão <strong>Compartilhar</strong>{' '}
                    <Share className="w-3.5 h-3.5 inline text-[#34D399] mx-0.5" /> na barra do Safari.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-[#34D399] shrink-0">
                    2
                  </span>
                  <p className="flex-1">
                    Role para baixo e toque em{' '}
                    <strong>Adicionar à Tela de Início</strong>{' '}
                    <PlusSquare className="w-3.5 h-3.5 inline text-[#34D399] mx-0.5" />.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#0A0A0A] border border-white/10 p-4 space-y-3 text-xs text-zinc-200">
                <p className="font-bold text-[#34D399]">
                  Como instalar no Android ou Computador:
                </p>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-[#34D399] shrink-0">
                    1
                  </span>
                  <p className="flex-1">
                    Abra o menu do navegador <strong>(⋮)</strong> no canto superior direito ou o ícone de instalação na barra de endereço.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-[#34D399] shrink-0">
                    2
                  </span>
                  <p className="flex-1">
                    Toque em <strong>&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong>&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
