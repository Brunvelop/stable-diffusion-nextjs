import { useEffect, useState } from 'react';

import Footer from "../components/Footer";
import UserWalletInfo from "../components/UserWalletInfo";
import HeadComponent from "../components/HeadComponent";
import Banner from "../components/Banner";
import SDGenerator from "../components/SDGenerator";

const Home = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState({ confirmed: 0, unconfirmed: 0, total: 0 });

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
      unisat.on('accountsChanged', handleAccountsChanged);
  
      return () => {
        unisat.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);


  return (
    <div className="flex items-center justify-center h-screen">
      <HeadComponent/>
      {/* <Banner/> */}
      {connected ? (
        <div className="flex items-center justify-center h-screen">
          <UserWalletInfo address={address} balance_sats={balance.confirmed}/>
          <SDGenerator address={address}/>
        </div>
      ) : (
        <button className="rounded-xl bg-purple-500 px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-[#6025F5]/50"

          onClick={async () => {
            const result = await window.unisat.requestAccounts();
            handleAccountsChanged(result);
          }}
        >
          Connect Wallet
        </button>
      )}
      <Footer/>
    </div>
  )
}

export default Home;
