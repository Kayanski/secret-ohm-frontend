export async function SuggestLocalChain() {
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
