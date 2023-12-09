"use client";
import { ListConversations } from "@/app/components/Inbox/ListConversations";
import { ListMessages } from "@/app/components/Inbox/ListMessages";
import MessageInputController from "@/app/components/Inbox/MessageInputController";
import useInitXmtpClient from "@/app/hooks/useInitXmtpClient";
import { CachedConversation, useConversations } from "@xmtp/react-sdk";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";

export default function Inbox() {
  const { isLoading } = useInitXmtpClient();
  const { conversations } = useConversations();
  const [selectedConversation, setSelectedConversation] =
    useState<CachedConversation>();

  useEffect(() => {
    if (conversations && conversations.length) {
      setSelectedConversation(conversations[0]);
    }
  }, [conversations]);

  const router = useRouter();

  return (
    <main className="relative flex min-h-screen w-full flex-1">
      <div className="flex w-full flex-1 flex-col p-6 pt-0 xl:px-12 xl:py-6">
        <div className="flex items-center space-x-3">
          <FaArrowLeft
            className="w-6 h-6 cursor-pointer"
            onClick={() => router.back()}
          />
          <h1 className="text-4xl font-bold">Inbox</h1>
        </div>
        <div className="grid grid-cols-10 gap-0 mt-4 h-full">
          <div className="col-span-3 border-x border-zinc-200">
            <ListConversations
              conversations={conversations}
              isLoading={isLoading}
              selectedConversation={selectedConversation}
              setSelectedConversation={setSelectedConversation}
            />
          </div>
          <div className="col-span-7 border-y border-r border-zinc-200 py-2">
            <div className="flex h-full">
              <div className="h-full w-full flex flex-col justify-between">
                <ListMessages conversation={selectedConversation} />
                <div className="px-2 pt-4 pb-0">
                  <MessageInputController conversation={selectedConversation} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
