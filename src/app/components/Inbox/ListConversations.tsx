import {
  CachedConversation,
  ContentTypeMetadata,
  useLastMessage,
} from "@xmtp/react-sdk";
import { FC } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import truncateAddress from "@/app/utils/truncate";
import clsx from "clsx";
import { Address, useEnsName } from "wagmi";

dayjs.extend(relativeTime);

interface ConversationCardProps {
  conversation: CachedConversation<ContentTypeMetadata>;
  setSelectedConversation: (conversation: CachedConversation) => void;
  isSelected?: boolean;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  setSelectedConversation,
  isSelected = false,
}) => {
  const lastMessage = useLastMessage(conversation.topic);
  const { data: ensName } = useEnsName({
    address: conversation.peerAddress as Address,
  });

  return (
    <>
      <div
        className={clsx(
          "w-full flex flex-col space-y-1 border-y border-zinc-200 py-3 px-2 hover:bg-zinc-50 hover:cursor-pointer transition-all",
          isSelected && "bg-zinc-100"
        )}
        onClick={() => setSelectedConversation(conversation)}
      >
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            {ensName || truncateAddress(conversation.peerAddress)}
          </p>
          <span className="text-xs text-zinc-500">
            {dayjs(conversation.updatedAt).fromNow()}
          </span>
        </div>
        <p className="line-clamp-1 text-zinc-600">{lastMessage?.content}</p>
      </div>
    </>
  );
};

interface ListConversationsProps {
  conversations: CachedConversation<ContentTypeMetadata>[];
  selectedConversation?: CachedConversation;
  setSelectedConversation: (conversation: CachedConversation) => void;
  isLoading: boolean;
}

export const ListConversations: FC<ListConversationsProps> = ({
  conversations,
  selectedConversation,
  setSelectedConversation,
  isLoading,
}) => {
  return (
    <>
      <div className="sm:w-full flex flex-col h-full border-x outline-none overflow-y-auto relative">
        <div className="w-full h-full absolute top-0">
        {conversations.map((c) => (
          <ConversationCard
            key={c.id}
            conversation={c}
            isSelected={
              selectedConversation && selectedConversation.topic === c.topic
            }
            setSelectedConversation={setSelectedConversation}
          />
        ))}
        </div>
      </div>
    </>
  );
};
