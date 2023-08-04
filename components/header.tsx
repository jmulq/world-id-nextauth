import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./header.module.css";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from "wagmi";

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  const { address, connector, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { data: ensAvatar } = useEnsAvatar({ name: ensName });

  const { disconnect } = useDisconnect();

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  console.log(
    "useConnect hook return values: ",
    connect,
    connectors,
    error,
    isLoading,
    pendingConnector
  );

  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      <div className={styles.signedInStatus}>
        <p
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session && (
            <>
              <span className={styles.notSignedInText}>
                You are not signed in
              </span>
              <a
                href={`/api/auth/signin`}
                className={styles.buttonPrimary}
                onClick={(e) => {
                  e.preventDefault();
                  signIn("worldcoin"); // when worldcoin is the only provider
                  // signIn() // when there are multiple providers
                }}
              >
                Sign in to World ID
              </a>
            </>
          )}
          {session?.user && (
            <>
              {session.user.image && (
                <span
                  style={{ backgroundImage: `url('${session.user.image}')` }}
                  className={styles.avatar}
                />
              )}
              <span className={styles.signedInText}>
                <small>Signed in as</small>
                <br />
                <strong>{session.user.email ?? session.user.name}</strong>
              </span>
              <a
                href={`/api/auth/signout`}
                className={styles.button}
                onClick={(e) => {
                  e.preventDefault();
                  signOut();
                }}
              >
                Sign out
              </a>
            </>
          )}
        </p>
      </div>
      <nav>
        <ul className={styles.navItems}>
          <li className={styles.navItem}>
            <Link href="/">Home</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/client">Client</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/server">Server</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/protected">Protected</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/api-example">API</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/admin">Admin</Link>
          </li>
          <li className={styles.navItem}>
            <Link href="/me">Me</Link>
          </li>
        </ul>
      </nav>

      {isConnected ? (
                <div>
                  <img src={ensAvatar || ""} alt="ENS Avatar" />
                  <div>{ensName ? `${ensName} (${address})` : address}</div>
                  <div>Connected to {connector?.name}</div>
                  <button onClick={() => disconnect()}>Disconnect</button>
                </div>
              ) : (
                connectors.map((connector) => (
                  <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => connect({ connector })}
                  >
                    {connector.name}
                    {!connector.ready && " (unsupported)"}
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      " (connecting)"}
                  </button>
                ))
              )}

    </header>
  );
}
