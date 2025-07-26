import { erc20Abi, formatUnits, type Address } from "viem";
import { useReadContract } from "wagmi";
import { truncateAddress } from "../utils/string";
import { IDRX_SEPOLIA } from "../constants";
export const ConnectedButton: React.FC<{
  address: Address;
  onClick: () => void;
}> = ({ address, onClick }) => {
  const { data } = useReadContract({
    address: IDRX_SEPOLIA,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as Address],
    query: {
      enabled: !!address,
    },
  });

  const formatted = formatUnits(data ?? BigInt(0), 2);

  return (
    <button
      className=" text-white bg-orange-500 px-4 py-2 rounded-lg cursor-pointer"
      onClick={onClick}
    >
      {truncateAddress(address ?? "")} - {Number(formatted).toLocaleString()}{" "}
      IDRX
    </button>
  );
};
