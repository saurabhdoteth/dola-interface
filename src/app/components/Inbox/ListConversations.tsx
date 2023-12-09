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

dayjs.extend(relativeTime);

interface ConversationCardProps {
  conversation: CachedConversation<ContentTypeMetadata>;
  setSelectedConversation: (topic: string) => void;
  isSelected?: boolean;
}

const ConversationCard: FC<ConversationCardProps> = ({
  conversation,
  setSelectedConversation,
  isSelected = false,
}) => {
  const lastMessage = useLastMessage(conversation.topic);

  return (
    <>
      <div
        className={clsx(
          "w-full flex flex-col space-y-1 border-y border-zinc-200 py-3 px-2 hover:bg-zinc-50 hover:cursor-pointer transition-all",
          isSelected && "bg-zinc-100"
        )}
        onClick={() => setSelectedConversation(conversation.topic)}
      >
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium">
            {truncateAddress(conversation.peerAddress)}
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
  selectedConversation: string;
  setSelectedConversation: (topic: string) => void;
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
      <div className="flex flex-col w-full">
        {conversations.map((c) => (
          <ConversationCard
            key={c.id}
            conversation={c}
            isSelected={selectedConversation === c.topic}
            setSelectedConversation={setSelectedConversation}
          />
        ))}
      </div>
    </>
  );
};
