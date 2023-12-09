"use client";

import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { XMTPProvider, replyContentTypeConfig } from "@xmtp/react-sdk";
import { baseGoerli } from "wagmi/chains";

const chains = [baseGoerli];

const config = createConfig(
  getDefaultConfig({
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    // Required
    appName: "Link",
    chains,
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
