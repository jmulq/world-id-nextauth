import { NextApiResponse } from "next";
import Layout from "../components/layout";
import {
  CredentialType,
  IDKitWidget,
  ISuccessResult,
  solidityEncode,
} from "@worldcoin/idkit";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { useState } from "react";
import ContractAbi from "../abi/Contract.abi";
import { BigNumber } from "ethers";
import { decode } from "../utils/wld";

export default function ClientPage() {
  const { address } = useAccount();

  const [proof, setProof] = useState<ISuccessResult | null>(null);

  const { config } = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDR as `0x${string}`,
    abi: ContractAbi,
    enabled: proof != null && address != null,
    functionName: "verifyAndExecute",
    args: [
      address!,
      proof?.merkle_root
        ? decode<BigNumber>("uint256", proof?.merkle_root ?? "")
        : BigNumber.from(0),
      proof?.nullifier_hash
        ? decode<BigNumber>("uint256", proof?.nullifier_hash ?? "")
        : BigNumber.from(0),
      proof?.proof
        ? decode<
            [
              BigNumber,
              BigNumber,
              BigNumber,
              BigNumber,
              BigNumber,
              BigNumber,
              BigNumber,
              BigNumber
            ]
          >("uint256[8]", proof?.proof ?? "")
        : [
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
            BigNumber.from(0),
          ],
    ],
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const appId = process.env.NEXT_PUBLIC_APP_ID;

  if (!appId) {
    return <>No app ID. Redeploy with correct env variables</>;
  }

  const onSuccess = (result: ISuccessResult) => {
    console.log("onSuccess called with: ", result);
  };

  const handleVerify = (result: ISuccessResult) => {
    console.log("handleVerify called with: ", result);
    validateProof(result);
  };

  const validateProof = async (res: ISuccessResult) => {
    const reqBody = {
      merkle_root: res.merkle_root,
      nullifier_hash: res.nullifier_hash,
      proof: res.proof,
      credential_type: res.credential_type,
      action: "election_vote", // or get this from environment variables,
      signal: "yes", // if we don't have a signal, use the empty string
    };

    const response = await fetch("/api/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    console.log("data", data);
  };

  return (
    <Layout>
      <h1>Testing World ID actions</h1>

      {proof ? (
        <>
          <button onClick={write}>
            {isLoading ? "Sending..." : "Send tx"}
          </button>
          {isSuccess && (
            <div>
              Transaction successful!
              <div>
                <a href={`https://goerli-optimism.etherscan.io/tx/${data?.hash}`}>Etherscan</a>
              </div>
            </div>
          )}
        </>
      ) : (
        <IDKitWidget
          app_id={appId} // obtained from the Developer Portal
          action={solidityEncode(["uint256"], ["election_vote"])}
          signal={address}
          onSuccess={setProof} // callback when the modal is closed
          // handleVerify={handleVerify} // optional callback when the proof is received - Not needed when performing on-chain proof validation
          // credential_types={["orb" || "phone"] as CredentialType[]} // optional, defaults to ['orb']
          enableTelemetry // optional, defaults to false
          // theme="dark"
        >
          {({ open }) => <button onClick={open}>Cast a vote</button>}
        </IDKitWidget>
      )}
    </Layout>
  );
}
