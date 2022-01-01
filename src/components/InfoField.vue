<template>
  <span v-if="infoText != null">
    <strong>{{ infoText }} </strong>
  </span>

  <span v-else class="info-not-arrived"> </span>
</template>

<script>
export default {
  name: "info-field",
  data() {
    return {};
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
      default: undefined,
    },
  },
  computed: {
    infoText() {
      switch (this.infoId) {
        case "pending-rewards":
          return this.getPendingRewards();
        case "bond-price":
          //return this.getBondPrice(this.options.name);
          break;
        case "token-price":
          return this.getTokenPriceInUSD(this.options.address);
        case "initial-investment":
          return (
            this.options.amount * this.options.purchasePrice
          ).toLocaleString(undefined, { style: "currency", currency: "USD" });
        case "rewards-estimation":
          return this.getRewardsEstimation(this.options);
        case "potential-return":
          return (
            this.getRewardsEstimation(this.options) * this.options.futurePrice -
            this.options.amount * this.options.purchasePrice
          ).toLocaleString(undefined, { style: "currency", currency: "USD" });
        case "current-wealth":
          return (
            this.options.balance * this.options.purchasePrice
          ).toLocaleString(undefined, { style: "currency", currency: "USD" });
        default:
          console.log(this.infoId + " not registered as info");
          break;
      }
      return null;
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
