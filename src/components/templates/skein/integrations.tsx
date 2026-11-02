"use client";

import type { CSSProperties } from "react";
import { BrandIcon, Icon, type BrandIconName } from "./icons";
import { Section, Reveal, TextLink } from "./ui";

interface ConnectedService {
  brand: BrandIconName;
  name: string;
  stat: string;
  detail: string;
  color: string;
}

interface StackTool {
  brand: BrandIconName;
  color: string;
  name: string;
}

const CONNECTED_SERVICES: readonly ConnectedService[] = [
  {
    brand: "kubernetes",
    name: "Kubernetes",
    stat: "214 pods",
    detail: "38 namespaces",
    color: "#326ce5",
  },
  {
    brand: "postgresql",
    name: "PostgreSQL",
    stat: "12 databases",
    detail: "41 ms p99",
    color: "#4169e1",
  },
  {
    brand: "apachekafka",
    name: "Kafka",
    stat: "86 topics",
    detail: "1.4M msgs/min",
    color: "currentColor",
  },
  {
    brand: "redis",
    name: "Redis",
    stat: "9 clusters",
    detail: "0.4 ms p50",
    color: "#ff4438",
  },
  {
    brand: "cloudflare",
    name: "Cloudflare",
    stat: "31 zones",
    detail: "edge logs on",
    color: "#f38020",
  },
  {
    brand: "opentelemetry",
    name: "OpenTelemetry",
    stat: "142 services",
    detail: "auto-instrumented",
    color: "#f5a800",
  },
  {
    brand: "githubactions",
    name: "GitHub Actions",
    stat: "2,310 runs",
    detail: "linked to deploys",
    color: "#2088ff",
  },
  {
    brand: "mongodb",
    name: "MongoDB",
    stat: "6 clusters",
    detail: "slow queries on",
    color: "#47a248",
  },
  {
    brand: "rabbitmq",
    name: "RabbitMQ",
    stat: "40 queues",
    detail: "dead letters watched",
    color: "#ff6600",
  },
];

const STACK_TOOLS: readonly StackTool[] = [
  { brand: "docker", color: "#2496ed", name: "Docker" },
  { brand: "nginx", color: "#009639", name: "NGINX" },
  { brand: "terraform", color: "#844fba", name: "Terraform" },
  { brand: "elasticsearch", color: "#00bfb3", name: "Elasticsearch" },
  { brand: "vercel", color: "currentColor", name: "Vercel" },
  { brand: "go", color: "#00add8", name: "Go" },
  { brand: "nodedotjs", color: "#5fa04e", name: "Node.js" },
  { brand: "python", color: "#3776ab", name: "Python" },
  { brand: "rust", color: "currentColor", name: "Rust" },
  { brand: "slack", color: "#e01e5a", name: "Slack" },
  { brand: "pagerduty", color: "#06ac38", name: "PagerDuty" },
  { brand: "amazonwebservices", color: "#ff9900", name: "AWS" },
];

/** Integrations section: a vertical marquee of connected services beside a grid of tool marks. */
export function Integrations() {
  return (
    <Section id="integrations">
      <div className="grid grid-cols-1 items-center gap-12 py-20 sm:py-28 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <Reveal
            as="h2"
            className="m-0 skein-display text-[clamp(30px,3vw,38px)] font-bold tracking-[-0.025em] text-[rgb(var(--skein-ink))]"
          >
            Connect your stack
          </Reveal>
          <p className="m-0 mt-4 max-w-[30em] text-[15px] leading-[1.6] text-[rgb(var(--skein-mute))]">
            Kubernetes, databases, queues, the edge and CI. If it speaks OpenTelemetry, Skein already
            understands it.
          </p>
          <div className="mt-8">
            <TextLink href="#integrations">View all 300 integrations</TextLink>
          </div>
        </div>
        <div className="overflow-hidden rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.5)]">
          <p className="m-0 border-b border-solid border-[rgb(var(--skein-line)/.08)] px-4 py-3 text-[12px] text-[rgb(var(--skein-faint))]">
            Connected services
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative h-[300px] overflow-hidden border-solid border-[rgb(var(--skein-line)/.08)] [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)] sm:border-r">
              <ul
                className="skein-marquee-y m-0 list-none p-0"
                style={{ "--duration": "28s" } as CSSProperties}
              >
                {/* The list is doubled so the marquee loops seamlessly; the copy is hidden from assistive tech. */}
                {[...CONNECTED_SERVICES, ...CONNECTED_SERVICES].map((service, index) => (
                  <li
                    key={index}
                    aria-hidden={index >= CONNECTED_SERVICES.length ? true : undefined}
                    className="flex items-center gap-3.5 border-b border-solid border-[rgb(var(--skein-line)/.07)] px-4 py-3"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-[rgb(var(--skein-raised))]">
                      <BrandIcon name={service.brand} size={17} color={service.color} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] text-[rgb(var(--skein-ink))]">{service.name}</span>
                      <span className="skein-tnum block truncate font-mono text-[11px] text-[rgb(var(--skein-faint))]">
                        <span className="text-[rgb(var(--skein-live))]">{service.stat}</span> • {service.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <ul className="m-0 hidden list-none grid-cols-3 gap-2 p-3 [mask-image:linear-gradient(to_right,black_60%,transparent)] sm:grid">
              {STACK_TOOLS.map((tool) => (
                <li key={tool.name}>
                  <span
                    title={tool.name}
                    className="group grid h-[62px] w-[62px] place-items-center rounded-[12px] border border-solid border-[rgb(var(--skein-line)/.08)] text-[rgb(var(--skein-faint))] transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[rgb(var(--skein-line)/.2)] hover:bg-[rgb(var(--skein-raised))]"
                  >
                    <span className="opacity-60 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0">
                      <BrandIcon name={tool.brand} size={20} color={tool.color} />
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-solid border-[rgb(var(--skein-line)/.08)] px-4 py-3 font-mono text-[11px] text-[rgb(var(--skein-faint))]">
            <span className="skein-tnum">
              <span className="text-[rgb(var(--skein-ink)/.8)]">1.2B</span> spans today{" "}
              <span className="ml-3 text-[rgb(var(--skein-ink)/.8)]">0</span> dropped
            </span>
            <a
              href="#integrations"
              className="flex items-center gap-1.5 font-sans text-[12px] text-[rgb(var(--skein-faint))] no-underline hover:text-[rgb(var(--skein-ink))]"
            >
              Add integration
              <span className="grid h-5 w-5 place-items-center rounded-full border border-solid border-[rgb(var(--skein-line)/.12)]">
                <Icon name="plus" size={8} />
              </span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
