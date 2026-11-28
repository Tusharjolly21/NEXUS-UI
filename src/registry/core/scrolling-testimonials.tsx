"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ScrollingTestimonials } from "@/components/scrolling-testimonials/scrolling-testimonials";

const ST_TESTIMONIALS = [
  { id: "st-1", quote: "Shipped our entire landing page in a weekend. The animation quality is genuinely best-in-class.", name: "Sarah Chen", role: "Head of Design", company: "Vercel", rating: 5 },
  { id: "st-2", quote: "Finally a component library that respects the craft. Motion feels intentional, never gimmicky.", name: "Marcus Rodriguez", role: "Senior Engineer", company: "Linear", rating: 5 },
  { id: "st-3", quote: "Copy-paste components that actually look premium out of the box. Our conversion rate went up 18%.", name: "Aisha Patel", role: "Design Systems Lead", company: "Stripe", rating: 5 },
  { id: "st-4", quote: "The attention to detail in every component is remarkable. Accessibility is built in from the start.", name: "James Kim", role: "Engineering Manager", company: "Notion", rating: 5 },
  { id: "st-5", quote: "We replaced three different component libraries with Nexus UI. Cleaner code, better performance.", name: "Elena Vasquez", role: "CTO", company: "Raycast", rating: 5 },
  { id: "st-6", quote: "Dark mode, responsive, and animated right out of the box. This saved our team two weeks.", name: "David Park", role: "Founder", company: "Resend", rating: 5 },
  { id: "st-7", quote: "Our design-to-code handoff is basically gone now. Devs just grab components and ship.", name: "Priya Nair", role: "Product Designer", company: "Planetscale", rating: 5 },
  { id: "st-8", quote: "I've evaluated 12 UI libraries this year. This is the first one I actually wanted to use.", name: "Tom Hanley", role: "Frontend Lead", company: "Loom", rating: 5 },
  { id: "st-9", quote: "The Framer Motion integration is handled perfectly. No more wrestling with animation configs.", name: "Yuki Tanaka", role: "UI Engineer", company: "Figma", rating: 5 },
  { id: "st-10", quote: "Every component feels like it belongs. Consistent design language across the whole library.", name: "Clara Russo", role: "Creative Director", company: "Framer", rating: 5 },
  { id: "st-11", quote: "Tailwind-first and fully typed. Exactly what we needed for a fast-moving product team.", name: "Noah Bennett", role: "Staff Engineer", company: "Supabase", rating: 5 },
  { id: "st-12", quote: "The scroll animations alone were worth the price. Clients keep asking how we built it.", name: "Fatima Al-Rashid", role: "Agency Owner", company: "Webflow", rating: 5 },
];

export function PreviewScrollingTestimonials({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="w-full overflow-hidden bg-[#09090b]">
      <ScrollingTestimonials
        testimonials={ST_TESTIMONIALS}
        columns={3}
        speed={28000}
        reverseColumns={[false, true, false]}
        pauseOnHover
        showHeader={!compact}
        badge="Social proof"
        title="Trusted by product teams"
        subtitle="Thousands of designers and engineers ship faster with Nexus UI."
        backgroundColor="#09090b"
        cardBackground="rgba(255,255,255,0.04)"
        borderColor="rgba(255,255,255,0.08)"
        textColor="#f4f4f5"
        mutedTextColor="rgba(244,244,245,0.45)"
        showStars
        fadeMask
      />
    </div>
  );
}
