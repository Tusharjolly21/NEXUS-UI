import { RefundPolicyPageContent } from "@/components/site-pages/refund-policy-page";
import { getPricing } from "@/lib/region";

export { metadata } from "@/components/site-pages/refund-policy-page";

export default async function RefundPolicyPage() {
  return <RefundPolicyPageContent pricing={await getPricing()} />;
}
