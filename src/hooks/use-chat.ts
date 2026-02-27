import { useState, useRef, useCallback } from "react";
import { Message, createConversation, streamChat, escalateConversation } from "@/lib/chat-service";
import { toast } from "@/hooks/use-toast";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isEscalated, setIsEscalated] = useState(false);
  const assistantContentRef = useRef("");

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;
    const id = await createConversation();
    setConversationId(id);
    return id;
  }, [conversationId]);

  const send = useCallback(
    async (input: string) => {
      if (!input.trim() || isLoading) return;

      const userMsg: Message = { role: "user", content: input.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setIsLoading(true);
      assistantContentRef.current = "";

      try {
        const convId = await ensureConversation();

        const upsertAssistant = (chunk: string) => {
          assistantContentRef.current += chunk;
          const currentContent = assistantContentRef.current;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, content: currentContent } : m
              );
            }
            return [...prev, { role: "assistant", content: currentContent }];
          });
        };

        await streamChat({
          messages: updatedMessages,
          conversationId: convId,
          onDelta: upsertAssistant,
          onDone: () => setIsLoading(false),
        });
      } catch (e) {
        console.error(e);
        setIsLoading(false);
        toast({
          title: "Connection Error",
          description: e instanceof Error ? e.message : "Failed to reach support. Please try again.",
          variant: "destructive",
        });
      }
    },
    [messages, isLoading, ensureConversation]
  );

  const escalate = useCallback(async () => {
    if (!conversationId) return;
    try {
      await escalateConversation(conversationId);
      setIsEscalated(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "🔄 **Your case has been escalated to a human agent.** A support specialist will review your conversation and reach out shortly. Your reference number is `#" +
            conversationId.slice(0, 8).toUpperCase() +
            "`. Thank you for your patience.",
        },
      ]);
      toast({ title: "Escalated", description: "A human agent will follow up soon." });
    } catch {
      toast({ title: "Error", description: "Could not escalate. Please try again.", variant: "destructive" });
    }
  }, [conversationId]);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    setIsEscalated(false);
  }, []);

  return { messages, isLoading, isEscalated, send, escalate, reset };
}
