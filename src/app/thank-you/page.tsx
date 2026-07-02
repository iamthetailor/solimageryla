'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ThankYou() {
  useEffect(() => {
    // Fire the Meta conversion. Tying the Lead event to this dedicated /thank-you
    // URL gives Meta a clean, deliberate conversion signal (instead of the
    // auto-detected "Subscribe" guessed from the contact form).
    //
    // Re-fire PageView so the /thank-you URL is registered on client-side (SPA)
    // navigation, where the layout <Script> does not re-run. This keeps the
    // URL-based conversion option alive in Ads Manager. fbq queues calls made
    // before the pixel finishes loading, so this is safe.
    window.fbq?.('track', 'PageView');

    // Guard the conversion against double-counting: a refresh, back/forward, or
    // bookmark hit of this URL would otherwise re-fire Lead and inflate
    // conversions. Fire it at most once per browser session.
    if (sessionStorage.getItem('sol_lead_fired')) return;
    sessionStorage.setItem('sol_lead_fired', '1');

    // Attach the chosen package to the Lead so Ads Manager can attribute
    // conversions (and value) per photobooth tier. The `service` comes from the
    // contact form's redirect (?service=…). Read window.location directly so we
    // stay client-only and avoid a useSearchParams Suspense boundary.
    const PACKAGES: Record<string, { content_name: string; value: number }> = {
      'Luxury Photobooth — Essential': { content_name: 'Essential', value: 400 },
      'Luxury Photobooth — Signature': { content_name: 'Signature', value: 600 },
      'Luxury Photobooth — Premier': { content_name: 'Premier', value: 1100 },
    };
    const service = new URLSearchParams(window.location.search).get('service') || '';
    const pkg = PACKAGES[service];
    const leadParams = pkg
      ? { content_name: pkg.content_name, content_category: 'Luxury Photobooth', value: pkg.value, currency: 'USD' }
      : service
        ? { content_name: service }
        : undefined;
    window.fbq?.('track', 'Lead', leadParams);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full text-center">
        <Link href="/" className="inline-block mb-10 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/sol-imagery-logo-gold.png"
            alt="Sol Imagery"
            className="h-16 w-auto mx-auto"
          />
        </Link>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-8 md:p-10">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl md:text-4xl font-light mb-4 tracking-tight">
            Thank <span className="italic" style={{ color: '#ceb07e' }}>You</span>
          </h1>
          <div className="w-16 h-px mx-auto mb-6" style={{ backgroundColor: '#ceb07e' }}></div>
          <p className="text-neutral-300 font-light text-base md:text-lg mb-6">
            Your consultation request has been received successfully!
          </p>
          <div
            className="rounded-lg p-4 mb-6"
            style={{ backgroundColor: 'rgba(206, 176, 126, 0.2)' }}
          >
            <p className="text-sm md:text-base font-medium" style={{ color: '#ceb07e' }}>
              📞 We&apos;ll reach out within 24 hours to schedule your free consultation
            </p>
          </div>
          <p className="text-neutral-400 text-xs md:text-sm">
            Questions? Feel free to call us directly or send us a message on Instagram.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block mt-10 text-xs md:text-sm uppercase tracking-[0.2em] text-neutral-300 hover:text-white transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
