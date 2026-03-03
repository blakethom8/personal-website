"use client";

/**
 * Visual representation of the harness loop
 * Shows the 7 steps: receive → construct → send → read → execute → loop → return
 */
export function HarnessLoop() {
  const steps = [
    { num: 1, label: "Receive", desc: "Your message arrives" },
    { num: 2, label: "Construct", desc: "Package request (history + tools + prompt)" },
    { num: 3, label: "Send", desc: "Call the LLM API" },
    { num: 4, label: "Read", desc: "Parse response (text or tool request?)" },
    { num: 5, label: "Execute", desc: "Run tool if requested" },
    { num: 6, label: "Loop", desc: "Send results back to model" },
    { num: 7, label: "Return", desc: "Deliver final answer to you" },
  ];

  return (
    <div className="my-6">
      <div className="rounded-lg border border-border-light bg-white p-6">
        <h4 className="mb-4 text-center font-mono text-[12px] uppercase tracking-wide text-fg-light">
          What the Harness Does (The Agent Loop)
        </h4>

        <div className="grid gap-3 md:grid-cols-7">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              {/* Step number */}
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[16px] font-bold text-white">
                {step.num}
              </div>

              {/* Label */}
              <p className="mb-1 font-mono text-[11px] font-semibold text-accent">
                {step.label}
              </p>

              {/* Description */}
              <p className="text-[11px] leading-tight text-fg-muted">
                {step.desc}
              </p>

              {/* Arrow (not on last step) */}
              {i < steps.length - 1 && (
                <div className="mt-2 text-fg-light">→</div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-bg-panel p-4 text-center">
          <p className="text-[12px] text-fg-muted">
            Steps 4-6 can loop multiple times. The model might call several tools
            before giving you a final answer.
          </p>
        </div>
      </div>
    </div>
  );
}
