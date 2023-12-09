const ENCODING = "binary";

export const buildLocalStorageKey = (walletAddress?: string) =>
  walletAddress ? `xmtp:production:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress?: string): Uint8Array | undefined => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : undefined;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(
    buildLocalStorageKey(walletAddress),
    Buffer.from(keys).toString(ENCODING)
  );
};
