"use client";

interface Step {
  label: string;
  description?: string;
}

interface FlowDiagramProps {
  steps: Step[];
  title?: string;
  orientation?: "vertical" | "horizontal";
}

/**
 * Simple step-by-step flow diagram
 * Good for process flows without complex branching
 */
export function FlowDiagram({
  steps,
  title,
  orientation = "vertical",
}: FlowDiagramProps) {
  const isVertical = orientation === "vertical";

  return (
    <div className="my-6">
      {title && (
        <h4 className="mb-4 font-mono text-[12px] uppercase tracking-wide text-fg-light">
          {title}
        </h4>
      )}

      <div
        className={`flex ${isVertical ? "flex-col" : "flex-row items-start"} gap-4`}
      >
        {steps.map((step, i) => (
          <div
            key={i}
            className={`flex ${isVertical ? "flex-row items-start gap-4" : "flex-col items-center"}`}
          >
            {/* Step number */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-light text-[16px] font-bold text-accent">
              {i + 1}
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="font-medium text-fg">{step.label}</p>
              {step.description && (
                <p className="mt-1 text-[13px] text-fg-muted">
                  {step.description}
                </p>
              )}
            </div>

            {/* Arrow (not on last step) */}
            {i < steps.length - 1 && (
              <div
                className={`flex items-center justify-center text-fg-light ${
                  isVertical ? "ml-5 h-8 w-px" : "h-px w-8"
                }`}
              >
                <div
                  className={`${isVertical ? "h-full w-px" : "h-px w-full"} bg-border-light`}
                />
                <div
                  className={`absolute ${isVertical ? "ml-0.5 rotate-90" : ""}`}
                >
                  →
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
