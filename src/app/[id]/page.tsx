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
  const { disconnect } = useDisconnect({
    onSuccess() {
      router.push("/");
    },
  });

  useEffect(() => {
    if (isOwner) {
      router.push(`/${address}/inbox`);
    }
  }, [address, isOwner, router]);

  useInitXmtpClient();

  const [amount, setAmount] = useState("10");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: allowance, refetch: fetchAllowance } = useContractRead({
    address: USDC,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address as Address, DOLA_COMMUNICATE],
  });

  const { write: approve, data: approveData } = useContractWrite({
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

  const { writeAsync: openConversation } = useContractWrite({
    address: DOLA_COMMUNICATE,
    abi: DolaCommunicateABI,
    functionName: "openConversation",
    onSuccess() {
      setMessage("");
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
        console.log({ conversation });

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
          }).finally(() => {
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
    <main className="relative flex min-h-screen w-full flex-1">
      <div className="flex h-full w-full max-w-[428px] flex-1 flex-col p-6 pt-0 xl:max-w-[1728px] xl:flex-row xl:p-16">
        <div className="mb-10 flex flex-col px-4 xl:mb-0 xl:mr-20 xl:flex-1 xl:px-0">
          <div className="relative xl:sticky xl:top-16">
            {ens.avatar ? (
              <img
                src={ens.avatar}
                alt={ens.name ?? ""}
                className="h-40 w-40 rounded-full object-cover"
              />
            ) : (
              <div className="h-40 w-40 rounded-full bg-purple-600/25 text-4xl flex items-center justify-center">
                🦄
              </div>
            )}
            <div className="ml-2 w-[calc(100%-8px)] max-w-[min(500px,100%-8px)] xl:max-w-[min(500px,calc(100vw_-_1000px))] mt-6">
              <div className="text-[32px] font-bold leading-[120%] tracking-[-1px] xl:text-[44px] xl:tracking-[-2px]">
                <p>
                  {ens.resolvedAddress
                    ? ens.name
                    : truncateAddress(params.id as string)}
                </p>
              </div>
              <div className="mt-2 ml-2 flex items-center space-x-3">
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
          </div>
        </div>
        <div className="relative flex-1 xl:w-[820px] xl:flex-none flex flex-col">
          {isOwner ? (
            <div className="flex items-center justify-center w-full">
              <span className="font-bold text-4xl text-zinc-900">
                Go to Inbox
              </span>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <textarea
                name="message"
                id="message"
                value={message}
                rows={10}
                className="appearance-none p-4 rounded-xl border border-zinc-200"
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
                  className="flex-1 bg-violet-600/10 text-violet-600 hover:bg-violet-600 hover:text-white transition-all font-medium text-sm rounded-lg py-3"
                  onClick={(e) =>
                    needApproval ? approve() : handleOpenConversation(e)
                  }
                >
                  {needApproval
                    ? `Approve $${amount} USDC`
                    : `Pay $${amount} & Send Message`}
                </button>
              </div>
            </div>
          )}
          {/* <div className="grid grid-cols-10 gap-4 space-x-4 mt-12">
            <div className="bg-zinc-100 rounded-xl p-4 col-span-4 flex flex-col relative">
              <IoSearch className="w-20 h-20 text-zinc-300" />
              <p className="text-4xl text-zinc-400 font-semibold px-2 mt-6">
                Explorer
              </p>
              <span className="text-zinc-400 px-2 text-sm mt-1">
                Explore categorized profiles
              </span>
              <div className="absolute -top-4 -right-4 rounded-full p-2 bg-white text-zinc-600 font-medium text-xs shadow-md">
                Coming Soon
              </div>
            </div>
            <div className="bg-zinc-100 rounded-xl p-4 col-span-6 flex flex-col">
              <p className="text-zinc-300 font-medium text-2xl">Why LinkMe?</p>
              <p className="text-zinc-400 font-medium text-2xl mt-6">
                Send $10 and get validation on your idea from from{" "}
                <span className="text-violet-600">@balajis</span>
              </p>
            </div>
          </div> */}
        </div>
      </div>
      <div className="fixed left-16 bottom-[52px] -m-1 items-center space-x-1 rounded-[12px] p-1 transition-colors xl:flex 2xl:space-x-2 duration-400 bg-white delay-500">
        {isConnected && (
          <div className="flex items-center space-x-2">
            <Link href={`/${myEnsName || address}/inbox`}>
              <button className="relative appearance-none text-zinc-500 font-light text-sm hover:bg-zinc-100 p-2 rounded-lg transition-all">
                <span>My Inbox</span>
                {/* <div className="absolute top-1.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500"></div> */}
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
    </main>
  );
}
