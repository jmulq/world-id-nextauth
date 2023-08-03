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
      <h1>Client Side Rendering</h1>
      <p>
        This page uses the <strong>useSession()</strong> React Hook in the{" "}
        <strong>&lt;Header/&gt;</strong> component.
      </p>
      <p>
        The <strong>useSession()</strong> React Hook is easy to use and allows
        pages to render very quickly.
      </p>
      <p>
        The advantage of this approach is that session state is shared between
        pages by using the <strong>Provider</strong> in <strong>_app.js</strong>{" "}
        so that navigation between pages using <strong>useSession()</strong> is
        very fast.
      </p>
      <p>
        The disadvantage of <strong>useSession()</strong> is that it requires
        client side JavaScript.
      </p>

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
