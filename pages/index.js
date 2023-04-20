import { useEffect, useState, useMemo, useCallback } from 'react';
import va from '@vercel/analytics';

import Footer from "../components/Footer";
import UserWalletInfo from "../components/UserWalletInfo";
import HeadComponent from "../components/HeadComponent";
import Banner from "../components/Banner";
import SDGenerator from "../components/SDGenerator";
import YellowButton from '../components/YellowButton';
import Wallet from "../components/wallet";
import XverseProvider from "../components/wallet/XverseProvider";
import Gallery from "../components/Gallery";

const Home = () => {
  const [connected, setConnected] = useState(false);
  const [reciveAddress, setReciveAddress] = useState('');
  const [paymentAddress, setPaymentAddress] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [balance, setBalance] = useState({ confirmed: 0 });

  const xverseProvider = useMemo(() => new XverseProvider('Mainnet'), []);
  const wallet = useMemo(() => new Wallet(xverseProvider), [xverseProvider]);

  const handleConnectWallet = useCallback(async () => {
    setConnecting(true);
    try {
      const info = await wallet.getInfo();
      setPaymentAddress(info.paymentAddress);
      setReciveAddress(info.receivingAddress);
      setBalance({ confirmed: info.balance });
      setConnected(true);
      va.track('wallet connected', info.paymentAddress)
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  }, [wallet]);
  
  return (
    <div className="flex flex-col items-center min-h-screen">
      <HeadComponent />
      {connected ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <UserWalletInfo address={paymentAddress} balanceSats={balance.confirmed} />
          <SDGenerator address={reciveAddress} wallet={wallet}/>
          <Gallery/>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="m-20">
          <YellowButton onClick={handleConnectWallet} disabled={connecting}>
            {connecting ? 'Connecting...' : 'Connect Xverse'}
          </YellowButton>
          </div>
          <Gallery/>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Home;