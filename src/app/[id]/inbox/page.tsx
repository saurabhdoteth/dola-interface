"use client";
import { ListConversations } from "@/app/components/Inbox/ListConversations";
import { ListMessages } from "@/app/components/Inbox/ListMessages";
import useInitXmtpClient from "@/app/hooks/useInitXmtpClient";
import { CachedConversation, useConversations } from "@xmtp/react-sdk";
import { useEffect, useState } from "react";

export default function Inbox() {
  const { isLoading } = useInitXmtpClient();
  const { conversations } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<string>("");

  useEffect(() => {
    if (conversations && conversations.length) {
      setSelectedConversation(conversations[0].topic);
    }
  }, [conversations]);

  return (
    <main className="relative flex min-h-screen w-full flex-1">
      <div className="flex w-full flex-1 flex-col p-6 pt-0 xl:px-12 xl:py-6">
        <h1 className="text-4xl font-bold">Inbox</h1>
        <div className="grid grid-cols-10 gap-0 mt-4 h-full">
          <div className="col-span-3 border-x border-zinc-200">
            <ListConversations
              conversations={conversations}
              isLoading={isLoading}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
          </div>
          <div className="col-span-7 border-y border-r border-zinc-200">
            <ListMessages topic={selectedConversation} />
          </div>
        </div>
      </div>
    </main>
  );
}
