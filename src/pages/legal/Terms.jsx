import LegalShell from './LegalShell'

export default function Terms() {
  return (
    <LegalShell title="Terms of service" updated="30 April 2026">
      <p>
        These terms govern your use of the OurPath portal at
        portal.ourpathguidance.co.uk and the mentoring services delivered
        through it. By creating an account or subscribing to a rhythm, you
        agree to these terms. If you don't agree with any of them, please
        don't sign up.
      </p>

      <h2>About us</h2>
      <p>
        The portal is operated by OurPath Guidance Ltd, a private limited
        company registered in England and Wales. Contact:{' '}
        <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
      </p>

      <h2>The service</h2>
      <p>
        OurPath provides developmental, reflective mentoring — not therapy or
        clinical psychology. Sessions are 60 minutes via video, phone, or in
        person in London, depending on your chosen rhythm and your mentor's
        availability.
      </p>
      <p>
        OurPath is not a crisis or emergency service. If you are in immediate
        danger or experiencing a mental-health emergency, call 999 (or 111
        for non-emergency NHS support), or contact the Samaritans on 116 123.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least 18 years old to use this service.
      </p>

      <h2>Your account</h2>
      <p>
        You're responsible for keeping your account credentials secure. Don't
        share your password. If you suspect unauthorised access, email{' '}
        <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>{' '}
        immediately.
      </p>

      <h2>Subscriptions and payments</h2>
      <ul>
        <li>Subscriptions are processed by Stripe and billed monthly in pounds sterling (GBP).</li>
        <li>Three rhythms are currently offered: Monthly (£50/mo), Fortnightly (£80/mo), Weekly (£120/mo).</li>
        <li>Your card is charged automatically each month on the anniversary of your first payment until you pause or cancel.</li>
        <li>You can pause or cancel at any time by emailing <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>. There are no minimum-term commitments.</li>
        <li>Cancellation takes effect at the end of your current billing period; you keep access until then.</li>
        <li>Concession rates are available — write to us if cost is a barrier.</li>
      </ul>

      <h2>Refunds</h2>
      <p>
        If you cancel before using any session in a given billing period, we
        will refund the unused balance on request. If you've used at least
        one session, that period is non-refundable but you can cancel future
        billing immediately.
      </p>
      <p>
        If we cancel a session for our reasons (mentor unavailable, technical
        failure), we will reschedule or refund the proportionate amount.
      </p>

      <h2>Booking and rescheduling sessions</h2>
      <ul>
        <li>You book sessions via the Calendly embed inside the portal.</li>
        <li>To reschedule, please use the Calendly confirmation link at least 24 hours in advance.</li>
        <li>Sessions cancelled with less than 24 hours' notice may not be refundable. We try to be reasonable about genuine emergencies.</li>
        <li>If you don't show up to a booked session without notice, that session is forfeited.</li>
      </ul>

      <h2>Confidentiality</h2>
      <p>
        Anything you share with your mentor — verbally or in writing — is
        treated as confidential. We will not disclose it to third parties
        except where required by law (e.g. safeguarding concerns) or where
        you give explicit consent.
      </p>
      <p>
        Your private journal entries are private to you. They become visible
        to your mentor only when you tick "Share with Ustadh Shakil" on a specific
        entry.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don't use the portal to harass, abuse, or threaten anyone. Don't
        upload illegal content. Don't try to circumvent security measures or
        access other users' data. We reserve the right to suspend or
        terminate accounts that breach these rules.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The portal design, code, and OurPath name are our intellectual
        property. Your journal entries, messages, and notes you produce
        remain yours — by using the portal, you grant us a limited licence to
        host and display your content as needed to deliver the service.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        OurPath provides the service in good faith and does our best to keep
        it running, but we don't warrant that the service will be
        uninterrupted, error-free, or fit for any specific purpose other than
        what's described here.
      </p>
      <p>
        Our total liability to you in any 12-month period is limited to the
        total fees you paid to us in that period. We do not accept liability
        for indirect or consequential losses. Nothing in these terms limits
        our liability for death or personal injury caused by negligence, or
        for fraud.
      </p>

      <h2>Termination</h2>
      <p>
        You can close your account at any time by emailing us. We may close
        an account for material breach of these terms or for non-payment.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be
        notified by email at least 14 days before they take effect. Continued
        use of the portal after changes take effect constitutes acceptance.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. Any
        disputes will be subject to the exclusive jurisdiction of the English
        courts.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms?{' '}
        <a href="mailto:hello@ourpathguidance.co.uk">hello@ourpathguidance.co.uk</a>.
      </p>
    </LegalShell>
  )
}
