"use client";

import type { LearnModule } from "@/lib/learn-modules";

interface FileTreeProps {
  modules: LearnModule[];
  selectedFile: string;
  expandedFolders: Set<string>;
  onSelectFile: (path: string) => void;
  onToggleFolder: (folder: string) => void;
}

export function FileTree({
  modules,
  selectedFile,
  expandedFolders,
  onSelectFile,
  onToggleFolder,
}: FileTreeProps) {
  const isRootReadme = selectedFile === "README.md";

  return (
    <div className="file-tree min-h-[300px] overflow-y-auto px-4 py-3">
      {/* Root */}
      <div className="mb-1 text-fg-light">~/learn/</div>

      {/* Root README */}
      <button
        onClick={() => onSelectFile("README.md")}
        className={`file-tree-node block w-full text-left ${
          isRootReadme ? "selected" : ""
        }`}
      >
        <span className="file-tree-line">├─ </span>
        <FileIcon ext=".md" />
        README.md
      </button>

      {/* Module folders */}
      {modules.map((mod, modIdx) => {
        const isLast = modIdx === modules.length - 1;
        const prefix = isLast ? "└─ " : "├─ ";
        const childPrefix = isLast ? "   " : "│  ";
        const isExpanded = expandedFolders.has(mod.slug);

        return (
          <div key={mod.slug} className={mod.available ? "" : "opacity-50"}>
            {/* Folder name */}
            <button
              onClick={() => onToggleFolder(mod.slug)}
              className="file-tree-node block w-full text-left"
            >
              <span className="file-tree-line">{prefix}</span>
              <span className={isExpanded ? "text-accent" : ""}>
                {mod.folderName}/
              </span>
              {!mod.available && (
                <span className="ml-1 text-[10px] text-fg-light">(soon)</span>
              )}
            </button>

            {/* Files inside folder */}
            {isExpanded && (
              <div>
                {mod.files.map((file, fileIdx) => {
                  const isLastFile = fileIdx === mod.files.length - 1;
                  const filePrefix = isLastFile ? "└─ " : "├─ ";
                  const filePath = `${mod.slug}/${file.name}${file.extension}`;
                  const isSelected = selectedFile === filePath;

                  return (
                    <button
                      key={filePath}
                      onClick={() => onSelectFile(filePath)}
                      className={`file-tree-node block w-full text-left ${
                        isSelected ? "selected" : ""
                      }`}
                    >
                      <span className="file-tree-line">
                        {childPrefix}{filePrefix}
                      </span>
                      <FileIcon ext={file.extension} />
                      {file.name}{file.extension}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FileIcon({ ext }: { ext: string }) {
  if (ext === ".json") {
    return <span className="mr-1 text-[10px] text-accent">{"{}"}</span>;
  }
  if (ext === ".md") {
    return <span className="mr-1 text-[10px] text-fg-light">#</span>;
  }
  return null;
}
