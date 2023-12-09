"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { XMTPProvider, replyContentTypeConfig } from "@xmtp/react-sdk";

const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    // Required
    appName: "Link",
  })
);

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <ConnectKitProvider>
        <XMTPProvider
          dbVersion={5}
          contentTypeConfigs={[replyContentTypeConfig]}
        >
          {children}
        </XMTPProvider>
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default Providers;
