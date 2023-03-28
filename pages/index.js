import Head from 'next/head'
import Image from "next/image";
import { useEffect, useState } from 'react';

import { FaUser, FaBitcoin } from "react-icons/fa";
import { AiOutlineLoading } from "react-icons/ai";

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

const UserWalletInfo = ({ address, balance_sats }) => {
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

const SDGenerator = ({address}) => {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txid, setTxid] = useState("");

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

  const handleInscribe = async(e) => {
    e.preventDefault();
    setLoading(true);
    console.log(address)

    const response = await fetch("/api/inscribe", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
      },
      body: JSON.stringify({ walletAddress: address, fileBase64: image }),
    });

    const data = await response.json();
    setStatus(data);
    console.log(data)
    console.log(status)
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (

    <main className="flex flex-col justify-center items-center py-16 space-y-6">
      {image ? (
        <div>
          <div className="w-[450px] h-[450px] relative">
            <Image
              src={`data:image/png;base64,${image}`}
              alt="Generated image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow-lg"
            />
          </div>
          <>
          <button
            data-modal-target="defaultModal"
            type="submit"
            onClick={handleInscribe}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Inscribe
          </button>
          {status && isModalOpen ? (
            <div
              id="defaultModal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-50"
            >
              <div
                id="modal-bg"
                className="w-full h-full bg-gray-700 bg-opacity-75 absolute"
              ></div>
              <div className="relative w-full max-w-xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
                <button
                  onClick={closeModal}
                  className="text-gray-200 p-2 absolute top-2 right-2 hover:bg-gray-700 rounded-md"
                >
                  X
                </button>
                <div className="flex flex-col justify-center items-center p-6 ">
                  <p className="text-lg font-semibold leading-none text-white">
                    Request ID: {status.data.id}
                  </p>
                  <div className="w-[250px] h-[250px] relative p-6 m-4">
                    <Image
                      src={`data:image/png;base64,${image}`}
                      alt="Generated image"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg shadow-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white font-semibold bg-orange-500 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    onClick={async () => {
                      try {
                        console.log("pay:",status.data.amount, status.data.segwitAddress )
                        console.log("pay:",typeof status.data.amount, typeof status.data.segwitAddress )
                        //const txid = await window.unisat.sendBitcoin("bc1q0h4crxu0g5ggppz8j55l6dcdkfe6f4xrwzzett", 1000);
                        const txid = await window.unisat.sendBitcoin(status.data.segwitAddress, parseInt(status.data.amount));
                        setTxid(txid);
                      } catch (e) {
                        setTxid(e.message);
                      }
                    }}
                  >
                    Iscribe
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>

        </div>
      ) : (
        <p className="text-lg font-semibold">Enter a prompt to generate an image.</p>
      )}

      {loading ? (
        <div className="flex items-center space-x-2">
          <AiOutlineLoading className="animate-spin text-purple-500" size={24} />
          <p className="text-md font-medium text-purple-500">
            Loading... please wait up to a minute.
          </p>
        </div>
      ) : null}

      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <textarea
            rows="3"
            type="text"
            id="prompt"
            name="prompt"
            placeholder="Enter a prompt"
            required
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border bg-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          />
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              className="px-4 py-2 text-white font-semibold bg-purple-500 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Generate
            </button>
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
