import { CachedConversation } from "@xmtp/react-sdk";
import { create } from "zustand";

interface XmtpStoreProps {
  selectedConversation: CachedConversation | undefined;
  setSelectedConversation: (
    conversation: CachedConversation | undefined
  ) => void;
}

export const useXmtpStore = create<XmtpStoreProps>((set) => ({
  selectedConversation: undefined,
  setSelectedConversation: (conversation) =>
    set(() => ({ selectedConversation: conversation })),
}));
