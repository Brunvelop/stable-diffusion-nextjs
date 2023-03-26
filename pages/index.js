import Head from 'next/head'
import Image from "next/image";
import { useEffect, useState } from 'react';

import { FaUser, FaBitcoin } from "react-icons/fa";


const HeadComponent = () => {
  return (
    <Head>
      <title>Typeart</title>
      <meta name="description" content="Stable Diffusion Bitcoin" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};

const Banner = () => {
  return (
    <div className="w-full absolute top-0 text-center font-medium">
      <p>🚨 Attention: Due to high traffic, our servers may have slower performance.</p>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 text-center font-medium py-4">
      <a
        href="https://www.banana.dev/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Socials: {' '}
        <span>
          <Image src="/banana.svg" alt="Banana Logo" width={72} height={16} />
        </span>
      </a>
    </footer>
  );
};

const UserWalletInfo = (props) => {
  const { address, balance_sats } = props;
  return (
    <div className="fixed top-0 right-0 p-4 flex items-start space-x-2">
      <div className="flex flex-col items-start space-y-1">
        <div className="flex items-center space-x-1">
          <FaUser className="text-green-500" />
          <span className="text-sm font-semibold">{`${address.slice(0, 6)}...${address.slice(-4)}`}</span>
        </div>
        <div className="flex items-center space-x-1">
          <FaBitcoin className="text-yellow-500" />
          <span className="text-sm font-semibold">{balance_sats/100000000}</span>
        </div>
      </div>
    </div>
  );
};

const SDGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async(e) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/diffusion", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt }),
    });

    const data = await response.json();
    setLoading(false);
    setImage(data.modelOutputs[0].image_base64);
  };

  return (
    <main className="flex flex-col justify-center items-center py-16">

      {image ? <div ><Image src = {`data:image/png;base64,${image}`} alt = "Generated image" layout = "fill" objectFit = "cover"></Image> </div> 
      : <p > Enter a prompt to generate an image. </p>}

      {loading ? <p>Loading... please wait up to a minute.</p> : null}

      <div>
        <form onSubmit = {handleSubmit}>
          <textarea 
            rows = "3"
            type="text" 
            id="prompt" 
            name="prompt" 
            placeholder = "Enter a prompt" 
            required 
            value = {prompt} 
            onChange = {e => setPrompt(e.target.value)} 
            />
          <div>
            <button type = "submit">Generate</button>
          </div>
        </form>
      </div>
    </main>
  );
};

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
          <UserWalletInfo address={address} balance_sats={balance.total}/>
          <SDGenerator/>
        </div>
      ) : (
        <button className="rounded-xl bg-gradient-to-br from-[#6025F5] to-[#FF5555] px-5 py-3 text-base font-medium text-white transition duration-200 hover:shadow-lg hover:shadow-[#6025F5]/50"

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
