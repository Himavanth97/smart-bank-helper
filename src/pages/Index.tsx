import { useRef, useEffect } from "react";
import { Bot, PhoneForwarded, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { QuickActions } from "@/components/QuickActions";
import { useChat } from "@/hooks/use-chat";

export default function Index() {
  const { messages, isLoading, isEscalated, send, escalate, reset } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
              <Bot className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-display font-semibold text-foreground">
                SecureBank Support
              </h1>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "FinBot is typing..." : "AI-Powered Assistant"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasMessages && !isEscalated && (
              <Button
                variant="outline"
                size="sm"
                onClick={escalate}
                className="gap-1.5 text-xs"
              >
                <PhoneForwarded className="h-3.5 w-3.5" />
                Escalate
              </Button>
            )}
            {hasMessages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="gap-1.5 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                New Chat
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        <div className="mx-auto max-w-2xl px-4 py-6">
          {!hasMessages ? (
            <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
              <QuickActions onSelect={send} />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <ChatMessage key={i} message={msg} />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <TypingIndicator />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 mx-auto w-full max-w-2xl">
        <ChatInput onSend={send} disabled={isLoading || isEscalated} />
      </div>
    </div>
  );
}
