import LegalShell from './LegalShell'

export default function Privacy() {
  return (
    <LegalShell title="Privacy policy" updated="30 April 2026">
      <p>
        OurPath Guidance Ltd ("OurPath", "we", "us") provides a one-to-one
        mentoring service through this portal. This policy explains what
        personal data we collect, why we collect it, how we use it, and your
        rights under the UK General Data Protection Regulation (UK GDPR) and
        the Data Protection Act 2018.
      </p>

      <h2>Who we are</h2>
      <p>
        OurPath Guidance Ltd is a private limited company registered in
        England and Wales. Our registered email is{' '}
        <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
        For the purposes of UK data protection law, we are the data controller
        for the personal data collected through this portal.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Account information</strong> — your name and email address, provided when you sign up or apply for Session Zero.</li>
        <li><strong>Reflective journal entries</strong> — content you write in your reflective journal. This is private to you unless you actively choose to share an entry with your mentor.</li>
        <li><strong>Session records</strong> — the date, time, mode (video, phone, in person), and notes your mentor writes after each session.</li>
        <li><strong>Messages</strong> — text you send and receive between sessions inside the portal.</li>
        <li><strong>Subscription information</strong> — your chosen rhythm and status. Payment card details are never seen by us; they are collected directly by Stripe (see "Third parties" below).</li>
        <li><strong>Technical data</strong> — basic logs from our infrastructure providers, including IP address, browser type, and approximate location, used to keep the service running and secure.</li>
      </ul>

      <h2>Why we use it</h2>
      <p>We use your personal data only to:</p>
      <ul>
        <li>Provide the mentoring service you've signed up for.</li>
        <li>Communicate with you about sessions, applications, or your account.</li>
        <li>Take payments via Stripe and keep the necessary records for tax and accounting.</li>
        <li>Improve the service — e.g. fixing bugs, monitoring uptime. We do not read journal entries or messages for this purpose; we may look at aggregate, non-identifying technical metrics.</li>
        <li>Comply with our legal obligations.</li>
      </ul>
      <p>
        Our lawful bases under UK GDPR are <em>contract</em> (most of the
        above is necessary to deliver the mentoring you've signed up for),
        <em> legitimate interests</em> (running and securing the service),
        and <em>consent</em> (where we ask you to opt in, e.g. sharing a
        journal entry with your mentor).
      </p>

      <h2>Who can see your data</h2>
      <ul>
        <li><strong>Your mentor</strong> sees: your name and email, your rhythm, the journal entries you choose to share, all messages exchanged with them, and notes from sessions.</li>
        <li><strong>OurPath admin</strong> sees the same as your mentor, plus subscription status. Used only to operate the service.</li>
        <li><strong>You</strong> always see your own data and can export or delete it (see "Your rights" below).</li>
        <li>Other mentees never see your data. Mentors only see data of mentees assigned to them.</li>
      </ul>

      <h2>Third parties</h2>
      <p>We share your data only with the following processors, each of which has signed appropriate data-processing agreements with us:</p>
      <ul>
        <li><strong>Supabase</strong> — database and authentication. Data is stored in their EU region.</li>
        <li><strong>Netlify</strong> — hosting for the portal application.</li>
        <li><strong>Stripe</strong> — payment processing. We never see your card details; Stripe handles them under PCI-DSS standards.</li>
        <li><strong>Calendly</strong> — booking sessions. They receive your name, email, and the chosen time.</li>
        <li><strong>Resend</strong> — sending transactional email (welcome, confirmations, reminders). They receive your email address and the email content we send.</li>
      </ul>
      <p>We do not sell your personal data to anyone, ever, for any reason.</p>

      <h2>How long we keep it</h2>
      <p>Active accounts: as long as you remain a mentee or applicant.</p>
      <p>Closed accounts: we retain your data for up to 24 months after you stop using the service, in case you return — after that we delete or anonymise it, except where we're legally required to keep records (e.g. tax records for 6 years).</p>

      <h2>Your rights</h2>
      <p>Under UK GDPR you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Correct any inaccuracies</li>
        <li>Have your data deleted (the "right to be forgotten")</li>
        <li>Restrict or object to certain processing</li>
        <li>Export your data in a portable format</li>
        <li>Withdraw consent at any time (where we rely on consent)</li>
        <li>Lodge a complaint with the Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a></li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>. We will respond within 30 days.</p>

      <h2>Security</h2>
      <p>Data is encrypted in transit (HTTPS) and at rest. Access to the database is limited to the admin team and protected by row-level security policies. We have no access to your password — we store only a one-way hash.</p>

      <h2>Changes to this policy</h2>
      <p>If we make material changes, we'll email all active accounts at least 14 days before the change takes effect. The "last updated" date at the top of this page reflects the most recent revision.</p>
    </LegalShell>
  )
}
