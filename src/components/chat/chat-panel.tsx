"use client";

import { useChat } from "@ai-sdk/react";
import { Bot, Loader2, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({ api: "/api/chat" });

  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border p-4">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Ask anything to get started.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}
          >
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                "max-w-[75%] space-y-2 rounded-xl px-4 py-2 text-sm",
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {m.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <p key={i} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {error && <p className="text-sm text-destructive">{error.message}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Send a message…"
          disabled={busy}
        />
        <Button type="submit" disabled={busy || !input.trim()} size="icon">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
