import { TESTIMONIALS } from "./data";
import { Section, SectionHead } from "./ui";
import { TestimonialWall } from "./testimonial-wall";

export function Customers() {
  return (
    <Section id="customers" className="py-24 sm:py-28">
      <SectionHead
        title="Teams that stopped guessing."
        body="Product, growth and engineering teams use Afterglow to settle the question every launch raises."
      />
      <div className="mt-12 flex justify-center">
        <TestimonialWall
          tone="dark"
          items={TESTIMONIALS.items}
          title={TESTIMONIALS.title}
          hint={null}
          height={600}
          className="!max-w-none"
        />
      </div>
    </Section>
  );
}
