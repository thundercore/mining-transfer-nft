import { useEffect, useState, FormEvent, useCallback } from "react";
import { useAccount, useContract, useSigner } from "wagmi";
import { useNetwork } from "wagmi";
import ERC721ABI from "@/contracts/ERC721.json";
import ERC1155ABI from "@/contracts/ERC1155.json";
import addresses from "@/contracts/addresses";
import { ethers } from "ethers";

export const NFT = () => {
  const { chain } = useNetwork();
  const chainId = chain?.id as number;
  const [to, setto] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tokenID, settokenID] = useState("");
  const [tokenType, settokenType] = useState("ERC721");
  const [tokenAddress, settokenAddress] = useState("");
  const [transferAmount, settransferAmount] = useState("0");

  const { data: signerData } = useSigner();
  const { address } = useAccount();

  const onSelectTokenID = (e: any) => settokenID(e.target.value);
  const onSelectTokenType = (e: any) => settokenType(e.target.value);
  const onTokenAddressChange = (e: any) => settokenAddress(e.target.value);
  const onChangeAmount = (e: any) => settransferAmount(e.target.value);

  useEffect(() => {
    if (signerData) {
      setError("");
      setLoading(false);
    } else {
      setLoading(false);
      // setError("please connect your wallet");
    }
  }, [signerData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (!signerData) throw new Error("please connect your wallet");
      if (!ethers.utils.isAddress(to.toLowerCase()))
        throw new Error("custom: send to address is not valid");

      setLoading(true);

      const contract = new ethers.Contract(
        tokenAddress,
        tokenType === "ERC721" ? ERC721ABI : ERC1155ABI,
        signerData
      );

      //   function safeTransferFrom(
      //     address from,
      //     address to,
      //     uint256 id,
      //     uint256 amount,
      //     bytes memory data
      // )
      const func =
        tokenType === "ERC721"
          ? () => contract.transferFrom(address, to, tokenID)
          : () =>
              contract.safeTransferFrom(
                address,
                to,
                tokenID,
                transferAmount,
                "0x"
              );

      const tx = await func();
      await tx.wait();

      setError("");
      setLoading(false);
      alert("success");
    } catch (error) {
      console.log("error:", error);
      // @ts-ignore
      if (error.message.startsWith("custom:")) {
        // @ts-ignore
        setError(error.message.split("custom:")[1]);
      } else {
        setError("txn failed, check contract");
      }
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ margin: "20px" }}>
      <h2 className="mb-4 text-lg">Other NFTs</h2>
      <form onSubmit={(e) => handleSubmit(e)} className="mr-4">
        <div className="mb-2 flex">
          <h3 className="mr-2">Token address</h3>
          <input
            onChange={onTokenAddressChange}
            value={tokenAddress}
            placeholder="0x..."
          />
        </div>

        <div className="mb-2 flex">
          <h3 className="mr-2">Select Token type</h3>
          <select onChange={onSelectTokenType} value={tokenType}>
            <option>ERC721</option>
            <option>ERC1155</option>
          </select>
        </div>

        <div className="mb-2 flex">
          <h3 className="mr-2">Token ID</h3>
          <input onChange={onSelectTokenID} value={tokenID} placeholder="1" />
        </div>

        {tokenType === "ERC1155" && (
          <div className="mb-2 flex">
            <h3 className="mr-2">Transfer amount</h3>
            <input
              onChange={onChangeAmount}
              value={transferAmount}
              placeholder="10"
            />
          </div>
        )}

        <input
          required
          value={to}
          placeholder="send to address"
          onChange={(e) => setto(e.target.value)}
        />
        <button style={{ marginLeft: "20px" }} type="submit">
          submit
        </button>
      </form>
      <div style={{ color: "red" }}>{error}</div>
    </div>
  );
};
