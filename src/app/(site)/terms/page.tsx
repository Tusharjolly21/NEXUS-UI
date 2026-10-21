import type { Metadata } from "next";
import { LegalLink, LegalList, LegalPage, LegalSection, Strong } from "@/components/legal/legal-page";
import { legalConfig } from "@/lib/legal";
import { createMetadata } from "@/lib/seo";

// DRAFT: review with src/lib/legal.ts before relying on this page. Plan names,
// prices, and refund terms mirror /pricing — keep the two in sync.

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "The terms for using Nexus UI — accounts, purchases, the annual plan and lifetime pass, refunds, and the license for components and templates.",
  alternates: { canonical: "/terms" },
});

const { operator, jurisdiction, contactEmail } = legalConfig;

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <>
          <p>
            These terms govern your use of nexus-ui.com, the Nexus UI component registry and CLI, and the
            components, blocks, and templates we offer (together, the &ldquo;Service&rdquo;). The Service is
            run by {operator} (&ldquo;Nexus UI&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>
          <p>
            By creating an account, making a purchase, or installing anything from the registry, you agree to
            these terms and to our <LegalLink href="/privacy">Privacy Policy</LegalLink>. If you use the
            Service on behalf of a company, you agree on its behalf.
          </p>
        </>
      }
    >
      <LegalSection id="accounts" title="1. Your account">
        <p>
          You can sign in with Google, GitHub, or a one-time email link. You must give us an email address you
          control and be old enough to form a binding contract where you live. You are responsible for
          activity on your account and for keeping your registry access token secret; treat it like a
          password and don&apos;t commit it to public repositories. Accounts are for one person. Don&apos;t
          share access to paid content with others.
        </p>
      </LegalSection>

      <LegalSection id="products" title="2. What we offer">
        <LegalList
          items={[
            <>
              <Strong>Free components and blocks</Strong> that anyone can browse, copy, and install.
            </>,
            <>
              <Strong>Premium components and templates</Strong>: full source code for animated components and
              complete Next.js page templates, unlocked by either plan below.
            </>,
            <>
              <Strong>Pro (annual plan)</Strong>: a yearly plan with access to all premium components,
              templates, and blocks, current and future, plus updates and requests, while the plan is active.
            </>,
            <>
              <Strong>All-Access (lifetime pass)</Strong>: a one-time payment for access to all premium
              content, current and future, and updates for as long as Nexus UI offers the product.
            </>,
          ]}
        />
        <p>
          Current prices and what each plan includes are listed on the{" "}
          <LegalLink href="/pricing">pricing page</LegalLink>. The price shown at checkout is the one you pay.
          We may change prices or plan contents for future purchases; changes don&apos;t affect a plan you
          have already paid for during its term.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="3. Payments">
        <p>
          Checkout is handled by Dodo Payments, our merchant of record. Dodo Payments processes
          your payment, charges any applicable sales tax or VAT, and issues your receipt, and its{" "}
          <LegalLink href="https://dodopayments.com/buyer-terms">buyer terms</LegalLink> apply to the
          transaction itself. Access is granted to the Nexus UI account you were signed in with at checkout,
          usually within a few minutes of payment.
        </p>
        <p>
          If the annual plan is billed as a subscription, it renews automatically at the end of each 12-month
          term at the then-current price unless you cancel before the renewal date. You can cancel at any time
          from the link in your Dodo Payments receipt email or by emailing us; you keep access until the end of the
          term you have paid for.
        </p>
      </LegalSection>

      <LegalSection id="refunds" title="4. Refunds">
        {/* REVIEW: /pricing only promises refunds for lifetime purchases. Confirm the policy for the annual plan. */}
        <p>
          <Strong>All-Access (lifetime pass):</Strong> if you&apos;re not satisfied, email{" "}
          <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink> within 7 days of purchase for
          a full refund.
        </p>
        <p>
          <Strong>Annual plan:</Strong> because it is a digital good delivered
          immediately, it is generally non-refundable once accessed or downloaded. If something doesn&apos;t
          work as described, contact us within 7 days of purchase and we will fix it or refund you.
        </p>
        <p>
          Refunds are issued through Dodo Payments to your original payment method. When a purchase is
          refunded, the access and license it granted end. Nothing in these terms limits refund or withdrawal
          rights you have under the consumer law of your country.
        </p>
      </LegalSection>

      <LegalSection id="license" title="5. License to use components and templates">
        <p>
          When you install or download a free item, or a premium item you have paid for, we grant you a
          worldwide, non-exclusive, non-transferable license to use, copy, and modify it to build websites and
          applications (&ldquo;End Products&rdquo;) for yourself or for your clients, in unlimited personal
          and commercial projects.
        </p>
        <p>You may not:</p>
        <LegalList
          items={[
            "Resell, sublicense, share, or redistribute the source code on its own or with only minor changes, whether free or paid.",
            "Include it in a UI kit, component library, template, theme, website builder, or design or code marketplace that competes with Nexus UI, or in any product whose main value is the component or template itself.",
            "Publish premium source code in a public repository, or share your account or registry token so others can access premium content.",
            "Remove copyright notices or claim the original work as your own.",
          ]}
        />
        {/* REVIEW: confirm what happens to annual-plan licenses after the term ends. */}
        <p>
          <Strong>After an annual plan ends</Strong>, you may keep using premium items in End Products you
          built or started during your term. You won&apos;t be able to download or install premium items, or
          receive updates, until you renew.
        </p>
        <p>
          Templates and previews may include placeholder images, fonts, 3D models, or other assets from third
          parties, and our code depends on open-source libraries such as Next.js, Tailwind CSS, and Framer
          Motion. Those are covered by their own licenses, not this one, and you are responsible for licensing
          or replacing any third-party assets you ship.
        </p>
      </LegalSection>

      <LegalSection id="acceptable-use" title="6. Acceptable use">
        <p>Don&apos;t use the Service to:</p>
        <LegalList
          items={[
            "Break the law, infringe others' rights, or build products that do.",
            "Scrape, bulk-download, or mirror the catalog or registry, or get around access controls on premium content.",
            "Probe, overload, or disrupt the Service, or attempt to access other users' accounts or data.",
            "Send spam or abusive messages through the contact form.",
          ]}
        />
      </LegalSection>

      <LegalSection id="ownership" title="7. Ownership">
        <p>
          We (or our licensors) own the Service, the Nexus UI name and logo, and all components, blocks,
          templates, and site content. Apart from the license in section 5, these terms don&apos;t give you
          any rights in them. You own the End Products you build. If you send us feedback or suggestions, we
          may use them without obligation to you.
        </p>
      </LegalSection>

      <LegalSection id="termination" title="8. Suspension and termination">
        <p>
          You can stop using the Service and ask us to delete your account at any time. We may suspend or
          close accounts that break these terms, for example by redistributing premium code, sharing access,
          or charging back a payment. If we close your account for a breach, you are not entitled to a
          refund. If we discontinue the Service, we will give you reasonable notice and a chance to download
          the premium items you have paid for.
        </p>
      </LegalSection>

      <LegalSection id="disclaimers" title="9. Disclaimers">
        <p>
          The Service and all components and templates are provided &ldquo;as is&rdquo; and &ldquo;as
          available&rdquo;. To the fullest extent the law allows, we disclaim all warranties, express or
          implied, including merchantability, fitness for a particular purpose, and non-infringement. We
          don&apos;t guarantee that the code is free of bugs, will work with every version of its
          dependencies, or that the Service will be uninterrupted. You are responsible for testing what you
          ship, including its accessibility, security, and performance.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Limitation of liability">
        <p>
          To the fullest extent the law allows, Nexus UI will not be liable for any indirect, incidental,
          special, consequential, or punitive damages, or for lost profits, revenue, or data. Our total
          liability for any claim relating to the Service is limited to the amount you paid us in the 12
          months before the claim arose. Some jurisdictions don&apos;t allow these limits, so they may not
          apply to you.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="11. Changes to these terms">
        <p>
          We may update these terms. We will change the date at the top of this page and, for significant
          changes, notify signed-in users by email or on the site. If you keep using the Service after a change
          takes effect, you accept the new terms.
        </p>
      </LegalSection>

      <LegalSection id="governing-law" title="12. Governing law">
        <p>
          These terms are governed by the laws of {jurisdiction}, and the courts there have jurisdiction over
          any dispute, except where the consumer law of your country gives you the right to bring a claim
          where you live.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="13. Contact">
        <p>
          {operator} · <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
