'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      // For now, we'll simulate a form submission
      // In production, you'd send this to your backend or a service like Formspree
      console.log('Form submission:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
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
            <a href="#home" className="flex items-center hover:opacity-80 transition-opacity">
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
              <a href="#offerings" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>OFFERINGS</a>
              <a href="#about" className={`py-2 transition-all duration-300 ${
                isScrolled ? 'hover:text-neutral-900' : 'hover:text-white'
              }`}>ABOUT</a>
              <a href="#contact" className={`bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-300 hover:bg-white ${
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
                  href="#offerings" 
                  onClick={closeMobileMenu}
                  className="block text-neutral-900 font-light text-lg uppercase tracking-[0.25em] hover:text-neutral-600 transition-colors duration-200"
                >
                  Offerings
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
                  onClick={closeMobileMenu}
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
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/EAWedding-00953.jpg" 
              alt="Elegant wedding photography" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
            <div className="mb-6 hero-element">
              <span className="bg-white/10 backdrop-blur-sm text-white px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-light tracking-wide text-center">
                <span className="hidden sm:inline">✨ Passionate Photographers Making Magic Happen</span>
                <span className="sm:hidden">✨ Making Magic Happen</span>
              </span>
            </div>
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-thin text-white mb-6 md:mb-8 leading-tight tracking-tight hero-element">
              Exceptional Wedding Photography
            </h1>
            <p className="text-lg md:text-2xl text-white/95 font-light mb-4 md:mb-6 tracking-wide hero-element">
              Turn Your Dream Wedding Into Timeless Art
            </p>
            <p className="hidden md:block text-lg text-white/80 font-light mb-8 max-w-3xl mx-auto hero-element">
              Los Angeles&apos; most sought-after luxury wedding photographers. Limited availability for 2025-2026.
            </p>
            <div className="flex justify-center items-center mb-12 md:mb-16 hero-element">
              <a href="#contact" className="bg-white text-neutral-900 px-6 md:px-10 py-3 md:py-5 font-medium text-xs md:text-sm uppercase tracking-[0.2em] hover:bg-neutral-100 transition-all duration-300 transform hover:scale-105 shadow-2xl">
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
                  Why <span className="italic">Couples</span> Choose 
                  <br className="hidden sm:block" />
                  <span className="sm:hidden"> </span>Sol Imagery
                </h2>
                <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
                <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                  Discover what sets us apart in the world of luxury wedding photography
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
                        <p className="text-neutral-600 leading-relaxed">We focus on a select number of couples to ensure exceptional attention</p>
                      </div>
                    </div>
                  </div>

                  {/* Center Image */}
                  <div className="lg:col-span-1 relative group scroll-animate fade-up delay-600">
                    <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                      <img 
                        src="/images/EAWedding-00805.jpg" 
                        alt="Elegant wedding moment" 
                        className="w-full h-[400px] md:h-[700px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      <div className="absolute bottom-8 left-8 right-8">
                        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 text-center">
                          <p className="text-neutral-900 font-light italic text-lg">
                            &ldquo;Creating timeless memories for extraordinary couples&rdquo;
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
                  Join couples who&apos;ve chosen Sol Imagery to capture their most precious moments
                </p>
                <a 
                  href="#contact" 
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
                Our <span className="italic">Featured</span> Work
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                A curated selection featuring Evelyn & Angel&apos;s special day and our most cherished moments of artistry
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-16">
              <div className="group overflow-hidden scroll-animate slide-left delay-200">
                <img 
                  src="/images/EAWedding-00848.jpg" 
                  alt="Wedding detail" 
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate slide-right delay-400">
                <img 
                  src="/images/EA-06043.jpg" 
                  alt="Couple portrait" 
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="group overflow-hidden scroll-animate fade-up delay-200">
                <img 
                  src="/images/EAWedding-00996.jpg" 
                  alt="Wedding moment" 
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate fade-up delay-400">
                <img 
                  src="/images/EA-06372.jpg" 
                  alt="Romantic moment" 
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="group overflow-hidden scroll-animate fade-up delay-600">
                <img 
                  src="/images/EAWedding-01079.jpg" 
                  alt="Intimate moment" 
                  className="w-full h-[200px] md:h-[300px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
            </div>
            
          </div>
        </section>

        {/* Offerings Section */}
        <section id="offerings" className="py-12 md:py-24 px-6 bg-neutral-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 md:mb-20 scroll-animate fade-up">
              <p className="text-xs md:text-sm font-light text-neutral-500 uppercase tracking-[0.2em] mb-3 md:mb-4">tailored for you</p>
              <h2 className="text-4xl md:text-7xl font-light text-neutral-900 mb-4 md:mb-6 tracking-tight">
                Your <span className="italic font-light">Perfect</span> Experience
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed">
                From intimate ceremonies to grand celebrations, we craft each moment with artistry designed around your unique vision
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-white p-6 md:p-8 text-center scroll-animate fade-up delay-200">
                <h3 className="text-lg md:text-xl font-light text-neutral-900 mb-3 md:mb-4">Weddings</h3>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  Luxury wedding photography that captures the essence of your special day with timeless elegance.
                </p>
              </div>
              <div className="bg-white p-6 md:p-8 text-center scroll-animate fade-up delay-400">
                <h3 className="text-lg md:text-xl font-light text-neutral-900 mb-3 md:mb-4">Portraits</h3>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  Sophisticated portrait sessions that reveal your authentic self through artistic vision.
                </p>
              </div>
              <div className="bg-white p-6 md:p-8 text-center scroll-animate fade-up delay-600">
                <h3 className="text-lg md:text-xl font-light text-neutral-900 mb-3 md:mb-4">Engagements</h3>
                <p className="text-sm md:text-base text-neutral-600 font-light leading-relaxed">
                  Romantic engagement sessions that celebrate your love story in beautiful locations.
                </p>
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
                  alt="Behind the scenes" 
                  className="w-full h-[300px] md:h-[500px] object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="order-2 lg:order-2 lg:pl-8 scroll-animate slide-right delay-400">
                <p className="text-lg text-neutral-700 font-light leading-[1.8]">
                  We are a team of talented photographers dedicated to capturing the heart of your story. We believe in 
                  creating more than just beautiful photos; we strive to encapsulate the true essence of your moments. 
                  From candid smiles to grand celebrations, our collective expertise ensures every detail is thoughtfully 
                  documented. With a seamless blend of creativity and professionalism, we make your experience enjoyable 
                  and your memories unforgettable.
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
                What Our <span className="italic" style={{color: '#ceb07e'}}>Couples</span> Say
              </h2>
              <div className="w-24 h-px mx-auto mb-6 md:mb-8" style={{backgroundColor: '#ceb07e'}}></div>
              <p className="text-lg md:text-xl text-neutral-600 font-light max-w-2xl mx-auto leading-relaxed mb-8 md:mb-12">
                Hear from the couples who trusted us to capture their most important day
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
                ⚡ NOW ACCEPTING BOOKINGS: Secure Your Date!
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
                Don&apos;t let your dream wedding photos slip away. Book your free consultation now and let&apos;s discuss how to make your vision a reality.
              </p>
              <div className="mt-4 md:mt-6 text-neutral-400 text-xs md:text-sm">
                ✓ Quick response time  ✓ No sales pressure  ✓ Custom package options
              </div>
            </div>

            {/* Simplified Contact Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 md:space-y-6 scroll-animate fade-up delay-200">
              {/* Essential Fields Only */}
              <div>
                <label htmlFor="fullName" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
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
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>

              <div>
                <label htmlFor="weddingDate" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Wedding Date (Approximate)
                </label>
                <input
                  type="text"
                  id="weddingDate"
                  name="weddingDate"
                  className="w-full bg-transparent border-b border-neutral-500 py-4 px-0 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light text-lg"
                  placeholder="e.g., Fall 2025 or June 2026"
                />
              </div>

              <div>
                <label htmlFor="dreamWedding" className="block text-xs md:text-sm font-light uppercase tracking-[0.2em] text-neutral-300 mb-2 md:mb-3">
                  Describe Your Dream Wedding
                </label>
                <textarea
                  id="dreamWedding"
                  name="dreamWedding"
                  rows={3}
                  className="w-full bg-transparent border border-neutral-500 rounded-lg py-4 px-4 text-white placeholder-neutral-400 focus:border-white focus:outline-none transition-colors duration-300 font-light resize-vertical"
                  placeholder="Tell us about your vision, style, location, or any special details..."
                ></textarea>
              </div>

              {/* Trust Signals */}
              <div className="bg-white/5 rounded-lg p-4 text-center text-sm text-neutral-300">
                <p className="text-xs opacity-75">Join 100+ couples who&apos;ve trusted us with their special day</p>
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
                    ⚡ We&apos;ll call you within 2 hours to schedule your consultation
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="text-center pt-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-medium text-white mb-2">Thank You!</h3>
                    <p className="text-neutral-300 font-light text-sm mb-4">
                      Your consultation request has been received successfully!
                    </p>
                    <div className="rounded-lg p-4 mb-4" style={{backgroundColor: 'rgba(206, 176, 126, 0.2)'}}>
                      <p className="text-sm font-medium" style={{color: '#ceb07e'}}>
                        📞 We&apos;ll call you within 2 hours to schedule your free consultation
                      </p>
                    </div>
                    <p className="text-neutral-400 text-xs">
                      Questions? Feel free to call us directly or send us a message on Instagram.
                    </p>
                  </div>
                </div>
              )}

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

              {submitStatus === 'idle' && (
                <div className="text-center pt-8">
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="flex justify-center items-center space-x-8 mb-4">
                      <div className="text-center">
                        <div className="text-2xl mb-1">⚡</div>
                        <div className="text-xs text-neutral-400">Fast Response</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">💎</div>
                        <div className="text-xs text-neutral-400">Premium Service</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">📞</div>
                        <div className="text-xs text-neutral-400">Free Consultation</div>
                      </div>
                    </div>
                    <p className="text-neutral-300 font-light text-sm">
                      Join couples who&apos;ve already booked their dream photographer with Sol Imagery!
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </section>
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
                <li><a href="#offerings" className="hover:text-neutral-900 transition-colors">Offerings</a></li>
                <li><a href="#about" className="hover:text-neutral-900 transition-colors">About</a></li>
                <li><a href="#contact" className="hover:text-neutral-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-light text-sm uppercase tracking-[0.2em] text-neutral-900 mb-4">Services</h3>
              <ul className="space-y-2 text-neutral-600 font-light text-sm">
                <li><a href="#offerings" className="hover:text-neutral-900 transition-colors">Weddings</a></li>
                <li><a href="#offerings" className="hover:text-neutral-900 transition-colors">Portraits</a></li>
                <li><a href="#offerings" className="hover:text-neutral-900 transition-colors">Engagements</a></li>
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
                Follow along for inspiration, behind-the-scenes peeks, and the artistry that defines our passion for wedding photography.
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
