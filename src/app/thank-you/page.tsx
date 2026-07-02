'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ThankYou() {
  useEffect(() => {
    // Only treat this view as a real conversion if we actually arrived from a form
    // submission. handleSubmit stashes the chosen service under `sol_pending_lead`
    // immediately before redirecting here; we consume it once. This means direct
    // visits, refreshes, shared/bookmarked links, and crawlers never fire a phantom
    // Lead — and because the flag is consumed (not a sticky once-per-session guard),
    // a second genuine submission in the same session fires its own Lead too.
    let service: string | null = null;
    try {
      service = sessionStorage.getItem('sol_pending_lead');
      if (service !== null) sessionStorage.removeItem('sol_pending_lead');
    } catch {
      // sessionStorage blocked (privacy mode) — treat as no pending conversion.
    }
    if (service === null) return;

    // We reached /thank-you via client-side (SPA) navigation from the form, where the
    // layout's base pixel does NOT re-fire PageView — so fire it once here. Gating it
    // on the pending flag avoids the double-count that a hard load would otherwise cause.
    window.fbq?.('track', 'PageView');

    // Attach the chosen package so Ads Manager can attribute conversions (and value)
    // per photobooth tier.
    const PACKAGES: Record<string, { content_name: string; value: number }> = {
      'Luxury Photobooth — Essential': { content_name: 'Essential', value: 400 },
      'Luxury Photobooth — Signature': { content_name: 'Signature', value: 600 },
      'Luxury Photobooth — Premier': { content_name: 'Premier', value: 1100 },
    };
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
