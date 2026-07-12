import { ChatPanel } from "@/components/chat/chat-panel";

export default function ChatPage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <h1 className="mb-4 text-2xl font-bold">Chat</h1>
      <ChatPanel />
    </div>
  );
}
