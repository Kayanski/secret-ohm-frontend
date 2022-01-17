<template>
  <router-link to="/bonds">
    <i class="ni ni-fat-remove close-modal"></i>
  </router-link>
  <div class="row price-container">
    <div class="price">
      <div class="bond-prices-label">Bond Price</div>
      <div class="bond-prices-value">
        <info-field infoId="bond-price" :options="{ bondName: bond.name }" />
      </div>
    </div>
    <div class="price">
      <div class="bond-prices-label">{{ tokenName }} Price</div>
      <div class="bond-prices-value">
        <info-field infoId="token-price" :options="{ tokenName: tokenName }" />
      </div>
    </div>
  </div>
  <tabs type="warning" :pills="false" :fill="true" tabNavClasses="bond-tabs">
    <tab-pane title="Bond">
      <div class="get-bond-container container">
        <token-input
          :token="{
            name: 'sUST',
            address: 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek',
          }"
          buttonText="Bond"
          @submitTokenInput="buyBond"
          @tokenInput="tokenInputValue = $event"
        />

        <div class="row bond-info-container">
          <div
            v-for="bondInfo in bondInfoToDisplay"
            :key="bondInfo.title"
            class="bond-info"
          >
            <div class="bond-info-title">
              {{ bondInfo.title }}
            </div>
            <div class="bond-info-value">
              <info-field
                :infoId="bondInfo.id"
                :options="{
                  bondName: bond.name,
                  amount: tokenInputValue,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </tab-pane>
    <tab-pane title="Redeem">
      <div class="get-bond-container container">
        <form class="bond-form">
          <token-input
            :token="{
              name: 'sUST',
              address: 'secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek',
            }"
            buttonText="Redeem"
            @submitTokenInput="redeemBond"
          />
        </form>

        <div class="row bond-info-container">
          <div
            v-for="bondInfo in RedeemInfoToDisplay"
            :key="bondInfo.title"
            class="bond-info"
          >
            <div class="bond-info-title">
              {{ bondInfo.title }}
            </div>
            <div class="bond-info-value">
              <info-field
                :infoId="bondInfo.id"
                :options="{
                  bondName: bond.name,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </tab-pane>
  </tabs>
</template>

<script>
export default {
  props: ["bondId"],
  data() {
    let bond = this.getBondById(this.bondId);
    return {
      bond: bond,
      bondInfoToDisplay: [
        {
          title: "Your Balance",
          id: "token-balance",
        },
        {
          title: "You Will Get",
          id: "bond-you-will-get",
        },
        {
          title: "Max You Can Buy",
          id: "max-you-can-buy-bond",
        },
        {
          title: "ROI",
          id: "bond-roi",
        },
        {
          title: "Debt Ratio",
          id: "bond-debt-ratio",
        },
        {
          title: "Vesting Term",
          id: "bond-vesting-term",
        },
      ],
      RedeemInfoToDisplay: [
        {
          title: "Pending Rewards",
          id: "pending-rewards",
        },
        {
          title: "Claimable Rewards",
          id: "claimable-rewards",
        },
        {
          title: "Time Until Fully Vested",
          id: "bond-time-remaining",
        },
        {
          title: "ROI",
          id: "bond-roi",
        },
        {
          title: "Debt Ratio",
          id: "bond-debt-ratio",
        },
        {
          title: "Vesting Term",
          id: "bond-vesting-term",
        },
      ],
      tokenInputValue: undefined,
    };
  },
  computed: {
    bondPriceText() {
      return this.bond.price.toLocaleString(undefined, {
        currency: "USD",
        style: "currency",
        maximumFractionDigits: 1,
      });
    },
    tokenPriceText() {
      return this.tokenPrice.toLocaleString(undefined, {
        currency: "USD",
        style: "currency",
        maximumFractionDigits: 1,
      });
    },
  },
  methods: {
    pendingRewardsText() {
      return (
        this.pendingRewards.toLocaleString(undefined, {
          maximumFractionDigits: 5,
          minimumFractionDigits: 5,
        }) +
        " " +
        this.tokenName
      );
    },
    buyBond(e) {
      console.log("Bond : " + e);
    },
    redeemBond(e) {
      console.log("Redeem : " + e);
    },
  },
  beforeCreated() {
    this.bond = this.getBondById(this.bondId);
  },
};
</script>

<style>
.price-container {
  justify-content: space-evenly;
  margin-top: 50px;
}
.price {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.close-modal {
  float: right;
  font-size: 1.5em !important;
}
.get-bond-container {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bond-input {
}
.bond-form {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 15px;
}
.bond-info {
  display: flex;
  justify-content: space-between;
  padding: 0.2em 1em;
  width: 100%;
  font-weight: 560;
  font-size: 0.9em;
}
.bond-prices-value {
  font-weight: bold;
  font-size: 1.3em;
}
.bond-tabs .nav-link {
  border-bottom-color: white;
}
</style>
