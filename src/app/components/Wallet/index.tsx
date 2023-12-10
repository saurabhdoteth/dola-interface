import { ConnectKitButton } from "connectkit";

const Wallet = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName, truncatedAddress }) => {
        return (
          <button
            onClick={show}
            className="rounded-xl p-4 bg-white text-violet-600 font-medium w-full"
          >
            {isConnected ? ensName ?? truncatedAddress : "Show My Profile"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default Wallet;
