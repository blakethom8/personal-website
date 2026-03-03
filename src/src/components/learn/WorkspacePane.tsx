"use client";

import type {
  WorkspaceItem,
  WorkspaceItemStatus,
  WorkspaceSnapshot,
} from "@/lib/conversation-scenarios";

interface WorkspacePaneProps {
  snapshot: WorkspaceSnapshot | undefined;
}

const STATUS_LABELS: Record<WorkspaceItemStatus, string> = {
  active: "active",
  created: "new",
  updated: "updated",
  queried: "query",
};

function getItemLabel(item: WorkspaceItem): string {
  const segments = item.path.split("/");
  const leaf = segments[segments.length - 1] ?? item.path;
  return item.kind === "directory" ? `${leaf}/` : leaf;
}

function getItemIcon(item: WorkspaceItem): string {
  if (item.kind === "directory") return "dir";
  if (item.kind === "database") return "db";

  const ext = item.path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "md":
      return "md";
    case "json":
      return "{}";
    case "tsx":
      return "tsx";
    case "ts":
      return "ts";
    case "yml":
    case "yaml":
      return "cfg";
    case "eml":
      return "@";
    default:
      return "file";
  }
}

export function WorkspacePane({ snapshot }: WorkspacePaneProps) {
  if (!snapshot) {
    return (
      <div className="sim-workspace-pane-empty">
        <span className="font-mono text-[11px] text-fg-light">
          step through to watch the workspace change
        </span>
      </div>
    );
  }

  return (
    <div className="sim-workspace-pane-inner">
      <div className="sim-workspace-hero">
        <div className="sim-workspace-root">{snapshot.rootLabel}</div>
        <div className="sim-workspace-activity-label">current operation</div>
        <div className="sim-workspace-activity">{snapshot.activity}</div>
        {snapshot.note && <p className="sim-workspace-note">{snapshot.note}</p>}
      </div>

      <div className="sim-workspace-tree">
        {snapshot.items.map((item) => {
          const depth = item.path.split("/").length - 1;
          const statusClass = item.status ? ` sim-workspace-row-${item.status}` : "";

          return (
            <div
              key={item.path}
              className={`sim-workspace-row${statusClass}`}
              style={{ paddingLeft: `${12 + depth * 18}px` }}
            >
              <div className="sim-workspace-row-main">
                <span className={`sim-workspace-icon sim-workspace-icon-${item.kind}`}>
                  {getItemIcon(item)}
                </span>
                <span className="sim-workspace-name">{getItemLabel(item)}</span>
                {item.status && (
                  <span className={`sim-workspace-badge sim-workspace-badge-${item.status}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                )}
              </div>

              {item.meta && <div className="sim-workspace-meta">{item.meta}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
