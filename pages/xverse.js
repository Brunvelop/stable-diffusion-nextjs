import React, { useCallback, useState, useEffect } from 'react';
import { getAddress, signTransaction } from 'sats-connect';
import * as btc from 'micro-btc-signer';
import { hex, base64 } from '@scure/base';
import axios from "axios";

// Function to get unspent outputs for a given address
async function getUnspentOutputs(address) {
  try {
    const response = await axios.get(`https://blockstream.info/testnet/api/address/${address}/utxo`);
    return response.data;
  } catch (error) {
    console.error('Error fetching UTXOs:', error);
    return [];
  }
}

// Function to create a PSBT for a given user address and public key
async function createPstb(userAddress, userPublicKey)  {
  const bitcoinTestnet = {
    bech32: 'tb',
    pubKeyHash: 0x6f,
    scriptHash: 0xc4,
    wif: 0xef,
  };

  // Replace this with the address for which you want to get UTXOs
  const utxos = await getUnspentOutputs(userAddress);
  console.log('UTXOs:', utxos);

  // You can use any public Bitcoin API to get the unspent outputs
  const output = {
    tx_hash: utxos[0].txid,
    tx_output_n: utxos[0].vout,
    value: utxos[0].value,
  };
  console.log('Output:', output);

  const publicKey = hex.decode(userPublicKey);
  const p2wpkh = btc.p2wpkh(publicKey, bitcoinTestnet);
  const p2sh = btc.p2sh(p2wpkh, bitcoinTestnet);

  const tx = new btc.Transaction(bitcoinTestnet);

  tx.addInput({
    txid: output.tx_hash,
    index: output.tx_output_n,
    witnessUtxo: {
      script: p2sh.script,
      amount: BigInt(output.value),
    },
    redeemScript: p2sh.redeemScript,
  });

  // add more inputs here if needed
  // Add outputs
  const recipient = "tb1qvxsq3fs30hxmul5rycnflfj30kwjygw8r7qmh6";
  const changeAddress = userAddress;

  tx.addOutputAddress(recipient, BigInt(200), bitcoinTestnet);
  tx.addOutputAddress(recipient, BigInt(100), bitcoinTestnet);
  tx.addOutputAddress(changeAddress, BigInt(1500), bitcoinTestnet);

  // Generate the base64-encoded PSBT that can be
  // passed to a compatible wallet for signing
  const psbt = tx.toPSBT(0);
  const psbtB64 = base64.encode(psbt);
  return psbtB64
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
      console.log(response);
      setUserAddress(response.addresses[1].address);
      setPublicKey(response.addresses[1].publicKey)
    },
    onCancel: () => alert('Request canceled'),
  };

  const handleConnectButtonClick = useCallback(async () => {
    await getAddress(getAddressOptions);
  }, []);
    
  const handleSignTransactionButtonClick = useCallback(async () => {
    // Build the PSBT using a suitable Bitcoin library (e.g. bitcoinjs-lib)
    // Make sure to include the destination addresses and desired amounts.
    const psbtBase64 = await createPstb(userAddress, publicKey); // The base64-encoded PSBT
    console.log('psbtBase64', psbtBase64)
    console.log('User addrs', userAddress)

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
              // Make sure to provide the correct address
              // and signing indices for the user's address in the transaction
              address: userAddress, // Replace with the user's address
              signingIndexes: [0], // Change as needed
            },
          ],
        },
        onFinish: (response) => {
          console.log(response.txid); // Show the TXID of the transmitted transaction
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