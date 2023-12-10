/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Address,
  erc20ABI,
  useAccount,
  useContractRead,
  useContractWrite,
  useDisconnect,
  useEnsName,
  useWaitForTransaction,
} from "wagmi";
import { FaXTwitter } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { useRouter } from "next/navigation";
import truncateAddress from "../utils/truncate";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import useInitXmtpClient from "../hooks/useInitXmtpClient";
import { init } from "@airstack/airstack-react";
import useEns from "../hooks/useEns";
import { DOLA_COMMUNICATE, USDC } from "../constants";
import { formatUnits, maxUint256, parseUnits } from "viem";
import { DolaCommunicateABI } from "../abis/DolaCommunicate";
import { useSendMessage, useStartConversation } from "@xmtp/react-sdk";
import { Loader } from "../components/UI/Loader";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useXmtpStore } from "../store/useXmtpStore";
import { ConnectKitButton } from "connectkit";

const ConnectWallet = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName, truncatedAddress }) => {
        return (
          <button
            onClick={show}
            className={clsx(
              "flex items-center justify-center space-x-2 flex-1 transition-all font-medium text-sm rounded-lg py-3",
              "bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white"
            )}
          >
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default function Page({ params }: { params: { id: string } }) {
  init(process.env.NEXT_PUBLIC_AIRSTACK_API_KEY!);
  const { isConnected, address } = useAccount();
  const { data: myEnsName } = useEnsName({ address });

  const { data: ens } = useEns(
    params.id.includes(".eth") ? params.id : undefined
  );

  const isOwner = useMemo(() => {
    if (!address || !ens || !params.id) return false;

    const resolvedAddress = ens.resolvedAddress?.toLowerCase();
    const paramId = params.id.toLowerCase();
    const addressLowerCase = address.toLowerCase();

    if (!resolvedAddress) return paramId === addressLowerCase;
    return resolvedAddress === addressLowerCase || paramId === addressLowerCase;
  }, [address, ens, params.id]);

  const router = useRouter();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    if (isOwner) {
      router.push(`/${address}/inbox`);
    }
  }, [address, isOwner, router]);

  useInitXmtpClient();

  const [amount, setAmount] = useState("10");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedConversation } = useXmtpStore();

  const { data: allowance, refetch: fetchAllowance } = useContractRead({
    address: USDC,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as Address, DOLA_COMMUNICATE],
  });

  const {
    write: approve,
    data: approveData,
    isLoading: isApproveLoading,
  } = useContractWrite({
    address: USDC,
    abi: erc20ABI,
    functionName: "approve",
    args: [DOLA_COMMUNICATE, maxUint256],
  });

  useWaitForTransaction({
    hash: approveData?.hash,
    onSuccess() {
      fetchAllowance();
    },
  });

  const { writeAsync: openConversation, data: openConversationData } =
    useContractWrite({
      address: DOLA_COMMUNICATE,
      abi: DolaCommunicateABI,
      functionName: "openConversation",
      onSuccess() {
        setMessage("");
      },
    });

  useWaitForTransaction({
    hash: openConversationData?.hash,
    onSuccess() {
      setIsLoading(false);
      toast.success("Message sent");
      router.push(`/${address}/inbox`);
    },
  });

  const { startConversation } = useStartConversation();

  const handleOpenConversation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const peerAddress = (ens.resolvedAddress || params.id) as Address;

      if (peerAddress && message) {
        setIsLoading(true);
        const conversation = await startConversation(peerAddress, message);
        setSelectedConversation(conversation.cachedConversation);

        if (
          conversation.cachedMessage?.id &&
          conversation.cachedConversation?.topic
        ) {
          await openConversation({
            args: [
              conversation.cachedMessage.xmtpID as Address,
              conversation.cachedConversation?.topic,
              peerAddress,
              parseUnits(amount, 6),
            ],
          }).catch(() => {
            setIsLoading(false);
          });
        }
      }
    },
    [
      amount,
      ens.resolvedAddress,
      message,
      openConversation,
      params.id,
      setSelectedConversation,
      startConversation,
    ]
  );

  const needApproval = useMemo(() => {
    const formattedAllowance = Number(allowance);
    const formattedAmount = Number(parseUnits(amount, 6));

    if (formattedAllowance < formattedAmount) {
      return true;
    }
    return false;
  }, [allowance, amount]);

  return (
    <main className="relative flex min-h-screen w-full flex-1 bg-gradient-to-br from from-violet-800 to-violet-200">
      <div className="w-full flex items-center justify-center">
        <div className="bg-white rounded-xl p-4 w-full max-w-xl relative flex flex-col items-center justify-center">
          {ens.avatar ? (
            <img
              src={ens.avatar}
              alt={ens.name ?? ""}
              className="h-32 w-32 rounded-full object-cover absolute -top-20 shadow-xl"
            />
          ) : (
            <div className="h-32 w-32 rounded-full bg-purple-200 text-4xl flex items-center justify-center absolute -top-20 shadow-xl">
              🦄
            </div>
          )}
          <div className="mt-16 flex flex-col items-center">
            <div className="text-[32px] font-bold leading-[120%] tracking-[-1px] xl:text-[44px] xl:tracking-[-2px]">
              <p>
                {ens.resolvedAddress
                  ? ens.name
                  : truncateAddress(params.id as string)}
              </p>
            </div>
            <div className="mt-2 flex items-center space-x-3">
              {ens.twitter && (
                <Link
                  href={`https://twitter.com/${ens.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaXTwitter className="text-zinc-900 w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
          <div className="relative w-full flex flex-col mt-8">
            {!isConnected ? (
              <ConnectWallet />
            ) : (
              <div className="w-full flex flex-col space-y-4">
                <textarea
                  name="message"
                  id="message"
                  value={message}
                  rows={4}
                  className="appearance-none p-4 rounded-xl border border-zinc-200 w-full outline-none"
                  placeholder={`Send a message to ${ens.name || params.id}`}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <div className="flex items-center space-x-4">
                  <div className="rounded-lg border border-zinc-200 p-2 text-zinc-600 flex">
                    <img
                      src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png"
                      alt="USDC icon"
                      width={24}
                      height={24}
                    />
                    <input
                      type="text"
                      value={amount}
                      className="appearance-none w-full flex-1 text-base text-zinc-600 outline-none px-2"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <button
                    className={clsx(
                      "flex items-center justify-center space-x-2 flex-1 transition-all font-medium text-sm rounded-lg py-3",
                      isApproveLoading || isLoading
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white"
                    )}
                    disabled={isApproveLoading || isLoading}
                    onClick={(e) =>
                      needApproval ? approve() : handleOpenConversation(e)
                    }
                  >
                    {(isApproveLoading || isLoading) && <Loader />}
                    <span>
                      {needApproval
                        ? `Approve $${amount} USDC`
                        : `Pay $${amount} & Send Message`}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isConnected ? (
        <div className="fixed flex justify-center w-full">
          <div className="fixed bottom-[52px] -m-1 items-center space-x-1 rounded-[12px] p-1 transition-colors xl:flex 2xl:space-x-2 duration-400 bg-white delay-500">
            {isConnected && (
              <div className="flex items-center space-x-2">
                <Link href={`/${myEnsName || address}/inbox`}>
                  <button className="relative appearance-none text-zinc-500 font-light text-sm hover:bg-zinc-100 p-2 rounded-lg transition-all">
                    <span>My Inbox</span>
                  </button>
                </Link>
                <button
                  className="appearance-none text-zinc-500 font-light text-sm hover:bg-zinc-100 p-2 rounded-lg transition-all"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}
