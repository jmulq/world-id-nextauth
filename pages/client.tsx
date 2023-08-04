import { NextApiResponse } from "next";
import Layout from "../components/layout";
import { CredentialType, IDKitWidget, ISuccessResult } from "@worldcoin/idkit";

export default function ClientPage() {
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
      action: 'election_vote', // or get this from environment variables,
      signal: 'yes', // if we don't have a signal, use the empty string
    };

    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    const data = await response.json();
    console.log('data', data)
  };

  return (
    <Layout>
      <h1>Testing World ID actions</h1>
      <IDKitWidget
        app_id={appId} // obtained from the Developer Portal
        action="election_vote" // this is your action name from the Developer Portal
        signal="yes"
        onSuccess={onSuccess} // callback when the modal is closed
        handleVerify={handleVerify} // optional callback when the proof is received
        credential_types={["orb", "phone"] as CredentialType[]} // optional, defaults to ['orb']
        enableTelemetry // optional, defaults to false
        // theme="dark"
      >
        {({ open }) => <button onClick={open}>Cast a vote</button>}
      </IDKitWidget>
    </Layout>
  );
}
