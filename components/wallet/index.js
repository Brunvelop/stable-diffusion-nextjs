import * as btc from 'micro-btc-signer';
import { hex, base64 } from '@scure/base';

const TESTNET = false
const BITCOIN_NETWORK = {
  bech32: TESTNET ? 'tb' : 'bc',
  pubKeyHash: TESTNET ? 0x6f : 0x00,
  scriptHash: TESTNET ? 0xc4 : 0x05,
  wif: TESTNET ? 0xef : 0x80,
};


const RECIPIENT_ADDRESS = process.env.NEXT_PUBLIC_RECIPIENT_ADDRESS;
const TOTAL_COST = parseInt(process.env.NEXT_PUBLIC_TOTAL_COST);
const EXTRA_COST = parseInt(process.env.NEXT_PUBLIC_EXTRA_COST);

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
    const info = await this.provider.getInfo();

    this.paymentAddress = info.paymentAddress;
    this.receivingAddress = info.receivingAddress;
    this.balance = info.balance;
    this.paymentPublicKey = info.paymentPublicKey;
    this.receivingPublicKey = info.receivingPublicKey;

    return {
      paymentAddress: info.paymentAddress,
      receivingAddress: info.receivingAddress,
      balance: info.balance,
      paymentPublicKey: info.paymentPublicKey,
      receivingPublicKey: info.receivingPublicKey,
    };
  }

  async createPstb(userAddress, userPublicKey, generativeAddress, generativeAmount) {
    const utxos = await this.provider.getUTXOs(userAddress);
    const selectedUtxos = await this.provider.selectUtxos(utxos, generativeAmount+EXTRA_COST); //TOTAL_COST

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
    const transactionFee = 5000;
    const totalUtxoValue = selectedUtxos.reduce((acc, utxo) => acc + utxo.value, 0);
    const changeAmount = totalUtxoValue - generativeAmount - EXTRA_COST - transactionFee;
    
    //const changeAmount = totalUtxoValue - TOTAL_COST;
    //const REQUIRED_AMOUNT = TOTAL_COST - generativeAmount - transactionFee;
    
    tx.addOutputAddress(generativeAddress, BigInt(generativeAmount), BITCOIN_NETWORK);
    tx.addOutputAddress(RECIPIENT_ADDRESS, BigInt(EXTRA_COST), BITCOIN_NETWORK); //EXTRA_COST -> REQUIRED_AMOUNT
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