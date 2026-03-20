'use client'

import { useState, type FormEvent } from 'react'

interface NewsletterSignupProps {
  locale: string
}

export default function NewsletterSignup({ locale }: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email) return
    console.log('[Newsletter] Email submitted:', email)
    setSubmitted(true)
    setEmail('')
  }

  const isFr = locale === 'fr'

  return (
    <section className="bg-obsidian-gradient grain-overlay relative py-20 lg:py-28">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-gold/30 to-transparent" />
      </div>
      <div className="relative max-w-xl mx-auto px-6 sm:px-8 text-center">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
          {isFr ? 'Recevez nos dernières sélections' : 'Get our latest selections'}
        </h2>
        <p className="font-inter text-white/60 text-sm leading-relaxed mb-8 max-w-md mx-auto">
          {isFr
            ? 'Les meilleurs vins et spiritueux à la carte des restaurants gastronomiques étoilés, directement dans votre boîte mail.'
            : 'The finest wines and spirits from Michelin-starred restaurant wine lists, delivered to your inbox.'}
        </p>

        {submitted ? (
          <div className="glass-card rounded-xl p-8 bg-white/5 backdrop-blur-sm border border-gold/20">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-gold">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-inter text-white/80 text-sm">
              {isFr ? 'Merci ! Vous recevrez nos prochaines sélections.' : 'Thank you! You will receive our next selections.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-card rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-gold/20">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isFr ? 'Votre adresse email' : 'Your email address'}
                required
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-3
                           text-white placeholder-white/40 font-inter text-sm
                           focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30
                           transition-all duration-normal"
              />
              <button
                type="submit"
                className="bg-gradient-gold text-obsidian font-inter font-semibold text-sm
                           px-6 py-3 rounded-lg
                           hover:shadow-gold transition-all duration-normal
                           whitespace-nowrap"
              >
                {isFr ? "S'inscrire" : 'Subscribe'}
              </button>
            </div>
            <p className="mt-3 text-[11px] font-inter text-white/30">
              {isFr
                ? 'Pas de spam. Désabonnement en un clic.'
                : 'No spam. Unsubscribe in one click.'}
            </p>
          </form>
        )}
      </div>
    </section>
  )
}
