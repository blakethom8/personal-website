"use client";

interface JsonBlockProps {
  code: string;
  highlightLines?: number[];
  className?: string;
}

// Lightweight JSON syntax highlighter — no external deps
function highlightJson(code: string): { html: string; lineCount: number } {
  const lines = code.split("\n");
  const highlighted = lines.map((line, i) => {
    const lineNum = i + 1;
    // Tokenize the line for coloring
    const colored = line
      // Comments (our custom // comments in JSON-ish content)
      .replace(
        /^(\s*\/\/.*)$/,
        '<span class="json-comment">$1</span>'
      )
      // Strings (keys and values)
      .replace(
        /"([^"]*)"(\s*:)?/g,
        (match, content, colon) => {
          if (colon) {
            // It's a key
            return `<span class="json-key">"${content}"</span>${colon}`;
          }
          // It's a string value
          return `<span class="json-string">"${content}"</span>`;
        }
      )
      // Numbers
      .replace(
        /:\s*(\d+\.?\d*)/g,
        (match, num) => match.replace(num, `<span class="json-number">${num}</span>`)
      )
      // Booleans and null
      .replace(
        /:\s*(true|false|null)/g,
        (match, val) => match.replace(val, `<span class="json-boolean">${val}</span>`)
      );

    return { html: colored, lineNum };
  });

  return {
    html: highlighted.map((l) => l.html).join("\n"),
    lineCount: lines.length,
  };
}

export function JsonBlock({ code, highlightLines = [], className = "" }: JsonBlockProps) {
  const lines = code.split("\n");

  return (
    <div className={`json-block overflow-x-auto ${className}`}>
      <pre className="p-4">
        <code>
          {lines.map((line, i) => {
            const lineNum = i + 1;
            const isHighlighted = highlightLines.includes(lineNum);
            // Apply syntax coloring
            let colored = line;

            // Comments
            if (/^\s*\/\//.test(colored)) {
              colored = `<span class="json-comment">${colored}</span>`;
            } else {
              // Keys
              colored = colored.replace(
                /"([^"]*)"(\s*:)/g,
                '<span class="json-key">"$1"</span>$2'
              );
              // String values (after colon or in arrays)
              colored = colored.replace(
                /:\s*"([^"]*)"/g,
                ': <span class="json-string">"$1"</span>'
              );
              // Standalone strings in arrays
              colored = colored.replace(
                /^\s*"([^"]*)"\s*,?\s*$/gm,
                (match) => {
                  if (match.includes(":")) return match; // already handled
                  return match.replace(/"([^"]*)"/, '<span class="json-string">"$1"</span>');
                }
              );
              // Numbers
              colored = colored.replace(
                /:\s*(\d+\.?\d*)/g,
                (m, num) => m.replace(num, `<span class="json-number">${num}</span>`)
              );
              // Booleans
              colored = colored.replace(
                /:\s*(true|false|null)/g,
                (m, val) => m.replace(val, `<span class="json-boolean">${val}</span>`)
              );
            }

            return (
              <div
                key={i}
                className={`json-line ${isHighlighted ? "json-line-highlight" : ""}`}
              >
                <span className="json-line-number">{lineNum}</span>
                <span dangerouslySetInnerHTML={{ __html: colored }} />
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
