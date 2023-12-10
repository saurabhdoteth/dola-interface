import { DolaCommunicateABI } from "@/app/abis/DolaCommunicate";
import { DOLA_COMMUNICATE } from "@/app/constants";
import { CachedConversation, useSendMessage } from "@xmtp/react-sdk";
import clsx from "clsx";
import { FC, useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { IoSendSharp } from "react-icons/io5";
import {
  Address,
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Loader } from "../UI/Loader";

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

  const { data: conversationResponse, refetch: fetchConversationResponse } =
    useContractRead({
      address: DOLA_COMMUNICATE,
      abi: DolaCommunicateABI,
      functionName: "conversations",
      args: [conversation?.topic as Address],
    });

  const { address } = useAccount();

  const showEndConversation = useMemo(
    () =>
      conversationResponse &&
      conversationResponse[5] === 0 &&
      conversationResponse[4] > BigInt(0) &&
      conversation?.peerAddress === address,
    [address, conversation?.peerAddress, conversationResponse]
  );

  const {
    writeAsync: closeConversation,
    data: closeConversationData,
    isLoading: closeConversationLoading,
  } = useContractWrite({
    address: DOLA_COMMUNICATE,
    abi: DolaCommunicateABI,
    functionName: "closeConversation",
    onSuccess() {
      setMessage("");
    },
  });

  useWaitForTransaction({
    hash: closeConversationData?.hash,
    onSuccess() {
      fetchConversationResponse();
      toast.success("Conversation Ended");
    },
  });

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="w-full flex-1 flex items-center space-x-2 border border-zinc-200 rounded-lg p-1">
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
        {showEndConversation ? (
          <button
            className={clsx(
              "flex items-center justify-center space-x-2 px-4 transition-all font-medium text-sm rounded-lg py-3",
              closeConversationLoading
                ? "bg-zinc-100 text-zinc-500"
                : "bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white"
            )}
            disabled={closeConversationLoading}
            onClick={() =>
              closeConversation({ args: [conversation?.topic as Address] })
            }
          >
            {closeConversationLoading && <Loader />}
            <span>End Conversation</span>
          </button>
        ) : (
          <></>
        )}
      </div>
    </>
  );
};

export default MessageInputController;
