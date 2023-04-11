import { getAddress, signTransaction } from 'sats-connect';

class XverseProvider {
  constructor(networkType) {
    this.networkType = networkType;
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