import type { Metadata } from "next";
import { LegalLink, LegalList, LegalPage, LegalSection, Strong } from "@/components/legal/legal-page";
import { legalConfig } from "@/lib/legal";
import { createMetadata } from "@/lib/seo";

// DRAFT: review with src/lib/legal.ts before relying on this page.

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "How Nexus UI collects, uses, and protects your data — sign-in, purchases, analytics, cookies, and your privacy rights.",
  alternates: { canonical: "/privacy" },
});

const { operator, contactEmail } = legalConfig;

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <>
          <p>
            This policy explains what information Nexus UI (&ldquo;Nexus UI&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) collects when you use nexus-ui.com, our component registry, and our dashboard,
            how we use it, and the choices you have. Nexus UI is operated by {operator}, which is the
            controller of the personal data described here.
          </p>
          <p>
            The short version: we collect what we need to run your account, deliver what you buy, answer
            your messages, and understand how the site is used. We do not sell your personal data.
          </p>
        </>
      }
    >
      <LegalSection id="information-we-collect" title="1. Information we collect">
        <p>
          <Strong>Account information.</Strong> You can sign in with Google, with GitHub, or with a one-time
          magic link sent to your email address. When you do, we receive and store your email address and,
          where your provider shares them, your name and profile picture URL. We also keep a user ID, the
          sign-in method you used, and sign-in timestamps. We never see your Google or GitHub password.
        </p>
        <p>
          <Strong>Google user data.</Strong> Google sign-in asks only for the basic{" "}
          <code className="text-foreground">openid</code>, <code className="text-foreground">email</code>, and{" "}
          <code className="text-foreground">profile</code> scopes. We use that data only to create and
          identify your Nexus UI account, show your name and avatar in the dashboard, and contact you about
          your account or purchases. We do not use it for advertising, do not sell it, and do not share it
          except with the service providers listed below that help us run the account system. Our use of
          information received from Google APIs adheres to the{" "}
          <LegalLink href="https://developers.google.com/terms/api-services-user-data-policy">
            Google API Services User Data Policy
          </LegalLink>
          , including the Limited Use requirements.
        </p>
        <p>
          <Strong>Purchase information.</Strong> Payments are processed by Dodo Payments, which acts as the
          merchant of record for every sale. Dodo Payments collects your payment details and billing address
          directly; we never see or store your full card number. From Dodo Payments we receive an order or
          subscription ID, the product you bought, the amount and currency, the order status (for example
          paid or refunded), and, for subscriptions, renewal and end dates.
        </p>
        <p>
          <Strong>Product activity.</Strong> We store the components, templates, and blocks you bookmark and
          the premium items you have access to. If you create a registry access token for the CLI, we store
          only a one-way hash of it, its last four characters (so you can recognise it), when it was created,
          and when it was last used.
        </p>
        <p>
          <Strong>Messages you send us.</Strong> When you use the contact form we store your name, email
          address, topic, and message, and forward them to our inbox by email. If you email us directly we
          keep that correspondence.
        </p>
        <p>
          <Strong>Usage and device information.</Strong> Like most websites, our hosting provider records
          technical data such as IP address, browser type, and the pages requested, and our analytics tools
          collect information about how the site is used (see section 3).
        </p>
      </LegalSection>

      <LegalSection id="how-we-use" title="2. How we use your information">
        <LegalList
          items={[
            "To create and secure your account and keep you signed in.",
            "To deliver what you buy: unlocking premium components and templates, enabling downloads and registry access, and keeping your order history.",
            "To reply to support requests and messages you send us.",
            "To send service emails such as sign-in links, receipts (sent by Dodo Payments), and important account notices. We do not send marketing email without your consent.",
            "To measure traffic and performance, fix bugs, and decide what to build next.",
            "To show advertising on some pages (see section 3).",
            "To prevent fraud, spam, and abuse, and to meet legal, tax, and accounting obligations.",
          ]}
        />
        <p>
          If you are in the European Economic Area, the UK, or a similar jurisdiction, we rely on these legal
          bases: performance of our contract with you (account, purchases, support), our legitimate interests
          (security, analytics, improving the product), your consent (non-essential cookies and advertising,
          where required), and compliance with legal obligations (tax and accounting records).
        </p>
      </LegalSection>

      <LegalSection id="cookies-analytics" title="3. Cookies, analytics, and advertising">
        <LegalList
          items={[
            <>
              <Strong>Essential cookies.</Strong> Supabase, our authentication provider, sets cookies that
              keep you signed in. The site won&apos;t work properly for signed-in users without them.
            </>,
            <>
              <Strong>Local storage.</Strong> Your browser stores your light/dark theme choice and some
              catalog view preferences locally. This data stays on your device.
            </>,
            <>
              <Strong>Your cookie choice.</Strong> When you first visit, a banner asks whether Google
              Analytics and Google advertising cookies may be used. A small cookie on our own domain (
              <code className="text-foreground">nx-consent</code>) remembers your answer for six months, and
              the banner then stays away until it expires. You can change your answer at any time with
              &ldquo;Cookie settings&rdquo; in the footer of any page.
            </>,
            <>
              <Strong>Vercel Web Analytics, Speed Insights and Cloudflare Web Analytics.</Strong> These measure
              page views and page performance in aggregate. They do not use cookies and do not identify
              individual visitors, so they run without asking.
            </>,
            <>
              <Strong>Google Analytics.</Strong> Only if you accept cookies in the banner. We use it to
              understand which pages are visited and how people find us. It sets cookies (such as <code className="text-foreground">_ga</code>)
              and sends Google information including your IP address, device and browser details, and the pages
              you view. See{" "}
              <LegalLink href="https://policies.google.com/technologies/partner-sites">
                how Google uses data from sites that use its services
              </LegalLink>
              . You can opt out with the{" "}
              <LegalLink href="https://tools.google.com/dlpage/gaoptout">
                Google Analytics opt-out browser add-on
              </LegalLink>
              .
            </>,
            <>
              <Strong>Google AdSense.</Strong> Only if you accept cookies in the banner. Some pages may show
              ads served by Google. Google and its partners use cookies to serve ads based on your visits to this and other websites. You can turn
              off personalised ads in{" "}
              <LegalLink href="https://adssettings.google.com">Google Ads Settings</LegalLink> or visit{" "}
              <LegalLink href="https://www.aboutads.info/choices">aboutads.info</LegalLink> to opt out of
              third-party vendors&apos; use of cookies for personalised advertising.
            </>,
          ]}
        />
        <p>
          You can block or delete cookies in your browser settings. Blocking essential cookies will sign you
          out.
        </p>
        <p>
          To turn off Google Analytics, Cloudflare Web Analytics, Vercel Web Analytics and Speed Insights in
          one step, open any page of this site with <code className="text-foreground">?notrack=1</code> at the
          end of the address. Your browser then remembers the choice and loads none of them. Use{" "}
          <code className="text-foreground">?notrack=0</code> to turn them back on. The choice is stored only
          in your browser.
        </p>
      </LegalSection>

      <LegalSection id="sharing" title="4. Who we share information with">
        <p>
          We share personal data only with service providers that help us run Nexus UI, under contracts that
          limit how they can use it:
        </p>
        <LegalList
          items={[
            <>
              <Strong>Supabase</Strong> — authentication and our database (accounts, orders, bookmarks,
              contact messages).
            </>,
            <>
              <Strong>Vercel</Strong> — website hosting, Web Analytics, and Speed Insights.
            </>,
            <>
              <Strong>Dodo Payments</Strong> — checkout, payment processing, tax, receipts, and refunds, as
              merchant of record.
            </>,
            <>
              <Strong>Resend</Strong> — delivering contact-form messages to our inbox.
            </>,
            <>
              <Strong>Google</Strong> — Google sign-in (if you choose it), Google Analytics, and Google
              AdSense.
            </>,
            <>
              <Strong>GitHub</Strong> — GitHub sign-in (if you choose it).
            </>,
          ]}
        />
        <p>
          <Strong>AI apps you connect.</Strong> If you add the Nexus UI MCP server to an AI app such as Claude,
          Cursor or Claude Code, that app sends us the search words and the names of the components, blocks and
          templates it asks for, so we can answer. We use them only to answer that request and don&apos;t store
          them, and we never receive your conversation. If you sign in to Nexus UI from the app, the app keeps
          an access token for your account and sends it with requests for Pro source; we check it with Supabase
          and use it for nothing else. You can disconnect the app at any time in its connector settings. How
          the app itself handles your data is covered by its own privacy policy.
        </p>
        <p>
          We may also disclose information if required by law, to protect our rights or the safety of others,
          or as part of a merger, acquisition, or sale of the business, in which case this policy will continue
          to apply to your data. We do not sell or rent your personal data.
        </p>
      </LegalSection>

      <LegalSection id="transfers" title="5. International transfers">
        <p>
          Our service providers may process data in the United States and other countries outside your own.
          Where the law requires it, we rely on safeguards such as the European Commission&apos;s Standard
          Contractual Clauses offered by those providers.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="6. How long we keep it">
        <LegalList
          items={[
            "Account data, bookmarks, and access tokens: for as long as your account is open. Delete your account and we remove them within 30 days.",
            "Apps you have signed in to Nexus UI from (such as Claude): until you disconnect the app or delete your account.",
            "Order and subscription records: as long as needed to provide access and for the period tax and accounting law requires, even after account deletion.",
            "Contact messages: up to 24 months after our last exchange, unless they form part of a support or legal record we need to keep.",
            "Analytics data: according to the retention settings of Google Analytics and Vercel.",
          ]}
        />
      </LegalSection>

      <LegalSection id="your-rights" title="7. Your rights and choices">
        <p>
          Depending on where you live, you may have the right to access, correct, delete, or export your
          personal data, to object to or restrict certain processing, and to withdraw consent at any time. To
          make a request, including deleting your account, email{" "}
          <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink> from the address on your
          account. We will respond within 30 days. You can also complain to your local data protection
          authority.
        </p>
        <p>
          You can disconnect Nexus UI from your Google account at any time from your{" "}
          <LegalLink href="https://myaccount.google.com/connections">Google Account settings</LegalLink>, and
          from GitHub under Settings → Applications.
        </p>
      </LegalSection>

      <LegalSection id="security" title="8. Security">
        <p>
          We use HTTPS everywhere, row-level security on our database, hashed registry tokens, and limited
          administrative access. No system is perfectly secure, so please keep your sign-in email and registry
          token private and tell us right away if you suspect misuse.
        </p>
      </LegalSection>

      <LegalSection id="children" title="9. Children">
        <p>
          Nexus UI is a tool for developers and is not directed at children. We do not knowingly collect
          personal data from anyone under 16. If you believe a child has given us personal data, contact us
          and we will delete it.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="10. Changes to this policy">
        <p>
          We may update this policy as the product changes. We will change the date at the top of this page,
          and for significant changes we will notify signed-in users by email or on the site.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="11. Contact">
        <p>
          {operator} · <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
