import { CachedConversation, useSendMessage } from "@xmtp/react-sdk";
import { FC, useCallback, useMemo, useState } from "react";
import { IoSendSharp } from "react-icons/io5";

interface MessageInputControllerProps {
  conversation?: CachedConversation;
}
const MessageInputController: FC<MessageInputControllerProps> = ({
  conversation,
}) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const peerAddress = useMemo(
    () => conversation && conversation.peerAddress,
    [conversation]
  );
  const { sendMessage } = useSendMessage();

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      if (!conversation) return;
      e.preventDefault();

      if (peerAddress && message) {
        setIsLoading(true);
        setMessage("");
        await sendMessage(conversation, message);
        setIsLoading(false);
      }
    },
    [conversation, message, peerAddress, sendMessage]
  );

  return (
    <>
      <div className="w-full flex items-center space-x-2 border border-zinc-200 rounded-lg p-1">
        <input
          type="text"
          value={message}
          placeholder="Type a message"
          className="px-2 py-2 flex-1 outline-none"
          onChange={(e) => setMessage(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleSendMessage(e);
            }
          }}
        />
        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center p-2 text-sm text-white rounded-md bg-violet-600 outline-none"
        >
          <div className="flex items-center">
            <span>Send</span>
          </div>
        </button>
      </div>
    </>
  );
};

export default MessageInputController;
