import { isMessageSupported } from "@/app/utils/isMessageSupported";
import {
  CachedConversation,
  ContentTypeId,
  useConversation,
  useMessages,
} from "@xmtp/react-sdk";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { isSameDay } from "date-fns";
import { DateDivider } from "./DateDivider";
import { FullConversation } from "./FullConversation";
import { FullMessageController } from "./FullMessageController";

interface FullConversationControllerProps {
  conversation: CachedConversation;
}

const FullConversationController: FC<FullConversationControllerProps> = ({
  conversation,
}) => {
  const lastMessageDateRef = useRef<Date>();
  const renderedDatesRef = useRef<Date[]>([]);
  const { messages, isLoading } = useMessages(conversation);

  const messagesWithDates = useMemo(
    () =>
      messages?.map((msg, index) => {
        if (!isMessageSupported(msg) && !msg.contentFallback) {
          return null;
        }
        if (renderedDatesRef.current.length === 0) {
          renderedDatesRef.current.push(msg.sentAt);
        }
        const lastRenderedDate = renderedDatesRef.current.at(-1) as Date;
        const isFirstMessage = index === 0;
        const isSameDate = isSameDay(lastRenderedDate, msg.sentAt);
        const shouldDisplayDate = isFirstMessage || !isSameDate;

        if (shouldDisplayDate) {
          renderedDatesRef.current.push(msg.sentAt);
        }

        const messageDiv = (
          <div key={msg.uuid}>
            {shouldDisplayDate && (
              <DateDivider date={renderedDatesRef.current.at(-1) as Date} />
            )}
            <FullMessageController message={msg} conversation={conversation} />
          </div>
        );

        lastMessageDateRef.current = msg.sentAt;
        return !msg.content ? null : messageDiv;
      }),
    [messages, conversation]
  );

  return (
    <div
      id="scrollableDiv"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      className="w-full h-full flex flex-col overflow-auto relative"
    >
      <FullConversation isLoading={isLoading} messages={messagesWithDates} />
    </div>
  );
};

interface ListMessagesProps {
  topic: string;
}
export const ListMessages: FC<ListMessagesProps> = ({ topic }) => {
  const { getCachedByTopic } = useConversation();
  const [conversation, setConversation] = useState<any>();

  useEffect(() => {
    const fetchConversation = async () => {
      const conversation = await getCachedByTopic(topic);
      setConversation(conversation);
    };

    fetchConversation();
  }, [getCachedByTopic, topic]);

  return (
    <>
      {conversation && (
        <FullConversationController conversation={conversation} />
      )}
    </>
  );
};
