import { Suspense } from "react";
import { ComponentsBrowser } from "@/components/library/components-browser";

export default function ComponentsPage() {
  return (
    <Suspense fallback={null}>
      <ComponentsBrowser />
    </Suspense>
  );
}
