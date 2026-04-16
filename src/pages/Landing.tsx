import { useState, useEffect, type FormEvent } from 'react'

type OrderType = 'market' | 'limit' | 'dca' | 'stoploss'
type SubmissionState = 'idle' | 'submitting' | 'success' | 'error'

const ORDER_TYPES: { key: OrderType; name: string; desc: string }[] = [
  {
    key: 'market',
    name: 'Market Orders',
    desc: 'Trade supported Canton pairs through a wallet-aware flow with live quotes, route visibility, and settlement evidence designed to stay visible beyond the UI.',
  },
  {
    key: 'limit',
    name: 'Limit Orders',
    desc: 'Define target conditions and let the trigger layer evaluate them against market data, then route eligible executions through the same native settlement backbone.',
  },
  {
    key: 'dca',
    name: 'DCA Automation',
    desc: 'Create recurring strategies over supported pairs with wallet-authorized mandates, operator-readable slots, and clear evidence for each scheduled execution.',
  },
  {
    key: 'stoploss',
    name: 'Stop-Loss Protection',
    desc: 'Set protective trigger conditions with slippage and expiry controls, so risk actions can follow the same explicit execution path as other strategies.',
  },
]

const WHY_CANTON = [
  {
    eyebrow: 'Privacy',
    title: 'No public mempool exposure',
    desc: 'Canton privacy lets trading intent, balances, and strategy details stay scoped to the parties that actually participate in the workflow.',
  },
  {
    eyebrow: 'Authority',
    title: 'Explicit actor boundaries',
    desc: 'Trader intent, counterparty commitment, venue coordination, and settlement evidence stay separate instead of being hidden behind one backend identity.',
  },
  {
    eyebrow: 'Wallets',
    title: 'Wallet-backed authorization',
    desc: 'Pinnaccle is designed around hosted wallet onboarding first, with user economic actions moving through wallet-aware approval and evidence surfaces.',
  },
  {
    eyebrow: 'Truth',
    title: 'Ledger-visible settlement state',
    desc: 'Important execution stages are modeled as durable Canton state so operators can inspect what happened without relying on backend-only shadow truth.',
  },
]

const LIVE_TODAY = [
  {
    label: 'Local proof baseline',
    status: 'Proven locally',
    desc: 'Wallet-native market settlement, explicit-counterparty execution, triggered limit / stop-loss paths, and delegated DCA proof flows are exercised in LocalNet.',
  },
  {
    label: 'Bounded DevNet alpha',
    status: 'Next external replay',
    desc: 'The near-term DevNet goal is intentionally narrow: a hosted-alpha market smoke with explicit counterparty and wallet-aware integration evidence.',
  },
  {
    label: 'Native settlement backbone',
    status: 'Active migration path',
    desc: 'Market, triggered strategies, and DCA are being aligned around one settlement backbone instead of separate feature-specific shortcuts.',
  },
  {
    label: 'Follow-on roadmap',
    status: 'Tracked separately',
    desc: 'Broader DevNet interoperability, CIP-56 expansion, RFQ / LP surfaces, and OTC flows remain explicit roadmap work rather than hidden launch claims.',
  },
]

const DEMO_DATA: Record<OrderType, { from: string; fromAmount: string; to: string; toAmount: string; extra?: string; extraLabel?: string }> = {
  market:   { from: 'USDCx', fromAmount: '500.00',  to: 'CC', toAmount: '1,036.49' },
  limit:    { from: 'USDCx', fromAmount: '1,000.00', to: 'CC', toAmount: '2,222.22', extra: '0.4500', extraLabel: 'Target Price' },
  dca:      { from: 'USDCx', fromAmount: '100.00',  to: 'CC', toAmount: '207.29',   extra: 'Weekly', extraLabel: 'Frequency' },
  stoploss: { from: 'CC',    fromAmount: '2,000.00', to: 'USDCx', toAmount: '840.00', extra: '0.4200', extraLabel: 'Stop Price' },
}

const TAB_LABELS: Record<OrderType, string> = {
  market: 'Market', limit: 'Limit', dca: 'DCA', stoploss: 'Stop',
}

const inboxEmail = ((import.meta.env as ImportMetaEnv & {
  VITE_PUBLIC_INBOX_EMAIL?: string
  VITE_PUBLIC_FORM_ENDPOINT?: string
}).VITE_PUBLIC_INBOX_EMAIL ?? 'info@pinnaccle.xyz').trim()

const inboxFormEndpoint = ((import.meta.env as ImportMetaEnv & {
  VITE_PUBLIC_FORM_ENDPOINT?: string
}).VITE_PUBLIC_FORM_ENDPOINT ?? `https://formsubmit.co/ajax/${inboxEmail}`).trim()

async function submitInboxForm(subject: string, fields: Record<string, string>) {
  const formData = new FormData()

  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value)
  })

  formData.append('_subject', subject)
  formData.append('_captcha', 'false')
  formData.append('_template', 'table')

  if (fields.email) {
    formData.append('_replyto', fields.email)
  }

  const response = await fetch(inboxFormEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || payload?.success === 'false') {
    throw new Error(payload?.message ?? 'Submission failed')
  }
}

export default function Landing() {
  const [activeType, setActiveType] = useState<OrderType>('market')
  const [contentVisible, setContentVisible] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactStatus, setContactStatus] = useState<SubmissionState>('idle')
  const [contactFeedback, setContactFeedback] = useState('')
  const [waitlistForm, setWaitlistForm] = useState({ name: '', email: '', handle: '' })
  const [waitlistStatus, setWaitlistStatus] = useState<SubmissionState>('idle')
  const [waitlistFeedback, setWaitlistFeedback] = useState('')

  useEffect(() => {
    const keys = ORDER_TYPES.map(t => t.key)
    let idx = 0

    const interval = setInterval(() => {
      setContentVisible(false)
      setTimeout(() => {
        idx = (idx + 1) % keys.length
        setActiveType(keys[idx])
        setTimeout(() => setContentVisible(true), 50)
      }, 200)
    }, 3500)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    document.body.classList.add('landing-scrollless')
    document.documentElement.classList.add('landing-scrollless')

    return () => {
      document.body.classList.remove('landing-scrollless')
      document.documentElement.classList.remove('landing-scrollless')
    }
  }, [])

  const demo = DEMO_DATA[activeType]

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setContactStatus('submitting')
    setContactFeedback('')

    try {
      await submitInboxForm('Pinnaccle Website Contact Request', {
        name: contactForm.name,
        email: contactForm.email,
        message: contactForm.message,
        source: 'website-contact',
      })
      setContactStatus('success')
      setContactFeedback(`Your note is on its way to ${inboxEmail}.`)
      setContactForm({ name: '', email: '', message: '' })
    } catch {
      setContactStatus('error')
      setContactFeedback('We could not send that note right now. Please email us directly and we will pick it up manually.')
    }
  }

  async function handleWaitlistSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWaitlistStatus('submitting')
    setWaitlistFeedback('')

    try {
      await submitInboxForm('Pinnaccle Waitlist Request', {
        name: waitlistForm.name,
        email: waitlistForm.email,
        tg_or_discord: waitlistForm.handle,
        source: 'website-waitlist',
      })
      setWaitlistStatus('success')
      setWaitlistFeedback(`You are in. The waitlist request has been sent to ${inboxEmail}.`)
      setWaitlistForm({ name: '', email: '', handle: '' })
    } catch {
      setWaitlistStatus('error')
      setWaitlistFeedback('We could not save your waitlist request right now. Please email us directly and we will add you manually.')
    }
  }

  return (
    <div>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-brand">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Pinnaccle" className="nav-logo nav-logo-landing" />
        </div>
        <ul className="nav-links">
          <li><a href="#features" className="nav-link">Features</a></li>
          <li><a href="#why-canton" className="nav-link">Why Canton</a></li>
          <li><a href="#how" className="nav-link">FAQ</a></li>
          <li><a href="#early-access" className="nav-link">Early Access</a></li>
          <li><a href="#waitlist-form" className="btn btn-accent btn-sm">Join Waitlist ↗</a></li>
          <li><button type="button" className="nav-cta disabled" disabled>Coming Soon</button></li>
        </ul>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content">
          <div className="hero-tag fade-up">Built on Canton Network</div>
          <h1 className="hero-title fade-up fade-up-1">
            Wallet-native trading<br/>
            infrastructure for Canton.
          </h1>
          <p className="hero-desc fade-up fade-up-2">
            Pinnaccle coordinates market, limit, DCA, and stop-loss strategies through explicit
            counterparty flows, wallet-backed authorization, and ledger-visible settlement evidence.
          </p>
          <div className="hero-actions fade-up fade-up-3">
            <a href="#waitlist-form" className="btn btn-accent btn-lg">Join Waitlist ↗</a>
            <button type="button" className="btn btn-outline btn-lg btn-disabled" disabled>Coming Soon</button>
          </div>
        </div>
      </section>

      {/* Why Canton */}
      <section className="why-section" id="why-canton">
        <div className="why-copy">
          <div className="features-tag">Why Pinnaccle on Canton?</div>
          <h2 className="why-title">A trading venue should not become the hidden truth layer.</h2>
          <p className="why-desc">
            Pinnaccle uses Canton to keep privacy, authority, and settlement state aligned with the
            economic actors in the trade. The venue coordinates execution, but trader actions,
            counterparty commitments, and settlement evidence remain explicit.
          </p>
        </div>
        <div className="why-grid">
          {WHY_CANTON.map(item => (
            <div className="why-card" key={item.title}>
              <div className="why-card-eyebrow">{item.eyebrow}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features — Interactive Demo */}
      <section className="features" id="features">
        <div className="features-header" style={{ maxWidth: 'none', marginBottom: 60 }}>
          <div className="features-tag">Strategy Layer</div>
          <h2 className="features-title">Multiple trading strategies. One native settlement backbone.</h2>
          <p className="features-desc" style={{ maxWidth: 680 }}>
            The product goal is not a collection of disconnected order widgets. Each strategy is
            designed to converge on the same Canton-native execution and evidence model.
          </p>
        </div>

        <div className="feat-split">
          {/* Left: All descriptions always visible */}
          <div className="feat-left">
            {ORDER_TYPES.map(t => (
              <div key={t.key} className={`feat-item ${activeType === t.key ? 'active' : ''}`}>
                <div className="feat-item-bar" />
                <div>
                  <div className="feat-item-name">{t.name}</div>
                  <div className="feat-item-desc">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Animated Swap Panel */}
          <div className="feat-right">
            <div className="demo-panel">
              {/* Order Type Tabs */}
              <div className="demo-tabs">
                {ORDER_TYPES.map(t => (
                  <div key={t.key} className={`demo-tab ${activeType === t.key ? 'active' : ''}`}>
                    {TAB_LABELS[t.key]}
                  </div>
                ))}
              </div>

              {/* Panel Content */}
              <div className={`demo-content ${contentVisible ? 'visible' : ''}`}>
                {/* From */}
                <div className="demo-field">
                  <div className="demo-field-label">From</div>
                  <div className="demo-field-row">
                    <div className="demo-field-value">{demo.fromAmount}</div>
                    <div className="demo-field-asset">{demo.from}</div>
                  </div>
                </div>

                {/* Swap Icon */}
                <div className="demo-swap-icon">⇅</div>

                {/* To */}
                <div className="demo-field">
                  <div className="demo-field-label">To (estimated)</div>
                  <div className="demo-field-row">
                    <div className="demo-field-value accent">{demo.toAmount}</div>
                    <div className="demo-field-asset">{demo.to}</div>
                  </div>
                </div>

                {/* Extra field for limit/dca/stoploss */}
                {demo.extra && (
                  <div className="demo-field">
                    <div className="demo-field-label">{demo.extraLabel}</div>
                    <div className="demo-field-row">
                      <div className="demo-field-value">{demo.extra}</div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="demo-summary">
                  <div className="demo-summary-row">
                    <span>Route</span>
                    <span>{demo.from} → {demo.to}</span>
                  </div>
                  <div className="demo-summary-row">
                    <span>Authority</span>
                    <span>Wallet-backed</span>
                  </div>
                  <div className="demo-summary-row">
                    <span>Evidence</span>
                    <span>Ledger-visible</span>
                  </div>
                </div>

                {/* Button */}
                <div className="demo-btn">
                  Swap {demo.from} → {demo.to} ↗
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Today */}
      <section className="live-section" id="live-today">
        <div className="live-header">
          <div className="features-tag">What is live today?</div>
          <h2 className="live-title">Strong local proof, disciplined DevNet path.</h2>
          <p className="live-desc">
            We keep the claim set precise: Pinnaccle already has a real Canton-native local proof
            posture, while the first external DevNet step is a bounded alpha replay rather than an
            overstated production claim.
          </p>
        </div>
        <div className="live-list">
          {LIVE_TODAY.map(item => (
            <div className="live-row" key={item.label}>
              <div>
                <div className="live-label">{item.label}</div>
                <p>{item.desc}</p>
              </div>
              <span>{item.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="how">
        <div className="faq-inner">
          <div className="faq-header">
            <div className="features-tag">FAQ</div>
            <h2 className="faq-title">Have Questions?</h2>
          </div>

          <div className="faq-layout">
            <div className="faq-list">
              {[
                {
                  q: 'What is Canton Network?',
                  a: 'Canton is a privacy-preserving network for multi-party financial workflows. It is designed for applications where participant boundaries, selective visibility, and auditable state matter.'
                },
                {
                  q: 'How does privacy work on Canton?',
                  a: 'Canton supports sub-transaction privacy. Each participant sees the parts of a workflow they are involved in, which helps keep trader intent, counterparty actions, balances, and strategy details from becoming globally visible.'
                },
                {
                  q: 'What order types does Pinnaccle support?',
                  a: 'Pinnaccle supports market, limit, DCA, and stop-loss flows for supported Canton pairs. The important design point is that these strategies are being aligned around one native settlement and evidence backbone.'
                },
                {
                  q: 'What assets can I trade?',
                  a: 'Canton Coin (CC) and USDCx at launch. As the Canton ecosystem grows and more tokenized assets join the network, additional pairs will be added.'
                },
                {
                  q: 'How does the wallet model work?',
                  a: 'The first user experience is hosted onboarding: users can create an account and receive a wallet-backed trading surface through Pinnaccle. Bring-your-own-wallet can be added later as a separate integration program if it strengthens the product without weakening the Canton-native model.'
                },
                {
                  q: 'What is live today?',
                  a: 'The strongest current proof is local: native market settlement, explicit-counterparty execution, triggered limit / stop-loss paths, and delegated DCA flows are exercised in LocalNet. The next external milestone is a bounded DevNet alpha replay.'
                },
                {
                  q: 'How does settlement state work?',
                  a: 'Pinnaccle avoids presenting backend-only state as final truth. Important trading and settlement stages are designed to leave durable, inspectable evidence through Canton contracts and wallet-aware read surfaces.'
                },
                {
                  q: 'What are Daml smart contracts?',
                  a: 'Daml is a type-safe, functional smart contract language created by Digital Asset. It defines explicit rights and obligations for each party, reducing the surface area for bugs common in other contract languages.'
                },
              ].map((item, i) => (
                <div key={i} className={`faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{item.q}</span>
                    <span className="faq-toggle">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  <div className="faq-answer">
                    <p>{item.a}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="faq-sidebar">
              <div className="faq-contact">
                <h3 className="faq-contact-title">Don't See the Answer You Need?</h3>
                <p className="faq-contact-desc">
                  Reach us directly at <a href={`mailto:${inboxEmail}`} className="inline-mail-link">{inboxEmail}</a> or send a quick note below.
                </p>
                <form className="site-form site-form-light" onSubmit={handleContactSubmit}>
                  <label className="site-form-label" htmlFor="contact-name">Name</label>
                  <input
                    id="contact-name"
                    className="site-input"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={contactForm.name}
                    onChange={(event) => setContactForm(prev => ({ ...prev, name: event.target.value }))}
                    required
                  />

                  <label className="site-form-label" htmlFor="contact-email">Email</label>
                  <input
                    id="contact-email"
                    className="site-input"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={contactForm.email}
                    onChange={(event) => setContactForm(prev => ({ ...prev, email: event.target.value }))}
                    required
                  />

                  <label className="site-form-label" htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className="site-input site-textarea"
                    name="message"
                    value={contactForm.message}
                    onChange={(event) => setContactForm(prev => ({ ...prev, message: event.target.value }))}
                    required
                  />

                  <button type="submit" className="btn btn-dark btn-sm btn-full" disabled={contactStatus === 'submitting'}>
                    {contactStatus === 'submitting' ? 'Sending...' : 'Contact Us'}
                  </button>

                  {contactFeedback && (
                    <p className={`form-feedback ${contactStatus}`}>
                      {contactFeedback}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Early Access CTA */}
      <section className="cta-section" id="early-access">
        <div className="features-tag" style={{marginBottom: 16}}>Early Access</div>
        <h2 className="cta-title">Join the Canton-native trading alpha.</h2>
        <p className="cta-desc">
          Pinnaccle is building a wallet-native venue for advanced strategies, explicit
          counterparty execution, and ledger-visible settlement evidence. Join the waitlist
          to follow the alpha and get early access as the DevNet path opens.
        </p>
        <form className="site-form cta-form" id="waitlist-form" onSubmit={handleWaitlistSubmit}>
          <div className="site-form-grid">
            <div>
              <label className="site-form-label site-form-label-dark" htmlFor="waitlist-name">Name</label>
              <input
                id="waitlist-name"
                className="site-input site-input-dark"
                type="text"
                name="name"
                autoComplete="name"
                value={waitlistForm.name}
                onChange={(event) => setWaitlistForm(prev => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="site-form-label site-form-label-dark" htmlFor="waitlist-email">Email</label>
              <input
                id="waitlist-email"
                className="site-input site-input-dark"
                type="email"
                name="email"
                autoComplete="email"
                value={waitlistForm.email}
                onChange={(event) => setWaitlistForm(prev => ({ ...prev, email: event.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="site-form-label site-form-label-dark" htmlFor="waitlist-handle">Telegram or Discord</label>
            <input
              id="waitlist-handle"
              className="site-input site-input-dark"
              type="text"
              name="tg_or_discord"
              placeholder="@username"
              value={waitlistForm.handle}
              onChange={(event) => setWaitlistForm(prev => ({ ...prev, handle: event.target.value }))}
              required
            />
          </div>

          <div className="cta-actions">
            <button type="submit" className="btn btn-accent btn-lg btn-coming-soon" disabled={waitlistStatus === 'submitting'}>
              {waitlistStatus === 'submitting' ? 'Submitting...' : 'Join Waitlist ↗'}
            </button>
            <a href="#features" className="btn btn-outline-light btn-lg">Explore Features</a>
          </div>

          {waitlistFeedback && (
            <p className={`form-feedback form-feedback-dark ${waitlistStatus}`}>
              {waitlistFeedback}
            </p>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Pinnaccle" className="nav-logo nav-logo-footer" style={{ filter: 'brightness(0) invert(1)' }} />
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#why-canton">Why Canton</a>
            <a href="#live-today">Live Today</a>
            <a href="#early-access">Early Access</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
