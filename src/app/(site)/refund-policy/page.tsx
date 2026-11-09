import type { Metadata } from "next";
import { LegalLink, LegalPage, LegalSection, Strong } from "@/components/legal/legal-page";
import { legalConfig } from "@/lib/legal";
import { createMetadata } from "@/lib/seo";
import { getPricing } from "@/lib/region";

// Keep in step with /terms (section 4) and the refund answer on /pricing.

export const metadata: Metadata = createMetadata({
  title: "Refund and Cancellation Policy",
  description:
    "How refunds and cancellations work for Nexus UI Pro (yearly) and All-Access (lifetime): 7-day window, how to ask, and what happens to your access.",
  alternates: { canonical: "/refund-policy" },
});

const { contactEmail } = legalConfig;

export default async function RefundPolicyPage() {
  const pricing = await getPricing();

  return (
    <LegalPage
      title="Refund and Cancellation Policy"
      intro={
        <p>
          Nexus UI sells two plans: <Strong>Pro</Strong> ({pricing.pro} per year, renews yearly until you cancel) and{" "}
          <Strong>All-Access</Strong> ({pricing.allAccess}, one payment, no renewal). This page explains how to cancel and how
          to get a refund. It forms part of our <LegalLink href="/terms">Terms of Service</LegalLink>.
        </p>
      }
    >
      <LegalSection id="all-access" title="1. All-Access (lifetime)">
        <p>
          If you&apos;re not satisfied, email <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>{" "}
          within 7 days of purchase and we will refund the full amount. You don&apos;t need to give a reason.
        </p>
      </LegalSection>

      <LegalSection id="pro" title="2. Pro (yearly)">
        <p>
          Because Pro is a digital product delivered immediately, it is generally non-refundable once you have
          accessed or downloaded paid content. If something doesn&apos;t work as described, contact us within 7
          days of purchase and we will fix it or refund you.
        </p>
      </LegalSection>

      <LegalSection id="cancel" title="3. Cancelling Pro">
        <p>
          Pro renews automatically at the end of each 12-month term at the then-current price unless you cancel
          before the renewal date. Cancel at any time from the link in your Dodo Payments receipt email, or by
          emailing <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink>. You keep access until
          the end of the term you have paid for, and you won&apos;t be charged again.
        </p>
        <p>
          If a renewal charge catches you by surprise, write to us within 7 days of that charge and we will
          refund it.
        </p>
      </LegalSection>

      <LegalSection id="how" title="4. How to ask for a refund">
        <p>
          Email <LegalLink href={`mailto:${contactEmail}`}>{contactEmail}</LegalLink> from the address on your
          account and tell us which plan you bought. We reply within a few business days. Refunds are issued
          through Dodo Payments, our merchant of record, to your original payment method, and can take several
          business days to appear depending on your bank.
        </p>
        <p>
          When a purchase is refunded, the access and licence it granted end. Nothing here limits refund or
          withdrawal rights you have under the consumer law of your country.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
