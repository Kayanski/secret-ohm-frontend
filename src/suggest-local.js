export async function SuggestLocalChain() {
  let chainId = "enigma-pub-testnet-3";
   await window.keplr.experimentalSuggestChain({
      chainId: chainId,
      chainName: 'Secret Testnet',
      rpc: "http://localhost:1317",
      rest: "http://localhost:1317",
      bip44: {
          coinType: 529,
      },
      coinType: 529,
      stakeCurrency: {
          coinDenom: 'SCRT',
          coinMinimalDenom: 'uscrt',
          coinDecimals: 6,
      },
      bech32Config: {
          bech32PrefixAccAddr: 'secret',
          bech32PrefixAccPub: 'secretpub',
          bech32PrefixValAddr: 'secretvaloper',
          bech32PrefixValPub: 'secretvaloperpub',
          bech32PrefixConsAddr: 'secretvalcons',
          bech32PrefixConsPub: 'secretvalconspub',
      },
      currencies: [
          {
              coinDenom: 'SCRT',
              coinMinimalDenom: 'uscrt',
              coinDecimals: 6,
          },
      ],
      feeCurrencies: [
          {
              coinDenom: 'SCRT',
              coinMinimalDenom: 'uscrt',
              coinDecimals: 6,
          },
      ],
      gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.4,
      },
      features: ['secretwasm'],
  });
  await window.keplr.experimentalSuggestChain({
    chainId: "secretlocal-1",
    chainName: "Local TestNet",
    rpc: "http://localhost:26657",
    rest: "http://localhost:1317",
    bip44: {
      coinType: 118,
    },
    bech32Config: {
      bech32PrefixAccAddr: "secret",
      bech32PrefixAccPub: "secret" + "pub",
      bech32PrefixValAddr: "secret" + "valoper",
      bech32PrefixValPub: "secret" + "valoperpub",
      bech32PrefixConsAddr: "secret" + "valcons",
      bech32PrefixConsPub: "secret" + "valconspub",
    },
    currencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
      },
    ],
    feeCurrencies: [
      {
        coinDenom: "SCRT",
        coinMinimalDenom: "uscrt",
        coinDecimals: 6,
        coinGeckoId: "secret",
      },
    ],
    stakeCurrency: {
      coinDenom: "SCRT",
      coinMinimalDenom: "uscrt",
      coinDecimals: 6,
      coinGeckoId: "secret",
    },
    coinType: 118,
    gasPriceStep: {
      low: 0.01,
      average: 0.025,
      high: 0.03,
    },
  });
}
