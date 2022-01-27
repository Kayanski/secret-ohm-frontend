<template>
  <span
    v-if="type == 'private' && viewingKey == null"
    class="view-balance-button"
    @click="addViewingKey"
  >
    🔍 {{ placeHolder }}
  </span>
  <span
    :class="[options.specialTextClass, 'info-text']"
    v-else-if="infoText != null"
  >
    {{ infoText }}
  </span>

  <span v-else class="info-not-arrived"> </span>
</template>

<script>
import * as KeplrClient from "@/client";
import * as Format from "@/formatHelper";

export default {
  name: "info-field",
  data() {
    return {
      infoText: undefined,
      viewingKey: null,
      contract: undefined,
      type: "public",
      placeHolder: undefined,
      optionsWatch: false,
    };
  },
  props: {
    infoId: {
      type: String,
      description: "Promise of the query of the info",
      default: undefined,
    },
    options: {
      type: Object,
      description: "Optional arguments to the query",
      default: () => {
        return {};
      },
    },
  },
  async mounted() {
    this.$nextTick(async function () {
      // Code that will run only after the
      // entire view has been rendered
      this.updateText();
      if (this.type == "private") {
        // For private info, we test if there is a viewing key stored
        this.contract = KeplrClient.getContractFromName(
          this.options.contractName
        );
        let keplr = await KeplrClient.getKeplr();
        keplr
          .getSecret20ViewingKey(this.chainId, this.contract.contractAddress)
          .then(() => (this.viewingKey = true))
          .catch(() => console.log("Error fetching viewingKey"));
      }
    });
  },
  watch: {
    viewingKey: function () {
      this.updateText();
    },
    options: function () {
      if (this.optionsWatch) {
        this.updateText();
        console.log("options changed");
      }
    },
  },
  methods: {
    addViewingKey() {
      let contract = KeplrClient.getContractFromName(this.options.contractName);
      this.suggestToken(contract.contractAddress)
        .then(() => {
          this.expressSuccess(
            this.options.contractName + " successfully addded"
          );
          this.viewingKey = true;
        })
        .catch((error) =>
          this.catchError(
            "creating a ViewingKey for " + this.options.contractName,
            error
          )
        );
    },
    updateText() {
      let infoTextPromise = undefined;
      switch (this.infoId) {
        //General Info
        case "token-price":
          infoTextPromise = KeplrClient.getTokenPriceInUSD(
            this.options.tokenName
          );
          break;
        case "treasury-balance":
          infoTextPromise = KeplrClient.getTotalTreasuryReserves();
          break;
        case "market-cap":
          infoTextPromise = KeplrClient.getTotalSupplyInUSD(this.tokenName);
          break;
        case "circulating-supply-total":
          infoTextPromise = KeplrClient.getStakedCirculatingSupply();
          break;
        case "backing-per-token":
          infoTextPromise = KeplrClient.backingPerToken();
          break;
        case "current-index":
          infoTextPromise = KeplrClient.getCurrentIndex();
          break;

        //Bond Info
        case "bond-you-will-get":
          infoTextPromise = KeplrClient.bondYouWillGet(
            this.options.bondName,
            this.options.amount
          );
          this.optionsWatch = true;
          break;
        // User specific, Will have to do a special container for that (with secret keys)

        case "pending-rewards":
          infoTextPromise = KeplrClient.getPendingPayout(this.options.bondName);
          this.type = "private";
          this.placeHolder = "View Rewards";
          break;
        case "claimable-rewards":
          infoTextPromise = KeplrClient.getClaimablePayout(
            this.options.bondName
          );
          this.type = "private";
          this.placeHolder = "View Payout";
          break;

        case "bond-time-remaining":
          infoTextPromise = KeplrClient.getBondTimeRemaining(
            this.options.bondName
          );
          this.type = "private";
          this.placeHolder = "View Time Remaining";
          break;

        case "bond-purchased":
          infoTextPromise = KeplrClient.getBondPurchased(this.options.bondName);
          break;
        case "max-you-can-buy-bond":
          infoTextPromise = KeplrClient.bondMaxYouCanBuy(this.options.bondName);
          break;
        case "bond-roi":
          infoTextPromise = KeplrClient.getBondROI(this.options.bondName);
          break;
        case "bond-debt-ratio":
          infoTextPromise = KeplrClient.getBondDebtRatio(this.options.bondName);
          break;

        case "bond-vesting-term":
          infoTextPromise = KeplrClient.getBondVestingTerm(
            this.options.bondName
          );
          break;
        case "bond-price":
          infoTextPromise = KeplrClient.getBondPrice(this.options.bondName);
          break;

        //Stake Info
        case "apy":
          infoTextPromise = KeplrClient.getAPY();
          break;
        case "total-value-deposited":
          infoTextPromise = KeplrClient.getTotalValueDeposited();
          break;

        case "time-till-next-rebase":
          infoTextPromise = KeplrClient.timeTillNextRebase();
          break;

        //User Info
        case "token-balance":
          infoTextPromise = KeplrClient.getBalance(this.options.contractName);
          this.type = "private";
          this.placeHolder = "View Balance";
          break;
        //User sepcific queries, needs viewing keys
        case "next-reward-amount":
          infoTextPromise = KeplrClient.getNextRewardAmount();
          this.type = "private";
          this.placeHolder = "View Staking Info";
          break;

        case "next-reward-yield":
          infoTextPromise = KeplrClient.getRebaseAmount();
          break;

        case "staking-roi":
          infoTextPromise = KeplrClient.getAPY(KeplrClient.rebasesPerDay * 5);
          break;

        //Calculator Info
        case "initial-investment":
          infoTextPromise = this.getInitialInvestment(this.options);
          this.optionsWatch = true;
          break;
        case "rewards-estimation":
          infoTextPromise = this.getRewardsEstimation(this.options);
          this.optionsWatch = true;
          break;

        case "potential-return":
          infoTextPromise = this.getPotentialReturn(this.options);
          this.optionsWatch = true;
          break;
        case "current-wealth":
          infoTextPromise = KeplrClient.getCurrentWealth(this.options);
          this.optionsWatch = true;
          break;
        default:
          console.log(this.infoId + " not registered as info");
          break;
      }
      if (infoTextPromise) {
        console.log(this.infoId, infoTextPromise);
        infoTextPromise
          .then((result) => {
            this.infoText = this.format(result);
            this.infoValue = result;
            this.$emit("valueAvailable", {
              type: this.infoId,
              options: this.options,
              text: infoTextPromise,
              value: this.infoValue,
            });
          })
          .catch((error) => console.log("Smooth Error Handling", error));
      } else {
        this.infoText = null;
      }
    },
    format(result) {
      switch (this.infoId) {
        case "token-price":
          return Format.formatDollars(result, 2);
        case "treasury-balance":
          return Format.formatDollars(result, 0);
        case "market-cap":
          return Format.formatDollars(result, 0);
        case "circulating-supply-total":
          return Format.formatToken(result, 2, this.tokenName);
        case "backing-per-token":
          return Format.formatDollars(result, 2);
        case "current-index":
          return Format.formatNumber(result, 2);

        //User Info
        case "token-balance":
          return Format.formatToken(result, 4, this.options.contractName);

        //Bond Indo (to implement)
        case "bond-you-will-get":
          return Format.formatToken(result, 4, this.tokenName);
        case "pending-rewards":
          //return result;
          return Format.formatToken(result, 4, this.tokenName);
        case "bond-purchased":
          return Format.formatDollars(result, 2);
        case "max-you-can-buy-bond":
          return Format.formatToken(result, 4, this.tokenName);
        case "bond-roi":
          return Format.formatPercent(result);
        case "bond-debt-ratio":
          return Format.formatPercent(result, 4);
        case "bond-vesting-term":
          return Format.formatDays(result, true);
        case "claimable-rewards":
          return Format.formatToken(result, 4, this.tokenName);
        case "bond-time-remaining":
          console.log(result);
          return Format.formatDays(result, true);
        //stop to-implement

        case "bond-price":
          return Format.formatDollars(result, 2);
        //Stake Info

        case "apy":
          return Format.formatPercent(result);
        case "total-value-deposited":
          return Format.formatDollars(result, 0);

        case "time-till-next-rebase":
          return Format.formatDays(result);
        case "next-reward-amount":
          return Format.formatToken(result, 4, `s${this.tokenName}`);
        case "next-reward-yield":
          return Format.formatPercent(result, 4);
        case "staking-roi":
          return Format.formatPercent(result, 4);

        //Calculator Info
        case "initial-investment":
          return Format.formatDollars(result);
        case "rewards-estimation":
          return Format.formatToken(result, 4, this.tokenName);
        case "potential-return":
          return Format.formatDollars(result);
        case "current-wealth":
          return Format.formatDollars(result);
      }
    },
  },
};
</script>
<style>
@keyframes changeColor {
  0% {
    background-color: rgb(0, 0, 0, 0.1);
  }

  50% {
    background-color: rgb(0, 0, 0, 0.03);
  }

  100% {
    background-color: rgb(0, 0, 0, 0.1);
  }
}
.info-not-arrived {
  animation: changeColor 1.5s ease-in-out 0.5s infinite;
  width: 70px;
  height: 11px;
  display: inline-block;
  border-radius: 11px;
  vertical-align: middle;
}
</style>
