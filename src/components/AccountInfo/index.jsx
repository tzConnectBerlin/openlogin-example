import React, { useState } from "react";
import { PageHeader, Button } from "antd";
import { TezosToolkit } from "@taquito/taquito";
import { InMemorySigner, importKey } from "@taquito/signer";
import "./style.scss";

function AccountInfo({ handleLogout, walletInfo }) {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");

  const Tezos = new TezosToolkit("https://florencenet.smartpy.io/");

  const sKey = walletInfo.secretKey;
  Tezos.setProvider({
    signer: new InMemorySigner(sKey),
  });

  importKey(Tezos, sKey).catch((e) => console.error(e));

  const addr = walletInfo.address;
  const handleTransfer = async (addr) => {
    setLoading(true);
    try {
      const req = await Tezos.contract.transfer({ to: addr, amount: amount });
      //await req.confirmation(1);

      setTransfer(req);
      setAmount("");
    } catch (error) {
      console.log(error);
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
            Wallet address: <i>{walletInfo?.address}</i>
          </div>
          <div style={{ margin: 20 }}>
            Tez Balance: <i>{walletInfo?.balance}</i>
          </div>
          {/* <div style={{ margin: 20 }}>
            Private key: <i>{walletInfo?.secretKey}</i>
          </div> */}
          {loading ? (
            <div style={{ margin: 20 }}>
              Transfering {amount} ꜩ to {addr}...
            </div>
          ) : (
            <div>
              <input
                style={{ marginRight: 10 }}
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Button key="1" type="primary" onClick={handleTransfer}>
                Request / Send
              </Button>
            </div>
          )}

          {/* <div style={{ margin: 20 }}>
            Operation injected: https://edo.tzstats.com/{transfer}
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default AccountInfo;
