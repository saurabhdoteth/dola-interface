import type { CachedConversation, CachedMessageWithId } from "@xmtp/react-sdk";
import { useClient } from "@xmtp/react-sdk";
import MessageContentController from "./MessageContentController";
import truncateAddress from "@/app/utils/truncate";
import { FullMessage } from "./FullMessage";

interface FullMessageControllerProps {
  message: CachedMessageWithId;
  conversation: CachedConversation;
  isReply?: boolean;
}

export const FullMessageController = ({
  message,
  conversation,
  isReply,
}: FullMessageControllerProps) => {
  const { client } = useClient();

  return (
    <FullMessage
      isReply={isReply}
      message={message}
      conversation={conversation}
      key={message.xmtpID}
      from={{
        displayAddress: truncateAddress(message.senderAddress) ?? "",
        isSelf: client?.address === message.senderAddress,
      }}
      datetime={message.sentAt}
    >
      <MessageContentController
        message={message}
        isSelf={client?.address === message.senderAddress}
      />
    </FullMessage>
  );
};
