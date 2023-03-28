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
          <UserWalletInfo address={address} balanceSats={balance.confirmed}/>
          <SDGenerator address={address}/>
        </div>
      ) : (
        <button className="text-current font-bold bg-yellow-300 px-14 py-1.5 mr-6 last:mr-0 transition-all duration-200 ease-in transform hover:shadow-[0_05px_05px_rgba(0,0,0,.5)] hover:-translate-y-1 hover:-translate-x-1 active:shadow-none active:translate-x-0 active:translate-y-0"

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