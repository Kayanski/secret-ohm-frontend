export async function SuggestLocalChain() {
  let chainId = "pulsar-2";
  //let chainId = "enigma-pub-testnet-3";
  await window.keplr
    .experimentalSuggestChain({
      chainId: chainId,

      chainName: "Secret Testnet",
      //rpc: "http://rpc.pulsar.griptapejs.com/",
      //rest: "http://testnet.securesecrets.org:1317/",
      rpc: "https://api.ovaldao.space/rpc/",
      rest: "https://api.ovaldao.space:80",

      /*
      chainName: "Local Testnet",
      rpc: "http://localhost:26656",
      rest: "http://localhost:1337",
       */
      bip44: {
        coinType: 529,
      },
      coinType: 529,
      stakeCurrency: {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
      },
      bech32Config: {
        bech32PrefixAccAddr: "secret",
        bech32PrefixAccPub: "secretpub",
        bech32PrefixValAddr: "secretvaloper",
        bech32PrefixValPub: "secretvaloperpub",
        bech32PrefixConsAddr: "secretvalcons",
        bech32PrefixConsPub: "secretvalconspub",
      },
      currencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
        },
      ],
      feeCurrencies: [
        {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
        },
      ],
      gasPriceStep: {
        low: 0.1,
        average: 0.25,
        high: 0.4,
      },
      features: ["secretwasm"],
    })
    .catch((error) =>
      console.log("Error when trying to add the LocalChain " + error)
    );
}
