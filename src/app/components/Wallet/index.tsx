import { ConnectKitButton } from "connectkit";

const Wallet = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, ensName, truncatedAddress }) => {
        return (
          <button
            onClick={show}
            className="rounded-xl p-4 bg-violet-700 text-white w-full"
          >
            {isConnected ? ensName ?? truncatedAddress : "Create Your Link"}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default Wallet;
