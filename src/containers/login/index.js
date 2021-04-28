import React, { useEffect, useState } from "react";
import secp256k1 from "secp256k1";
import OpenLogin from "@toruslabs/openlogin";
import sodium from "libsodium-wrappers";
import { hex2buf, b58cencode } from "@taquito/utils";
import AccountInfo from "../../components/AccountInfo";
import "./style.scss";

const color = "#2c7df7";

function Login() {
  const [loading, setLoading] = useState(false);
  const [openlogin, setSdk] = useState(undefined);
  const [walletInfo, setUserAccountInfo] = useState(null);

  const publicKeyHash = async (key) => {
    await sodium.ready;
    return b58cencode(
      sodium.crypto_generichash(20, key),
      new Uint8Array([6, 161, 161])
    );
  };

  const getSecretKey = (key) => {
    return b58cencode(key, new Uint8Array([17, 162, 224, 201]));
  };

  useEffect(() => {
    async function initializeOpenlogin() {
      const sdkInstance = new OpenLogin({
        clientId: "ggj1wTrEGACZypRcGrbdy4GA6sTsBAhV",
        network: "testnet",
      });
      await sdkInstance.init();
      if (sdkInstance.privKey) {
        await init(hex2buf(sdkInstance?.privKey));
      }
      setSdk(sdkInstance);
      setLoading(false);
    }
    setLoading(true);
    initializeOpenlogin();
  }, []);

  const fetchBalance = async (address) => {
    const req = await fetch(
      `https://api.florencenet.tzkt.io/v1/accounts/${address}`
    );
    const data = await req.json();
    let balance = data.balance ?? 0;
    return balance / 1e6;
  };

  const init = async (key) => {
    const publicKey = secp256k1.publicKeyCreate(key);
    const secretKey = getSecretKey(key);
    const address = await publicKeyHash(publicKey);
    const balance = await fetchBalance(address);
    setUserAccountInfo({
      address,
      balance,
      secretKey,
    });
  };

  async function handleLogin() {
    setLoading(true);
    try {
      await openlogin.login({
        loginProvider: "google",
        redirectUrl: `${window.origin}`,
      });
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    setLoading(true);
    await openlogin.logout();
    setLoading(false);
  };
  return (
    <>
      {loading ? (
        <div>
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
            <h1>....loading</h1>
          </div>
        </div>
      ) : (
        <div>
          {openlogin && openlogin.privKey ? (
            <AccountInfo
              handleLogout={handleLogout}
              loading={loading}
              walletInfo={walletInfo}
            />
          ) : (
            <div className="container">
              <div className="loginContainer">
                <svg version="1.1" viewBox="0 0 64 64" width="70" height="70">
                  <path
                    d="M 36.838337 54.467 C 33.612306 54.467 31.26262 53.69488 29.786447 52.15064 C 28.31169 50.60711 27.573602 48.942334 27.573602 47.158445 C 27.573602 46.50615 27.701934 45.95737 27.959308 45.511397 C 28.210414 45.071363 28.575002 44.706776 29.015035 44.45567 C 29.461007 44.198296 30.009787 44.069964 30.662084 44.069964 C 31.31438 44.069964 31.86245 44.198296 32.30913 44.45567 C 32.755104 44.713043 33.106777 45.065425 33.36415 45.511397 C 33.621524 45.95737 33.749856 46.50615 33.749856 47.158445 C 33.749856 47.94758 33.561257 48.59066 33.18406 49.08839 C 32.806153 49.58612 32.36018 49.91156 31.845434 50.066836 C 32.292115 50.68368 32.99546 51.121145 33.95618 51.37852 C 34.9169 51.65362 35.87762 51.79046 36.838337 51.79046 C 38.176254 51.79046 39.38584 51.43028 40.46709 50.709915 C 41.547633 49.988844 42.345987 48.92532 42.860734 47.518626 C 43.37548 46.111935 43.632854 44.515936 43.632854 42.73134 C 43.632854 40.792884 43.349247 39.13662 42.78345 37.76467 C 42.23396 36.374994 41.4193 35.3455 40.33805 34.676188 C 39.290176 34.016757 38.076428 33.668813 36.838337 33.672927 C 36.01446 33.672927 34.985674 34.01609 33.749856 34.70242 L 31.485253 35.834723 L 31.485253 34.70242 L 41.676674 21.114096 L 27.573602 21.114096 L 27.573602 35.21646 C 27.573602 36.383502 27.830976 37.34422 28.345723 38.099325 C 28.86047 38.85443 29.649606 39.231627 30.71384 39.231627 C 31.536302 39.231627 32.32615 38.957237 33.081252 38.40775 C 33.841203 37.85355 34.50229 37.175206 35.036723 36.401228 C 35.105498 36.245953 35.19129 36.134637 35.294096 36.065862 C 35.386573 35.98421 35.505393 35.938645 35.628753 35.93753 C 35.81735 35.93753 36.039983 36.03183 36.298066 36.221137 C 36.538423 36.49482 36.658247 36.81246 36.658247 37.17264 C 36.62871 37.415214 36.58563 37.655947 36.529205 37.89371 C 35.946393 39.197594 35.13953 40.192346 34.110037 40.878675 C 33.10778 41.556656 31.92385 41.915543 30.71384 41.90817 C 27.659393 41.90817 25.548647 41.30763 24.382313 40.107263 C 23.21598 38.90548 22.632457 37.275447 22.632457 35.21717 L 22.632457 21.114096 L 15.426001 21.114096 L 15.426001 18.488603 L 22.632457 18.488603 L 22.632457 12.518674 L 20.98541 10.870207 L 20.98541 9.533 L 25.771988 9.533 L 27.572893 10.458977 L 27.572893 18.488603 L 46.20588 18.437554 L 48.05925 20.290217 L 36.63272 31.716747 C 37.32448 31.441028 38.052734 31.267622 38.794517 31.202 C 40.029626 31.202 41.4193 31.596923 42.96354 32.38606 C 44.5248 33.15818 45.725875 34.222416 46.56606 35.57664 C 47.406956 36.915266 47.94723 38.202133 48.187584 39.43724 C 48.44496 40.67306 48.574 41.77062 48.574 42.73134 C 48.574 44.927875 48.1103 46.96914 47.184324 48.85725 C 46.25764 50.74395 44.850947 52.15064 42.96354 53.077325 C 41.076136 54.00401 39.034165 54.467 36.838337 54.467 Z"
                    fill={color}
                  />
                </svg>
                <h2 style={{ textAlign: "center" }}>OpenLogin</h2>
                <div
                  onClick={handleLogin}
                  className="button"
                  style={{ paddingTop: "6" }}
                >
                  Login
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default Login;
