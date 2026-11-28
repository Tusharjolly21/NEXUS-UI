"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CodeBlock } from "@/components/code-block/code-block";

const SAMPLE_CODE_JS = `import React, { useState } from 'react';

export default function PricingCard() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="pricing-card">
      <h3>Pro Plan</h3>
      <p className="price">
        \${isYearly ? '99' : '12'}
        <span className="duration">
          /{isYearly ? 'year' : 'month'}
        </span>
      </p>

      <button onClick={() => setIsYearly(!isYearly)}>
        Toggle Billing
      </button>

      <ul className="features">
        <li>Unlimited Projects</li>
        <li>Priority Support</li>
      </ul>
    </div>
  );
}`;

export function PreviewCodeBlockDefault() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-border/60 bg-[#09090b] p-6">
      <div className="w-full h-full min-h-[320px]">
        <CodeBlock
          code={SAMPLE_CODE_JS}
          language="jsx"
          theme="dark"
          className="w-full h-full min-h-[320px]"
        />
      </div>
    </div>
  );
}
