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
import KeplrClient from "./client";
import { getContractFromName } from "./client";
const appInstance = createApp(App);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.use(Notifications);
const keplrOptions = {
  restUrl: "http://testnet.securesecrets.org:1317/",
  chainId: "pulsar-2",
};

appInstance.use(KeplrClient, keplrOptions);
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

appInstance.config.globalProperties.expressSuccess = function (message) {
  notify({
    title: "Transaction réussie",
    text: message,
    type: "success",
    duration: 2000,
    speed: 500,
  });
};

let tokenProperties = {
  tokenName: "OHM",
  sTokenName: "sOHM",
  chainId: "pulsar-2",
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
      name: "sUST-bond",
      id: "sust",
      price: 596.135,
      ROI: 0.052,
      totalPurchased: 46879562.123457,
    },
    {
      icons: ["img/theme/token-img.jpg"],
      name: "sUST-bond",
      id: "sustohmLP",
      price: 596.135,
      ROI: 0.052,
      totalPurchased: 46879562.123457,
    },
  ],
  secretswapTokenLink() {
    return `https://app.secretswap.io/swap?inputCurrency=${this.tokenContractAddress}&outputCurrency=${this.sUSTContractAddress}`;
  },

  async suggestToken(contractAddress) {
    return window.keplr
      .suggestToken(this.chainId, contractAddress)
  },
  async suggestMainToken() {
    let contractAddress = getContractFromName("OHM").contractAddress;
    await this.suggestToken(contractAddress).catch();
  },
  async suggestSToken() {
    let contractAddress = getContractFromName("sOHM").contractAddress;
    await this.suggestToken(contractAddress).catch();
  },

  getBondById(id) {
    return this.bonds.find((element) => element.id === id);
  },

  //Computations
  getRebaseROIfromAPY(apy) {
    return Math.exp(Math.log(1 + apy / 100) / 365 / 3) - 1;
  },
  getAPYfromRebaseROI(roi, rebases) {
    return (1 + roi) ** rebases;
  },
  async getInitialInvestment(options) {
    return options.amount * options.purchasePrice;
  },
  async getRewardsEstimation(options) {
    var rebaseROI = this.getRebaseROIfromAPY(options.apy);
    return (
      options.amount * this.getAPYfromRebaseROI(rebaseROI, 3 * options.nbDays)
    );
  },
  async getPotentialReturn(options) {
    let reward_estimations = await this.getRewardsEstimation(options)
    return (
      reward_estimations * options.futurePrice -
      options.amount * options.purchasePrice
    );
  },
  async getCurrentWealth(options) {
    return options.balance * options.purchasePrice;
  },
  getRebaseReturn() {
    return 0.00715;
  },
};
Object.assign(appInstance.config.globalProperties, tokenProperties);

appInstance.mount("#app");
