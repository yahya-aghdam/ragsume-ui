import { ChatWidget } from "@/components/chat/ChatWidget";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col">
      <ChatWidget />
    </main>
  );
}
