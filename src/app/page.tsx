"use client";
import { useAccount, useEnsName } from "wagmi";
import Wallet from "./components/Wallet";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useInitXmtpClient from "./hooks/useInitXmtpClient";

export default function Home() {
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push(`/${ensName || address}`);
    }
  }, [address, ensName, isConnected, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-white bg-gradient-to-br from from-violet-900 to-violet-300">
      <h1 className="font-medium text-xl">Dola.gg</h1>
      <div className="mt-8 space-y-3 text-center">
        <p className="text-6xl font-bold">
          Take expert advice • Earn by replying
        </p>
        <p className="text-lg text-zinc-200">
          Showcase yourself and earn by replying to your audience.
        </p>
      </div>
      <div className="mt-12">
        <Wallet />
      </div>
    </main>
  );
}
