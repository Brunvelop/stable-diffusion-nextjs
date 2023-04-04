import React, { useCallback, useState, useEffect } from 'react';
import { getAddress, signTransaction } from 'sats-connect';
import * as btc from 'micro-btc-signer';
import { hex, base64 } from '@scure/base';
import axios from "axios";

const TESTNET = true;

const API_URL = TESTNET
  ? 'https://blockstream.info/testnet/api'
  : 'https://blockstream.info/api';

const MEMPOOL_API_URL = TESTNET
  ? 'https://mempool.space/testnet/api'
  : 'https://mempool.space/api';

const BITCOIN_NETWORK = {
  bech32: TESTNET ? 'tb' : 'bc',
  pubKeyHash: TESTNET ? 0x6f : 0x00,
  scriptHash: TESTNET ? 0xc4 : 0x05,
  wif: TESTNET ? 0xef : 0x80,
};

async function getUnspentOutputs(address) {
  try {
    const url = `${API_URL}/address/${address}/utxo`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    return [];
  }
}

async function getAddressUtxos(address) {
  const url = `${MEMPOOL_API_URL}/address/${address}/utxo`;
  const response = await axios.get(url);
  return response.data;
}

async function doesUtxoContainInscription(utxo) {
  const html = await fetch(`https://ordinals.com/output/${utxo.txid}:${utxo.vout}`)
    .then(response => response.text());

  return html.match(/class=thumbnails/) !== null;
}

async function selectUtxos(utxos, amount) {
  const selectedUtxos = [];
  let selectedAmount = 0;

  for (const utxo of utxos) {
    if (await doesUtxoContainInscription(utxo)) {
      continue;
    }
    selectedUtxos.push(utxo);
    selectedAmount += utxo.value;
    
    if (selectedAmount >= amount) {
      break;
    }
  }
  

  if (selectedAmount < amount) {
    throw new Error(`Not enough spendable funds.
Address has:  ${satToBtc(selectedAmount)} BTC
Needed:          ${satToBtc(amount)} BTC

UTXOs:
${utxos.map(x => `${x.txid}:${x.vout}`).join("\n")}`);
  }

  return selectedUtxos;
}

async function createPstb(userAddress, userPublicKey) {
  const utxos = await getUnspentOutputs(userAddress);
  const selectedUtxos = await selectUtxos(utxos, 1000);

  const publicKey = hex.decode(userPublicKey);
  const p2wpkh = btc.p2wpkh(publicKey, BITCOIN_NETWORK);
  const p2sh = btc.p2sh(p2wpkh, BITCOIN_NETWORK);

  const tx = new btc.Transaction(BITCOIN_NETWORK);

  selectedUtxos.forEach(utxo => {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.vout,
      witnessUtxo: {
        script: p2sh.script,
        amount: BigInt(utxo.value),
      },
      redeemScript: p2sh.redeemScript,
    });
  });

  // Add outputs
  const recipient = "tb1qvxsq3fs30hxmul5rycnflfj30kwjygw8r7qmh6";
  const changeAddress = userAddress;

  tx.addOutputAddress(recipient, BigInt(200), BITCOIN_NETWORK);
  tx.addOutputAddress(recipient, BigInt(100), BITCOIN_NETWORK);
  tx.addOutputAddress(changeAddress, BigInt(500), BITCOIN_NETWORK);

  // Generate the base64-encoded PSBT that can be
  // passed to a compatible wallet for signing
  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);
  return psbtB64;
}

export default function Xverse() {
  const [userAddress, setUserAddress] = useState('');
  const [publicKey, setPublicKey] = useState('');

  useEffect(() => {
    console.log('User address:', userAddress);
    console.log('Public key:', publicKey);
  }, [userAddress, publicKey]);

  const getAddressOptions = {
    payload: {
      purposes: ['ordinals', 'payment'],
      message: 'Address for receiving Ordinals and payments',
      network: {
        type: 'Testnet',
      },
    },
    onFinish: (response) => {
      setUserAddress(response.addresses[1].address);
      setPublicKey(response.addresses[1].publicKey);
    },
    onCancel: () => alert('Request canceled'),
  };

  const handleConnectButtonClick = useCallback(async () => {
    await getAddress(getAddressOptions);
  }, []);

  const handleSignTransactionButtonClick = useCallback(async () => {
    const psbtBase64 = await createPstb(userAddress, publicKey);
    console.log('psbtBase64', psbtBase64);

    const signTransactionOptions = {
      payload: {
        network: {
          type: 'Testnet',
        },
        message: 'Sign Transaction',
        psbtBase64,
        broadcast: true,
        inputsToSign: [
          {
            address: userAddress,
            signingIndexes: [0],
          },
        ],
      },
      onFinish: (response) => {
        console.log(response.txid);
      },
      onCancel: () => alert('Transaction signing canceled'),
    };

    await signTransaction(signTransactionOptions);
  }, [userAddress, publicKey]);

  return (
    <div className="inset-0 flex items-center justify-center m-20">
      <button
        onClick={handleConnectButtonClick}
        className="ml-4 p-2 bg-blue-500 text-white rounded"
      >
        Connect
      </button>
      <button
        onClick={handleSignTransactionButtonClick}
        className="ml-4 p-2 bg-green-500 text-white rounded"
      >
        Sign & Send Transaction
      </button>
    </div>
  );
}
