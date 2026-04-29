import LegalShell from './LegalShell'

export default function Cookies() {
  return (
    <LegalShell title="Cookie policy" updated="30 April 2026">
      <p>
        This policy explains the cookies and similar technologies the OurPath
        portal uses, why we use them, and how you can control them.
      </p>

      <h2>What are cookies?</h2>
      <p>
        Cookies are small text files stored on your device by your browser
        when you visit a website. They allow the site to remember things
        about you (like keeping you signed in) between page loads.
      </p>

      <h2>What we use</h2>
      <p>The portal uses only <strong>strictly necessary cookies</strong> — without these the portal cannot function:</p>
      <ul>
        <li>
          <strong>Authentication cookie</strong> (set by Supabase) — keeps you
          signed in between page loads. Cleared when you sign out or it
          expires (typically after one week of inactivity).
        </li>
        <li>
          <strong>Session storage</strong> (set by Supabase) — temporarily
          holds the access token used to authenticate API requests. Lives
          only in your browser; never sent to any third party.
        </li>
      </ul>

      <p>
        We do <strong>not</strong> use analytics, advertising, social-media,
        or tracking cookies on the portal. We do not use Google Analytics,
        Facebook Pixel, or any similar service.
      </p>

      <h2>Third-party services</h2>
      <p>
        When you book a session via the embedded Calendly widget, Calendly
        may set its own cookies on the calendly.com domain — see Calendly's
        cookie policy at{' '}
        <a href="https://calendly.com/legal/cookie-notice" target="_blank" rel="noreferrer">
          calendly.com/legal/cookie-notice
        </a>.
      </p>
      <p>
        When you complete a payment, Stripe's hosted checkout page may set
        cookies on stripe.com — see{' '}
        <a href="https://stripe.com/legal/cookies-policy" target="_blank" rel="noreferrer">
          stripe.com/legal/cookies-policy
        </a>.
      </p>

      <h2>Controlling cookies</h2>
      <p>
        Because we only use strictly necessary cookies, we don't show a
        consent banner. UK GDPR allows essential cookies without explicit
        consent.
      </p>
      <p>
        You can clear or block cookies through your browser settings. Note
        that blocking the authentication cookie will prevent you from
        signing in — the portal will still load, but you won't be able to
        access your journal, sessions, or messages.
      </p>

      <h2>Changes</h2>
      <p>
        If we ever introduce non-essential cookies (e.g. for analytics), we
        will update this policy and add a consent banner before they're set.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
      </p>
    </LegalShell>
  )
}
