import { getAddress, signTransaction } from 'sats-connect';

class XverseProvider {
  constructor(networkType) {
    this.networkType = networkType;
  }

  async getInfo() {
    const accounts = await this.getAccounts();

    const paymentAccount = accounts.find((account) => account.purpose === 'payment');
    const receivingAccount = accounts.find((account) => account.purpose === 'ordinals');

    const paymentAddress = paymentAccount?.address;
    const receivingAddress = receivingAccount?.address;
    const balance = await this.getBalance(paymentAddress);
    const paymentPublicKey = paymentAccount?.publicKey;
    const receivingPublicKey = receivingAccount?.publicKey;

    return {
      paymentAddress,
      receivingAddress,
      balance,
      paymentPublicKey,
      receivingPublicKey,
    };
  }

  async getBalance(paymentAddress) {
    if (!paymentAddress) {
      throw new Error('Payment address not found');
    }

    const utxos = await this.getUTXOs(paymentAddress);
    const balance = utxos.reduce((acc, utxo) => acc + utxo.value, 0);

    return balance;
  }

  async getAccounts() {
    return new Promise((resolve, reject) => {
      let didFinish = false;
  
      const handleFinish = (response) => {
        didFinish = true;
        resolve(response.addresses);
      };
  
      const handleCancel = () => {
        if (!didFinish) {
          reject(new Error('Request canceled'));
        }
      };
  
      const getAddressOptions = {
        payload: {
          purposes: ['ordinals', 'payment'],
          message: 'Address for receiving Ordinals and payments',
          network: {
            type: this.networkType,
          },
        },
        onFinish: handleFinish,
        onCancel: handleCancel,
      };
  
      getAddress(getAddressOptions);
    });
  }

  async getUTXOs(address) {
    const response = await fetch(`https://mempool.space/api/address/${address}/utxo`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async selectUtxos(utxos, targetAmount) {
    let selectedUtxos = [];
    let selectedAmount = 0;

    console.log("utxos",utxos)

    for (const utxo of utxos) {
      if (selectedAmount < targetAmount) {
        selectedUtxos.push(utxo);
        selectedAmount += utxo.value;
      } else {
        break;
      }
    }

    if (selectedAmount < targetAmount) {
      throw new Error('Insufficient UTXOs to cover target amount');
    }

    return selectedUtxos;
  }

  async signPsbt(psbtBase64, userAddress, signingIndexes) {
    return new Promise((resolve, reject) => {
      const signPsbtOptions = {
        payload: {
          network: {
            type: this.networkType,
          },
          message: 'Sign Transaction',
          psbtBase64,
          broadcast: true,
          inputsToSign: [
            {
              address: userAddress,
              signingIndexes: signingIndexes,
            },
          ],
        },
        onFinish: (response) => {
          resolve(response);
        },
        onCancel: () => reject(new Error('Transaction signing canceled')),
      };

      signTransaction(signPsbtOptions);
    });
  }
}

export default XverseProvider;