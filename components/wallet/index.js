import * as btc from 'micro-btc-signer';
import { hex, base64 } from '@scure/base';

import XverseProvider from "./XverseProvider";

const TESTNET = false
const BITCOIN_NETWORK = {
  bech32: TESTNET ? 'tb' : 'bc',
  pubKeyHash: TESTNET ? 0x6f : 0x00,
  scriptHash: TESTNET ? 0xc4 : 0x05,
  wif: TESTNET ? 0xef : 0x80,
};

const REQUIRED_AMOUNT = 1000;
const RECIPIENT_ADDRESS = '3CC6YshMasfP2Z8GoBUFig1wH6V1a6rgno';

class Wallet {
  constructor(walletProvider) {
    this.provider = walletProvider;
    this.paymentAddress = ''
    this.receivingAddress = ''
    this.balance = 0
    this.paymentPublicKey = ''
    this.receivingPublicKey = ''
  }

  async getInfo() {
    const accounts = await this.provider.getAccounts();

    const paymentAccount = accounts.find((account) => account.purpose === 'payment');
    const receivingAccount = accounts.find((account) => account.purpose === 'ordinals');

    const paymentAddress = paymentAccount?.address;
    const receivingAddress = receivingAccount?.address;
    const balance = await this.getBalance(paymentAddress);
    const paymentPublicKey = paymentAccount?.publicKey;
    const receivingPublicKey = receivingAccount?.publicKey;

    this.paymentAddress = paymentAddress
    this.receivingAddress = receivingAddress
    this.balance = balance
    this.paymentPublicKey = paymentPublicKey
    this.receivingPublicKey = receivingPublicKey

    return {
      paymentAddress,
      receivingAddress,
      balance,
      paymentPublicKey,
      receivingPublicKey,
    };
  }

  async getBalance(paymentAddress) {
    if (typeof this.provider.getBalance === 'function') {
      return this.provider.getBalance(paymentAddress);
    } else {
      return this.getBalanceAPI(paymentAddress);
    }
  }

  async getBalanceAPI(paymentAddress) {
    if (!paymentAddress) {
      throw new Error('Payment address not found');
    }

    const utxos = await this.getUTXOs(paymentAddress);
    const balance = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

    return balance;
  }

  async getUTXOs(address) {
    const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async createPstb(userAddress, userPublicKey, generativeAddress, generativeAmount) {
    const utxos = await this.getUTXOs(userAddress);
    let selectedUtxos = [];
    if (!(this.provider instanceof XverseProvider)) {
      selectedUtxos = await this.selectUtxos(userAddress, utxos, REQUIRED_AMOUNT);
    } else {
      selectedUtxos = utxos
    }
    console.log('utxos:', utxos);
    console.log('selectedUtxos:', selectedUtxos);

    const { psbtB64, utxoCount } = this.createTransaction(userAddress, userPublicKey, generativeAddress, generativeAmount, selectedUtxos);
    return { psbtB64, utxoCount };
  }

  createTransaction(userAddress, userPublicKey, generativeAddress, generativeAmount, selectedUtxos) {
    const publicKey = hex.decode(userPublicKey);
    const p2wpkh = btc.p2wpkh(publicKey, BITCOIN_NETWORK);
    const p2sh = btc.p2sh(p2wpkh, BITCOIN_NETWORK);

    const tx = new btc.Transaction(BITCOIN_NETWORK);

    selectedUtxos.forEach((utxo) => {
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
    const changeAddress = userAddress;
    const transactionFee = 3000; // Ajusta este valor según sea necesario
    const totalUtxoValue = selectedUtxos.reduce((acc, utxo) => acc + utxo.value, 0);
    const changeAmount = totalUtxoValue - generativeAmount - REQUIRED_AMOUNT - transactionFee;

    tx.addOutputAddress(generativeAddress, BigInt(generativeAmount), BITCOIN_NETWORK);
    tx.addOutputAddress(RECIPIENT_ADDRESS, BigInt(REQUIRED_AMOUNT), BITCOIN_NETWORK);
    tx.addOutputAddress(changeAddress, BigInt(changeAmount), BITCOIN_NETWORK);


    // Generate the base64-encoded PSBT that can be
    // passed to a compatible wallet for signing
    const psbt = tx.toPSBT(0);
    const psbtB64 = base64.encode(psbt);
    const utxoCount = selectedUtxos.length;
    return { psbtB64, utxoCount };
  }
}

export default Wallet;