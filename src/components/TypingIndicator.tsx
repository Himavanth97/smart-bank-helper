export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
        <div className="flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse-dot" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse-dot [animation-delay:0.2s]" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
      <div className="rounded-2xl rounded-tl-md bg-chat-assistant border border-border px-4 py-3 shadow-sm">
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot [animation-delay:0.2s]" />
          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse-dot [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
}
