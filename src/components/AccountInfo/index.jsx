import React, { useEffect, useState } from "react";
import { PageHeader, Button, Input } from "antd";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";
import "./style.scss";

const Tezos = new TezosToolkit("https://florencenet.smartpy.io/");

function AccountInfo({ handleLogout, walletInfo }) {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  useEffect(() => {
    if (walletInfo.secretKey) {
      Tezos.setProvider({
        signer: new InMemorySigner(walletInfo.secretKey),
      });
    }
  }, [walletInfo.secretKey]);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const req = await Tezos.contract.transfer({
        to: recipient,
        amount: amount,
      });
      setTransfer(req.hash);
    } catch (error) {
      console.log(error);
    } finally {
      setAmount("");
      setRecipient("");
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        className="site-page-header"
        title="Openlogin"
        extra={[
          <Button key="1" type="primary" onClick={handleLogout}>
            Logout
          </Button>,
        ]}
      />
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            margin: 20,
          }}
        >
          <div style={{ margin: 20 }}>
            Wallet address:{" "}
            <i>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://florence.tzstats.com/${walletInfo?.address}`}
              >
                {walletInfo?.address}
              </a>
            </i>
          </div>
          <div style={{ margin: 20 }}>
            Balance: <i>{`${walletInfo?.balance} ꜩ`}</i>
          </div>
          {loading ? (
            <div style={{ margin: 20 }}>
              Transferring {amount} ꜩ to {recipient}...
            </div>
          ) : (
            <div>
              <Input
                style={{ marginRight: 10 }}
                type="text"
                placeholder="Recipient address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
              <Input
                style={{ marginRight: 10, marginTop: 10, width: "100%" }}
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button
                style={{ marginRight: 10, marginTop: 10, width: "100%" }}
                type="primary"
                onClick={handleTransfer}
              >
                Send
              </Button>
            </div>
          )}

          {transfer && (
            <div style={{ margin: 20 }}>
              Last operation injected:
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://florence.tzstats.com/${transfer}`}
              >
                {transfer}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountInfo;
