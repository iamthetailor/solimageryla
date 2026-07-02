'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'error'>('idle');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const modalPanelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const navHomeRef = useRef<HTMLAnchorElement>(null);

  const openContactModal = (service?: string) => {
    // Always sync the service: a package CTA passes its tier; a generic CTA passes
    // nothing and must RESET the select — otherwise a previously chosen package
    // lingers in the controlled <select> and gets submitted by mistake.
    setSelectedService(service ?? '');
    setSubmitStatus('idle');
    setIsContactModalOpen(true);
  };
  const closeContactModal = () => setIsContactModalOpen(false);

  // While the contact modal is open: lock body scroll, manage focus, and trap Tab + Escape
  useEffect(() => {
    if (!isContactModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Remember the trigger element, then move focus into the dialog
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const panel = modalPanelRef.current;
    // Capture the stable fallback-focus node now (the nav logo never unmounts), so the
    // cleanup doesn't read a possibly-changed ref.
    const navHome = navHomeRef.current;
    const getFocusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => el.offsetParent !== null)
        : [];
    // Focus the first focusable element (not the panel itself) so the Tab trap's
    // first/last checks engage from the very first keypress.
    const focusables = getFocusable();
    (focusables[0] ?? panel)?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsContactModalOpen(false);
        return;
      }
      if (e.key === 'Tab') {
        const items = getFocusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the trigger — but only if it's still visible. When the modal
      // was opened from the mobile menu, the trigger lives in a now-hidden drawer, so
      // focus() on it is a no-op and focus falls to <body>; fall back to a stable,
      // always-visible control (the nav logo) in that case.
      const trigger = previouslyFocusedRef.current;
      if (trigger && trigger.isConnected && trigger.offsetParent !== null) {
        trigger.focus?.();
      } else {
        navHome?.focus?.();
      }
    };
  }, [isContactModalOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const newIsScrolled = scrollPosition > 50;
      setIsScrolled(newIsScrolled);
      
      // Reset Book Now button color when scroll state changes
      const bookNowButton = document.querySelector('a[href="#contact"]') as HTMLAnchorElement;
      if (bookNowButton) {
        bookNowButton.style.color = '';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Luxury scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    };

    const observer = new IntersectionObserver(animateOnScroll, observerOptions);
    
    // Observe elements with animation classes
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Stash the chosen service as the "pending lead" signal, then redirect to the
      // dedicated conversion page. /thank-you consumes this flag to fire the Meta `Lead`
      // (with package + value) exactly once per real submission — so only genuine
      // submits convert, never a direct/bookmarked visit to /thank-you.
      const service = String(data.serviceType || '');
      try {
        sessionStorage.setItem('sol_pending_lead', service);
      } catch {
        // sessionStorage blocked (privacy mode) — proceed without the conversion signal.
      }
      // Leave isSubmitting = true so the submit button stays disabled while the
      // /thank-you route loads, preventing a double-submit (and duplicate emails).
      router.push('/thank-you');
      return;
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-neutral-50 scroll-smooth overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full transition-all duration-200 ${
        isMobileMenuOpen ? 'z-40' : 'z-50'
      } ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <a ref={navHomeRef} href="#home" className="flex items-center hover:opacity-80 transition-opacity">
              <img src="/images/sol-imagery-logo-gold.png" alt="Sol Imagery" className="h-14 w-auto" />
            </a>
            <div className={`hidden md:flex space-x-8 font-light text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
              isScrolled 
                ? 'text-neutral-600' 
                : 'text-white/90'
            }`}>
              <a href="#home" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>HOME</a>
              <a href="#showcase" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>OUR WORK</a>
              <a href="#pricing" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>PACKAGES</a>
              <a href="#about" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>ABOUT</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); openContactModal(); }} className={`bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-white ${
                isScrolled ? 'text-neutral-900 bg-neutral-900 hover:bg-neutral-700' : 'text-white'
              }`} 
              onMouseEnter={(e) => {
                (e.target as HTMLAnchorElement).style.color = '#b8996b';
              }}
              onMouseLeave={(e) => {
                const currentScrollPosition = window.scrollY;
                (e.target as HTMLAnchorElement).style.color = currentScrollPosition > 50 ? '#1f2937' : 'white';
              }}>BOOK NOW</a>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className={`transition-all duration-100 p-2 -mr-2 active:scale-95 ${
                  isScrolled 
                    ? 'text-neutral-600 hover:text-neutral-900' 
                    : 'text-white/90 hover:text-white'
                }`}
                aria-label="Toggle mobile menu"
              >
                <svg 
                  className={`w-6 h-6 transition-transform duration-75 ease-out ${
                    isMobileMenuOpen ? 'rotate-90' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[60] md:hidden transition-all duration-200 ease-out ${
        isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>
        
        {/* Menu Content */}
        <div className={`absolute top-0 right-0 h-full w-80 max-w-[90vw] bg-white transform transition-transform duration-200 ease-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header with logo */}
            <div className="flex items-center justify-between p-8 border-b border-neutral-100">
              <img src="/images/sol-imagery-logo-gold.png" alt="Sol Imagery" className="h-12 w-auto" />
              <button 
                onClick={closeMobileMenu}
                className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 p-2"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Navigation Items */}
            <nav className="flex-1 px-8 py-12">
              <div className="space-y-8">
                <a 
                  href="#home" 
                  onClick={closeMobileMenu}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  Home
                </a>
                <a 
                  href="#showcase" 
                  onClick={closeMobileMenu}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  Our Work
                </a>
                <a
                  href="#pricing"
                  onClick={closeMobileMenu}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  Packages
                </a>
                <a
                  href="#about"
                  onClick={closeMobileMenu}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  About
                </a>
                <a 
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); closeMobileMenu(); openContactModal(); }}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  Book Now
                </a>
              </div>
            </nav>
            
            {/* Footer */}
            <div className="p-8 border-t border-neutral-100">
              <p className="text-neutral-500 font-light text-sm tracking-[0.15em] uppercase">
                Follow Along
              </p>
              <div className="flex space-x-6 mt-4">
                <a href="https://www.instagram.com/solimageryla/" target="_blank" rel="noopener noreferrer" className="text-neutral-600 hover:text-neutral-900 transition-colors text-sm font-light tracking-wide">
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <main>
        {/* Main Hero */}
        <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background Image */}
          {/* TODO: rotate/swap hero imagery once multi-service photos are delivered */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/EAWedding-00953.jpg"
              alt="Sol Imagery luxury Los Angeles photography"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
            <div className="mb-6 hero-element">
              <span className="bg-white/10 backdrop-blur-sm text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-light tracking-wide text-center">
                <span className="hidden sm:inline">✨ Los Angeles Luxury Photography Studio</span>
                <span className="sm:hidden">✨ LA Luxury Photography</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-thin text-white mb-6 md:mb-8 leading-tight tracking-tight hero-element">
              Timeless Photography for Every Milestone
            </h1>
            <p className="text-lg md:text-2xl text-white/95 font-light mb-4 md:mb-6 tracking-wide hero-element">
              Weddings · Quinceañeras · Family · Photobooth
            </p>
            <p className="hidden md:block text-lg text-white/80 font-light mb-8 max-w-3xl mx-auto hero-element">
              Los Angeles&apos; luxury photography studio, crafting unforgettable images for life&apos;s biggest moments. Now booking 2026-2027.
            </p>
            <div className="flex justify-center items-center mb-12 md:mb-16 hero-element">
              <a href="#contact" onClick={(e) => { e.preventDefault(); openContactModal(); }} className="bg-white text-neutral-900 px-6 md:px-10 py-3 md:py-5 font-medium text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                <span className="hidden sm:inline">Book Free Consultation →</span>
                <span className="sm:hidden">Book Now →</span>
              </a>
            </div>
            <div className="hidden sm:flex justify-center items-center space-x-8 text-white/70 text-sm">
              <div className="flex items-center space-x-2">
                <span>Exceptional Quality</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="flex items-center space-x-2">
                <span>Crafting Memories</span>
              </div>
            </div>
          </div>
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
            <a href="#why-choose" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </section>

        {/* Welcome Section with Urgency */}
        <section id="why-choose" className="py-16 md:py-32 px-6 bg-neutral-50">
          <div className="max-w-6xl mx-auto">      
            {/* Vogue-Style Grid Layout */}
            <div className="space-y-12 md:space-y-20">
              {/* Main Heading */}
              <div className="text-center scroll-animate fade-up">
                <h2 className="text-4xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight">
                  Why <span className="italic">Clients</span> Choose
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>Sol Imagery
                </h2>
                <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
                <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                  Discover what sets us apart across every celebration we photograph
                </p>
              </div>

              {/* Featured Image with Overlay */}
              <div className="relative">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  {/* Left Content */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="group scroll-animate fade-up delay-200">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-neutral-100">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                          <span className="text-2xl">💎</span>
                        </div>
                        <h3 className="text-2xl font-light text-neutral-900 mb-4">Uncompromising Quality</h3>
                        <p className="text-neutral-600 leading-relaxed">Fresh perspective with meticulous attention to every detail that matters most</p>
                      </div>
                    </div>
                    
                    <div className="group scroll-animate fade-up delay-400">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-neutral-100">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                          <span className="text-2xl">🤝</span>
                        </div>
                        <h3 className="text-2xl font-light text-neutral-900 mb-4">Personalized Service</h3>
                        <p className="text-neutral-600 leading-relaxed">Every session is built around your vision — from intimate family portraits to grand celebrations</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Image */}
                  <div className="lg:col-span-1 relative group scroll-animate fade-up delay-600">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img
                        src="/images/EAWedding-00805.jpg"
                        alt="Sol Imagery signature photography style"
                        className="w-full h-[400px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center">
                          <p className="text-neutral-900 font-light italic text-lg">
                            &ldquo;Creating timeless memories for extraordinary moments&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="lg:col-span-1 space-y-8">
                    <div className="group scroll-animate fade-up delay-800">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-neutral-100">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                          <span className="text-2xl">🏙️</span>
                        </div>
                        <h3 className="text-2xl font-light text-neutral-900 mb-4">Los Angeles Experts</h3>
                        <p className="text-neutral-600 leading-relaxed">Deep local knowledge of LA&apos;s most stunning venues, from intimate gardens to luxury estates</p>
                      </div>
                    </div>
                    
                    <div className="group scroll-animate fade-up delay-1000">
                      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-neutral-100">
                        <div className="w-12 h-12 bg-neutral-900 rounded-full flex items-center justify-center mb-6">
                          <span className="text-2xl">✨</span>
                        </div>
                        <h3 className="text-2xl font-light text-neutral-900 mb-4">Satisfaction Guarantee</h3>
                        <p className="text-neutral-600 leading-relaxed">If you&apos;re not completely thrilled, we&apos;ll make it right</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center rounded-3xl p-6 md:p-12" style={{background: `linear-gradient(to right, #f9fafb, #ceb07e20)`}}>
                <h3 className="text-2xl md:text-3xl font-light text-neutral-900 mb-3 md:mb-4">Ready to Begin Your Journey?</h3>
                <p className="text-sm md:text-base text-neutral-600 mb-6 md:mb-8 max-w-xl mx-auto">
                  Join the clients who&apos;ve chosen Sol Imagery to capture their most precious moments
                </p>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); openContactModal(); }}
                  className="inline-flex items-center text-white px-10 py-4 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  style={{backgroundColor: '#ceb07e'}}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8996b';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#ceb07e';
                  }}
                >
                  Start Your Story
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
            
          </div>
        </section>

        {/* Elegant Image Showcase */}
        <section id="showcase" className="py-16 md:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-20 scroll-animate fade-up">
              <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mb-3 md:mb-4">portfolio highlights</p>
              <h2 className="text-4xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight">
                A <span className="italic">Glimpse</span> of Our Work
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                From weddings to family portraits, every moment captured with intention and artistry
              </p>
            </div>

            {/* TODO: swap in multi-service imagery (quinceañera, family, photobooth) once delivered */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-16">
              <div className="group overflow-hidden scroll-animate slide-left delay-200">
                <img
                  src="/images/EAWedding-00848.jpg"
                  alt="Sol Imagery editorial photography"
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate slide-right delay-400">
                <img
                  src="/images/EA-06043.jpg"
                  alt="Sol Imagery portrait session"
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="group overflow-hidden scroll-animate fade-up delay-200">
                <img
                  src="/images/EAWedding-00996.jpg"
                  alt="Sol Imagery candid moment"
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate fade-up delay-400">
                <img
                  src="/images/EA-06372.jpg"
                  alt="Sol Imagery romantic portrait"
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate fade-up delay-600">
                <img
                  src="/images/EAWedding-01079.jpg"
                  alt="Sol Imagery intimate celebration"
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            
          </div>
        </section>

        {/* Photobooth Packages / Pricing */}
        <section id="pricing" className="py-12 md:py-24 px-6 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12 md:mb-20 scroll-animate fade-up">
              <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mb-3 md:mb-4">the luxury photobooth</p>
              <h2 className="text-4xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight">
                Photobooth <span className="italic font-light">Packages</span>
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{ backgroundColor: '#ceb07e' }}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                Studio-quality booth, three ways to book — from digital-only to the full experience.
              </p>
            </div>

            {/* Package cards */}
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 items-stretch max-w-6xl mx-auto">

              {/* Essential */}
              <div className="group flex flex-col bg-white border border-neutral-200 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 scroll-animate fade-up delay-200">
                <h3 className="text-2xl md:text-3xl font-light text-neutral-900">Essential</h3>
                <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mt-2">iPad · Digital Only</p>
                <div className="mt-6">
                  <span className="text-5xl md:text-6xl font-light" style={{ color: '#ceb07e' }}>$400</span>
                </div>
                <p className="text-xs font-light text-neutral-500 uppercase tracking-[0.15em] mt-2">2-hour minimum</p>
                <div className="h-px my-6 w-8 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#ceb07e' }}></div>
                <ul className="space-y-3 text-neutral-600 font-light leading-relaxed mb-6">
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Drop-off &amp; self-operated setup</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Unlimited digital photos</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Instant digital delivery</span></li>
                </ul>
                <p className="text-sm font-light text-neutral-500 mb-8">
                  Add unlimited prints <span className="font-normal text-neutral-700">+$250</span>
                </p>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); openContactModal('Luxury Photobooth — Essential'); }}
                  className="mt-auto inline-flex items-center justify-center border px-8 py-3 font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105"
                  style={{ color: '#ceb07e', borderColor: '#ceb07e' }}
                  onMouseEnter={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.backgroundColor = '#ceb07e'; t.style.color = '#ffffff'; }}
                  onMouseLeave={(e) => { const t = e.currentTarget as HTMLAnchorElement; t.style.backgroundColor = 'transparent'; t.style.color = '#ceb07e'; }}
                >
                  Choose Essential <span className="ml-2">→</span>
                </a>
              </div>

              {/* Signature — featured */}
              <div className="group relative flex flex-col bg-white p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 scroll-animate fade-up delay-400" style={{ border: '2px solid #ceb07e' }}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.2em] whitespace-nowrap" style={{ backgroundColor: '#ceb07e' }}>
                  Most Popular
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-neutral-900">Signature</h3>
                <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mt-2">DSLR + Unlimited Photos</p>
                <div className="mt-6">
                  <span className="text-5xl md:text-6xl font-light" style={{ color: '#ceb07e' }}>$600</span>
                </div>
                <p className="text-xs font-light text-neutral-500 uppercase tracking-[0.15em] mt-2">2-hour minimum · +$150 / additional hour</p>
                <div className="h-px my-6 w-8 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#ceb07e' }}></div>
                <ul className="space-y-3 text-neutral-600 font-light leading-relaxed mb-8">
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Studio-Quality Lighting</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Unlimited 4×6 Prints</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Premium Template Design</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Professional Attendant</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>White or Black Backdrop</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Instant Social Sharing (SMS &amp; Email)</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Full Gallery Access</span></li>
                </ul>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); openContactModal('Luxury Photobooth — Signature'); }}
                  className="mt-auto inline-flex items-center justify-center text-white px-8 py-3 font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#ceb07e' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8996b'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#ceb07e'; }}
                >
                  Choose Signature <span className="ml-2">→</span>
                </a>
              </div>

              {/* Premier — top tier */}
              <div className="group relative flex flex-col bg-white border border-neutral-300 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 scroll-animate fade-up delay-600">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.2em] whitespace-nowrap border" style={{ color: '#ceb07e', borderColor: '#ceb07e' }}>
                  Complete
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-neutral-900">Premier</h3>
                <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mt-2">DSLR + Keychain Station</p>
                <div className="mt-6">
                  <span className="text-5xl md:text-6xl font-light" style={{ color: '#ceb07e' }}>$1,100</span>
                </div>
                <p className="text-xs font-light text-neutral-500 uppercase tracking-[0.15em] mt-2">3-hour minimum · +$150 / additional hour</p>
                <div className="h-px my-6 w-8 group-hover:w-16 transition-all duration-500" style={{ backgroundColor: '#ceb07e' }}></div>
                <ul className="space-y-3 text-neutral-600 font-light leading-relaxed mb-8">
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Studio-Quality Lighting</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Unlimited 4×6 Prints</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Premium Template Design</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Professional Attendant</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>White or Black Backdrop</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Instant Social Sharing (SMS &amp; Email)</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span>Full Gallery Access</span></li>
                  <li className="flex items-start gap-3"><span style={{ color: '#ceb07e' }}>✓</span><span className="text-neutral-900 font-normal">Keychain Station — up to 150 guests</span></li>
                </ul>
                <a
                  href="#contact"
                  onClick={(e) => { e.preventDefault(); openContactModal('Luxury Photobooth — Premier'); }}
                  className="mt-auto inline-flex items-center justify-center text-white px-8 py-3 font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg"
                  style={{ backgroundColor: '#ceb07e' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#b8996b'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#ceb07e'; }}
                >
                  Choose Premier <span className="ml-2">→</span>
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-32 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20 scroll-animate fade-up">
              <p className="text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mb-4">the sol imagery team</p>
              <h2 className="text-7xl font-light text-neutral-900 mb-6 tracking-tight">
                Behind <span className="italic">The Lens</span>
              </h2>
              <div className="w-24 h-px mx-auto mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                Meet the passionate artists dedicated to capturing your most precious moments
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-20 items-center">
              <div className="order-1 lg:order-1 group scroll-animate slide-left delay-200">
                <img
                  src="/images/EAWedding-01073.jpg"
                  alt="Sol Imagery behind the scenes"
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="order-2 lg:order-2 lg:pl-8 scroll-animate slide-right delay-400">
                <p className="text-lg text-neutral-700 font-light leading-[1.8]">
                  We are a team of Los Angeles photographers who specialize in life&apos;s biggest celebrations — weddings,
                  quinceañeras, family portraits, and luxury photobooth experiences. We believe in creating more than
                  just beautiful photos; we strive to encapsulate the true essence of your moments. From candid smiles
                  to grand celebrations, our collective expertise ensures every detail is thoughtfully documented. With
                  a seamless blend of creativity and professionalism, we make your experience enjoyable and your
                  memories unforgettable.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Enhanced Social Proof Section */}
        <section className="py-12 md:py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-16 scroll-animate fade-up">
              <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mb-3 md:mb-4">testimonials</p>
              <h2 className="text-4xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight">
                What Our <span className="italic" style={{color: '#ceb07e'}}>Clients</span> Say
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12">
                Hear from the clients who trusted us to capture their most important moments
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 md:space-x-12 mb-8 md:mb-12 scroll-animate fade-up delay-200">
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-light text-neutral-900 mb-1 md:mb-2">5⭐</div>
                  <div className="text-xs md:text-sm text-neutral-600 uppercase tracking-wide">Quality Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-4xl font-light text-neutral-900 mb-1 md:mb-2">100%</div>
                  <div className="text-xs md:text-sm text-neutral-600 uppercase tracking-wide">Satisfaction</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-2xl md:text-4xl font-light text-neutral-900 mb-1 md:mb-2">24hr</div>
                  <div className="text-xs md:text-sm text-neutral-600 uppercase tracking-wide">Response Time</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              <div className="bg-neutral-50 p-6 md:p-8 text-center scroll-animate fade-up delay-400">
                <div className="text-xl md:text-2xl mb-3 md:mb-4" style={{color: '#ceb07e'}}>⭐⭐⭐⭐⭐</div>
                <blockquote className="text-base md:text-lg font-light text-neutral-900 italic mb-4 md:mb-6 leading-relaxed">
                  &ldquo;Sol Imagery exceeded our expectations! Their fresh approach and attention to detail made our day magical.&rdquo;
                </blockquote>
                <p className="text-neutral-600 font-light text-xs md:text-sm uppercase tracking-wide">— SARAH & MICHAEL</p>
                <p className="text-neutral-500 text-xs mt-1">Recent Client</p>
              </div>
              
              <div className="bg-neutral-50 p-6 md:p-8 text-center scroll-animate fade-up delay-600">
                <div className="text-xl md:text-2xl mb-3 md:mb-4" style={{color: '#ceb07e'}}>⭐⭐⭐⭐⭐</div>
                <blockquote className="text-base md:text-lg font-light text-neutral-900 italic mb-4 md:mb-6 leading-relaxed">
                  &ldquo;Professional, creative, and incredibly passionate. They captured moments we didn&apos;t even know were happening!&rdquo;
                </blockquote>
                <p className="text-neutral-600 font-light text-xs md:text-sm uppercase tracking-wide">— JESSICA & DAVID</p>
                <p className="text-neutral-500 text-xs mt-1">Recent Client</p>
              </div>
              
              <div className="bg-neutral-50 p-6 md:p-8 text-center scroll-animate fade-up delay-800">
                <div className="text-xl md:text-2xl mb-3 md:mb-4" style={{color: '#ceb07e'}}>⭐⭐⭐⭐⭐</div>
                <blockquote className="text-base md:text-lg font-light text-neutral-900 italic mb-4 md:mb-6 leading-relaxed">
                  &ldquo;Amazing quality and service! Their dedication to perfection shows in every single photograph.&rdquo;
                </blockquote>
                <p className="text-neutral-600 font-light text-xs md:text-sm uppercase tracking-wide">— AMANDA & CARLOS</p>
                <p className="text-neutral-500 text-xs mt-1">Recent Client</p>
              </div>
            </div>
            
            <div className="text-center hidden md:block">
              <div className="inline-flex items-center space-x-6 bg-neutral-50 px-8 py-4 rounded-lg">
                <div className="text-sm font-light text-neutral-600">Committed to:</div>
                <div className="flex items-center space-x-4 text-neutral-700">
                  <span className="font-medium">Excellence</span>
                  <span>•</span>
                  <span className="font-medium">Creativity</span>
                  <span>•</span>
                  <span className="font-medium">Your Vision</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="py-16 md:py-32 px-6 bg-neutral-900 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 md:mb-16 scroll-animate fade-up">
              <div className="bg-red-600 text-white px-4 md:px-6 py-2 rounded-full inline-block mb-4 md:mb-6 text-xs md:text-sm font-medium">
                ⚡ NOW BOOKING: Secure Your Date!
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-light mb-4 md:mb-6 leading-tight tracking-tight">
                Secure <span className="italic" style={{color: '#ceb07e'}}>Your Date</span> Today
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-sm md:text-lg font-light tracking-widest mb-6 md:mb-8 text-neutral-300">
                FREE CONSULTATION • NO OBLIGATION • INSTANT RESPONSE
              </p>
              <div className="w-16 h-px bg-neutral-500 mx-auto mb-6 md:mb-8"></div>
              <p className="text-base md:text-lg font-light text-neutral-300 leading-relaxed max-w-2xl mx-auto">
                Tell us about your event and let&apos;s make it unforgettable. Book your free consultation now and we&apos;ll discuss how to bring your vision to life.
              </p>
              <div className="mt-4 md:mt-6 text-neutral-400 text-xs md:text-sm">
                ✓ Quick response time  ✓ No sales pressure  ✓ Custom package options
              </div>
            </div>

            {/* CTA — opens the contact modal */}
            <div className="text-center scroll-animate fade-up delay-200">
              <button
                type="button"
                onClick={() => openContactModal()}
                className="group relative inline-flex items-center justify-center text-white px-10 md:px-16 py-5 md:py-7 font-light text-sm md:text-base uppercase tracking-[0.15em] md:tracking-[0.25em] transition-all duration-500 focus:outline-none hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, #b8996b 0%, #c2a474 50%, #b8996b 100%)`,
                  boxShadow: `0 1px 3px rgba(0,0,0,0.12), 0 4px 12px rgba(206,176,126,0.4), inset 0 1px 0 rgba(255,255,255,0.2)`,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <span className="mr-3">✨</span>
                Book Free Consultation
                <span className="ml-3">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Contact Form Modal — always mounted; visibility toggled so the global
            animation <style> block inside the form stays in the DOM */}
        <div
          className={`fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto transition-opacity duration-300 ${isContactModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
          onClick={closeContactModal}
          aria-hidden={!isContactModalOpen}
        >
          <div
            ref={modalPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            tabIndex={-1}
            className="relative bg-neutral-900 w-full max-w-2xl my-8 md:my-0 max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 md:p-10 border border-white/10 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeContactModal}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-white transition-colors text-2xl leading-none"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <p className="text-xs font-light tracking-widest text-neutral-400 uppercase mb-2">Free Consultation • No Obligation</p>
              <h3 id="contact-modal-title" className="text-2xl md:text-3xl font-light text-white tracking-tight">
                Secure <span className="italic" style={{color: '#ceb07e'}}>Your Date</span>
              </h3>
            </div>
            {/* Simplified Contact Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 md:space-y-6">
              {/* Essential Fields Only */}
              <div>
                <label htmlFor="fullName" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  autoComplete="name"
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Preferred Contact Method *
                </label>
                <div className="grid grid-cols-3 gap-3 md:gap-4 pt-1">
                  {[
                    {
                      value: 'Text',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                        </svg>
                      ),
                    },
                    {
                      value: 'Call',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                      ),
                    },
                    {
                      value: 'Either',
                      icon: (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-9L21 7.5m0 0L16.5 3M21 7.5H7.5" />
                        </svg>
                      ),
                    },
                  ].map((opt) => (
                    <label key={opt.value} className="relative block cursor-pointer">
                      <input
                        type="radio"
                        name="contactMethod"
                        value={opt.value}
                        required
                        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-neutral-600 bg-white/5 py-4 md:py-5 text-neutral-400 transition-all duration-300 peer-hover:border-neutral-400 peer-hover:text-neutral-200 peer-checked:border-[#ceb07e] peer-checked:bg-[#ceb07e]/10 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#ceb07e]/60">
                        {opt.icon}
                        <span className="text-sm font-light tracking-wide">{opt.value}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="serviceType" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Service Interested In *
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg appearance-none cursor-pointer"
                  required
                >
                  <option value="" disabled className="bg-neutral-900 text-neutral-400">Select a package</option>
                  <option value="Luxury Photobooth — Essential" className="bg-neutral-900 text-white">Essential — $400</option>
                  <option value="Luxury Photobooth — Signature" className="bg-neutral-900 text-white">Signature — $600</option>
                  <option value="Luxury Photobooth — Premier" className="bg-neutral-900 text-white">Premier — $1,100</option>
                  <option value="Luxury Photobooth" className="bg-neutral-900 text-white">Not sure yet</option>
                </select>
              </div>

              {/* Trust Signals */}
              <div className="bg-white/5 rounded-lg p-4 text-center text-sm text-neutral-300">
                <p className="text-xs opacity-75">Join 100+ clients who&apos;ve trusted us with their special moments</p>
              </div>

              <div className="pt-6 md:pt-8">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full text-white px-8 md:px-16 py-6 md:py-8 font-light text-sm md:text-base uppercase tracking-[0.15em] md:tracking-[0.25em] transition-all duration-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #b8996b 0%, #c2a474 50%, #b8996b 100%)`,
                    borderRadius: '0',
                    boxShadow: `
                      0 1px 3px rgba(0, 0, 0, 0.12),
                      0 4px 12px rgba(206, 176, 126, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `,
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.background = `linear-gradient(135deg, #a08558 0%, #b8996b 50%, #a08558 100%)`;
                    target.style.transform = 'translateY(-2px)';
                    target.style.boxShadow = `
                      0 4px 8px rgba(0, 0, 0, 0.15),
                      0 8px 20px rgba(184, 153, 107, 0.5),
                      inset 0 1px 0 rgba(255, 255, 255, 0.3),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.15)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    const target = e.currentTarget as HTMLButtonElement;
                    target.style.background = `linear-gradient(135deg, #b8996b 0%, #c2a474 50%, #b8996b 100%)`;
                    target.style.transform = 'translateY(0)';
                    target.style.boxShadow = `
                      0 1px 3px rgba(0, 0, 0, 0.12),
                      0 4px 12px rgba(184, 153, 107, 0.4),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2),
                      inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                    `;
                  }}
                >
                  {/* Shine effect overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)',
                      transform: 'translateX(-100%)',
                      animation: 'shine 2s infinite'
                    }}
                  ></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Securing Your Date...
                      </>
                    ) : (
                      <>
                        <span className="mr-3">✨</span>
                        Secure Your Date
                        <span className="ml-3">→</span>
                      </>
                    )}
                  </span>
                </button>
                
                {/* Luxury Animation Styles */}
                <style jsx global>{`
                  @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                  }

                  @keyframes luxuryFadeInUp {
                    0% { 
                      opacity: 0; 
                      transform: translateY(40px); 
                    }
                    100% { 
                      opacity: 1; 
                      transform: translateY(0); 
                    }
                  }

                  @keyframes luxurySlideInLeft {
                    0% { 
                      opacity: 0; 
                      transform: translateX(-60px); 
                    }
                    100% { 
                      opacity: 1; 
                      transform: translateX(0); 
                    }
                  }

                  @keyframes luxurySlideInRight {
                    0% { 
                      opacity: 0; 
                      transform: translateX(60px); 
                    }
                    100% { 
                      opacity: 1; 
                      transform: translateX(0); 
                    }
                  }

                  @keyframes luxuryScaleIn {
                    0% { 
                      opacity: 0; 
                      transform: scale(0.9); 
                    }
                    100% { 
                      opacity: 1; 
                      transform: scale(1); 
                    }
                  }

                  /* Base states for scroll animations */
                  .scroll-animate {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: none;
                  }

                  .scroll-animate.fade-up {
                    opacity: 0;
                    transform: translateY(40px);
                  }

                  .scroll-animate.slide-left {
                    opacity: 0;
                    transform: translateX(-60px);
                  }

                  .scroll-animate.slide-right {
                    opacity: 0;
                    transform: translateX(60px);
                  }

                  .scroll-animate.scale-in {
                    opacity: 0;
                    transform: scale(0.9);
                  }

                  /* Animated states */
                  .scroll-animate.animate-in.fade-up {
                    animation: luxuryFadeInUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }

                  .scroll-animate.animate-in.slide-left {
                    animation: luxurySlideInLeft 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }

                  .scroll-animate.animate-in.slide-right {
                    animation: luxurySlideInRight 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }

                  .scroll-animate.animate-in.scale-in {
                    animation: luxuryScaleIn 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }

                  /* Staggered delays for multiple elements */
                  .scroll-animate.delay-200 {
                    animation-delay: 200ms;
                  }

                  .scroll-animate.delay-400 {
                    animation-delay: 400ms;
                  }

                  .scroll-animate.delay-600 {
                    animation-delay: 600ms;
                  }

                  .scroll-animate.delay-800 {
                    animation-delay: 800ms;
                  }

                  .scroll-animate.delay-1000 {
                    animation-delay: 1000ms;
                  }

                  /* Hero section entrance animation */
                  .hero-element {
                    opacity: 0;
                    transform: translateY(30px);
                    animation: luxuryFadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                  }

                  .hero-element:nth-child(1) { animation-delay: 200ms; }
                  .hero-element:nth-child(2) { animation-delay: 400ms; }
                  .hero-element:nth-child(3) { animation-delay: 600ms; }
                  .hero-element:nth-child(4) { animation-delay: 800ms; }
                  .hero-element:nth-child(5) { animation-delay: 1000ms; }
                `}</style>
                <div className="text-center mt-4 space-y-2">
                  <p className="text-neutral-400 text-sm">
                    ⚡ We&apos;ll reach out within 24 hours to schedule your consultation
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="text-center pt-6">
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                    <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-light text-white mb-2">Oops!</h3>
                    <p className="text-neutral-300 font-light text-sm">
                      There was an error sending your message. Please try again or contact us directly.
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 bg-white border-t border-neutral-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-light text-sm uppercase tracking-[0.2em] text-neutral-900 mb-4">Navigation</h3>
              <ul className="space-y-2 text-neutral-600 font-light text-sm">
                <li><a href="#home" className="hover:text-neutral-900 transition-colors">Home</a></li>
                <li><a href="#showcase" className="hover:text-neutral-900 transition-colors">Our Work</a></li>
                <li><a href="#pricing" className="hover:text-neutral-900 transition-colors">Packages</a></li>
                <li><a href="#about" className="hover:text-neutral-900 transition-colors">About</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); openContactModal(); }} className="hover:text-neutral-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-light text-sm uppercase tracking-[0.2em] text-neutral-900 mb-4">Packages</h3>
              <ul className="space-y-2 text-neutral-600 font-light text-sm">
                <li><a href="#pricing" className="hover:text-neutral-900 transition-colors">Essential — $400</a></li>
                <li><a href="#pricing" className="hover:text-neutral-900 transition-colors">Signature — $600</a></li>
                <li><a href="#pricing" className="hover:text-neutral-900 transition-colors">Premier — $1,100</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-light text-sm uppercase tracking-[0.2em] text-neutral-900 mb-4">Contact</h3>
              <div className="text-neutral-600 font-light text-sm space-y-2">
                <p>Based in Los Angeles, California.</p>
                <p className="mt-4">E. Info@solimagery.com</p>
                <p>T. 323.949.7568</p>
              </div>
            </div>
            <div>
              <h3 className="font-light text-sm uppercase tracking-[0.2em] text-neutral-900 mb-4">follow along @solimageryla</h3>
              <p className="text-neutral-600 font-light text-sm mb-4">
                Follow along for inspiration, behind-the-scenes peeks, and the artistry that defines our passion for photography.
              </p>
              <div className="flex space-x-4 text-neutral-600 font-light text-sm">
                <a href="https://www.instagram.com/solimageryla/" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors">Instagram →</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-100 mt-16 pt-8 text-center">
            <p className="text-neutral-600 font-light text-sm">© 2025 Sol Imagery. All rights reserved.</p>
            {/* <p className="text-neutral-500 font-light text-xs mt-2">Privacy Policy | Terms & Conditions</p> */}
          </div>
        </div>
      </footer>
    </div>
  );
}
