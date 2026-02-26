interface PanelProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}

export function Panel({ children, className = "", as: Tag = "div" }: PanelProps) {
  return (
    <Tag
      className={`panel mx-auto w-[calc(100%-2*16px)] max-w-[1200px] px-5 py-5 md:w-[calc(100%-2*40px)] md:px-7 md:py-6 ${className}`}
    >
      {children}
    </Tag>
  );
}
