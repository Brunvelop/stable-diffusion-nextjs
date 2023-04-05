import { useEffect, useState } from "react";

import Footer from "../components/Footer";
import UserWalletInfo from "../components/UserWalletInfo";
import HeadComponent from "../components/HeadComponent";
import Banner from "../components/Banner";
import SDGenerator from "../components/SDGenerator";
import YellowButton from "../components/YellowButton";
import Gallery from "../components/Gallery";

const Home = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState({
    confirmed: 0,
    unconfirmed: 0,
    total: 0,
  });

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setConnected(true);
      getBasicInfo(window.unisat);
    } else {
      setConnected(false);
    }
  };

  const getBasicInfo = async (unisat) => {
    const [account] = await unisat.getAccounts();
    setAddress(account);

    const balance = await unisat.getBalance();
    setBalance(balance);
  };

  useEffect(() => {
    const unisat = window.unisat;
    if (unisat) {
      unisat.getAccounts().then(handleAccountsChanged);
      unisat.on("accountsChanged", handleAccountsChanged);

      return () => {
        unisat.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <HeadComponent />
      {/* <Banner/> */}
      {connected ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <UserWalletInfo address={address} balanceSats={balance.confirmed} />
          <SDGenerator address={address} />
          <Gallery />
        </div>
      ) : (
        <div className="flex flex-grow items-center justify-center">
          <YellowButton
            onClick={async () => {
              const result = await window.unisat.requestAccounts();
              handleAccountsChanged(result);
            }}
          >
            Connect Wallet
          </YellowButton>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Home;
