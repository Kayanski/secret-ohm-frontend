/*!

=========================================================
* Vue Argon Dashboard - v2.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/vue-argon-dashboard
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/vue-argon-dashboard/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ArgonDashboard from "./plugins/argon-dashboard";
import "element-plus/lib/theme-chalk/index.css";
import "@popperjs/core";
import Notifications from "@kyvg/vue3-notification";
import { notify } from "@kyvg/vue3-notification";
import TokenStore from "./token-store";
import { SuggestLocalChain } from "./suggest-local";
const appInstance = createApp(App);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.use(Notifications);
/* Global variables */

appInstance.config.globalProperties.catchError = function (actionTaken, error) {
  let readableText = "Error when " + actionTaken;
  console.log(readableText + " : \n" + error);
  notify({
    title: readableText,
    text: error,
    type: "error",
    duration: -1,
    speed: 1000,
  });
  //errorMessage(actionTaken);
};

let tokenProperties = {
  tokenName: "OHM",
  chainId: "secret-4",
  tokenContractAddress: "secret15l9cqgz5uezgydrglaak5ahfac69kmx2qpd6xt",
  sTokenContractAddress: "secret1h0tn05w9cjtsz9stccq2xl5rha2fxl0n2d765t",
  sUSTContractAddress: "secret129h4vu66y3gry6wzwa24rw0vtqjyn8tujuwtn9",
  tokenPrice: 978.7987,
  tokenPriceText() {
    return this.tokenName + " price";
  },
  bonds: [
    {
      icons: ["img/theme/token-img.jpg", "img/theme/token-img.jpg"],
      name: "sUST",
      id: "sust",
      price: 596.135,
      ROI: 0.052,
      totalPurchased: 46879562.123457,
    },
    {
      icons: ["img/theme/token-img.jpg"],
      name: "sUST-OHM LP",
      id: "sustohmLP",
      price: 596.135,
      ROI: 0.052,
      totalPurchased: 46879562.123457,
    },
  ],
  connectKeplr() {
    if (!window.keplr) {
      alert("Please use install keplr extension");
    } else {
      SuggestLocalChain();
      // Enabling before using the Keplr is recommended.
      // This method will ask the user whether to allow access if they haven't visited this website.
      // Also, it will request that the user unlock the wallet if the wallet is locked.
      window.keplr.enable(this.chainId);

      const offlineSigner = window.keplr.getOfflineSigner(this.chainId);

      // You can get the address/public keys by `getAccounts` method.
      // It can return the array of address/public key.
      // But, currently, Keplr extension manages only one address/public key pair.
      // XXX: This line is needed to set the sender address for SigningCosmosClient.
      offlineSigner
        .getAccounts()
        .then((accounts) => {
          console.log(accounts[0].address);
          TokenStore.userAddress = accounts[0].address;
          TokenStore.keplrConnected = true;
        })
        .catch(console.log);

      //Suggest the token when clicking on the add Token button

      // Initialize the gaia api with the offline signer that is injected by Keplr extension.
      /*
        const cosmJS = new SigningCosmWasmClient(
            "https://lcd-cosmoshub.keplr.app",
            accounts[0].address,
            offlineSigner,
        );
        */
    }
  },
  addressText(address) {
    return (
      address.substring(0, 6) + "..." + address.substring(address.length - 3)
    );
  },
  secretswapTokenLink() {
    return `https://app.secretswap.io/swap?inputCurrency=${this.tokenContractAddress}&outputCurrency=${this.sUSTContractAddress}`;
  },

  suggestToken(contractAddress, tokenName) {
    window.keplr
      .suggestToken(this.chainId, contractAddress)
      .then((result) => {
        console.log(result);
        notify({
          title: tokenName + " successfully addded",
          type: "success",
          duration: 2000,
          speed: 500,
        });
      })
      .catch((error) => this.catchError("adding " + tokenName, error));
  },
  suggestMainToken() {
    this.suggestToken(this.tokenContractAddress, this.tokenName);
  },
  suggestSToken() {
    this.suggestToken(this.sTokenContractAddress, "s" + this.tokenName);
  },
  formatNumber(number, decimals) {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },
  formatDollars(number, decimals) {
    return number.toLocaleString(undefined, {
      currency: "USD",
      style: "currency",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  },
  /* helpers to get infos from the blockchain */

  getPendingRewards() {
    return this.formatNumber(0.0, 5) + " OHM";
  },
  /*
  getBondPrice(bondName) {
    bondName;
    return this.formatDollars(1465.3,1);
  },
  */
  getTokenPriceInUSDValue(address) {
    address;
    return 379.65;
  },
  getTokenPriceInUSD(address) {
    return this.formatDollars(this.getTokenPriceInUSDValue(address), 1);
  },
  getBondById(id) {
    return this.bonds.find((element) => element.id === id);
  },
  getUserBalance(address) {
    address;
    return 1;
  },
  getRebaseROIfromAPY(apy) {
    return Math.exp(Math.log(1 + apy / 100) / 365 / 3) - 1;
  },
  getAPYfromRebaseROI(roi, rebases) {
    return (1 + roi) ** rebases;
  },
  getRewardsEstimation(options) {
    var rebaseROI = this.getRebaseROIfromAPY(options.apy);
    return (
      options.amount * this.getAPYfromRebaseROI(rebaseROI, 3 * options.nbDays)
    );
  },
  getRebaseReturn() {
    return 0.00715;
  },
  getAPY() {
    return this.getAPYfromRebaseROI(this.getRebaseReturn(), 3 * 365) * 100;
  },
};
Object.assign(appInstance.config.globalProperties, tokenProperties);

appInstance.mount("#app");
