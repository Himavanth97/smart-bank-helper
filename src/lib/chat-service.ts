import { supabase } from "@/integrations/supabase/client";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

export async function createConversation(): Promise<string> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ title: "New Support Chat" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function escalateConversation(conversationId: string) {
  const { error } = await supabase
    .from("conversations")
    .update({ status: "escalated" })
    .eq("id", conversationId);
  if (error) throw error;
}

export async function streamChat({
  messages,
  conversationId,
  onDelta,
  onDone,
}: {
  messages: Message[];
  conversationId: string;
  onDelta: (text: string) => void;
  onDone: () => void;
}) {
  const resp = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, conversationId }),
    }
  );

  if (!resp.ok || !resp.body) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || "Failed to connect to support");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let fullContent = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) {
          fullContent += content;
          onDelta(content);
        }
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  // Save assistant message
  if (fullContent) {
    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-assistant-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ conversationId, content: fullContent }),
      }
    ).catch(console.error);
  }

  onDone();
}
