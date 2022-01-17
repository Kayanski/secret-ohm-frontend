<template>
  <div>
    <base-header type="gradient-success" class="pb-6 pb-8 pt-5 pt-lg-8">
      <!-- Card stats -->
      <div class="row">
        <div class="col-lg-4 col-md-6">
          <stats-card
            title="APY"
            type="gradient-red"
            sub-title="350,897"
            class="mb-4 mb-xl-0"
          >
            <template v-slot:valueSlot>
              <info-field infoId="apy" />
            </template>
          </stats-card>
        </div>
        <div class="col-lg-4 col-md-6">
          <stats-card
            title="Total Value Deposited"
            type="gradient-orange"
            sub-title="2,356"
            class="mb-4 mb-xl-0"
          >
            <template v-slot:valueSlot>
              <info-field infoId="total-value-deposited" />
            </template>
          </stats-card>
        </div>
        <div class="col-lg-4 col-md-12">
          <stats-card
            title="Current Index"
            type="gradient-green"
            sub-title="924"
            class="mb-4 mb-xl-0"
          >
            <template v-slot:valueSlot>
              <info-field infoId="current-index" />
            </template>
          </stats-card>
        </div>
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="row">
        <div class="col">
          <div class="card shadow d-md-flex">
            <div class="card-header bg-transparent">
              <h3 class="mb-0">Stake {{ tokenName }} (3,3)</h3>
              <info-field infoId="time-till-next-rebase" />
            </div>

            <div class="card-body">
              <tabs
                type="warning"
                :pills="false"
                :fill="true"
                tabNavClasses="stake-tabs"
              >
                <tab-pane title="Stake">
                  <div class="get-bond-container container">
                    <token-input
                      :token="{
                        name: tokenName,
                        address: tokenContractAddress,
                      }"
                      buttonText="Stake"
                      @submitTokenInput="stake"
                    />
                    <div class="row stake-info-container">
                      <div
                        v-for="stakeInfo in stakeInfoToDisplay"
                        :key="stakeInfo.title + stakeInfo.id"
                        class="stake-info"
                      >
                        <div class="stake-info-title">
                          {{ stakeInfo.title }}
                        </div>
                        <div class="stake-info-value">
                          <info-field
                            :infoId="stakeInfo.id"
                            :options="stakeInfo.options"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </tab-pane>
                <tab-pane title="Unstake">
                  <div class="get-bond-container container">
                    <token-input
                      :token="{
                        name: 's' + tokenName,
                        address: sTokenContractAddress,
                      }"
                      buttonText="Unstake"
                      @submitTokenInput="unstake"
                    />
                    <div class="row stake-info-container">
                      <div
                        v-for="stakeInfo in stakeInfoToDisplay"
                        :key="stakeInfo.title"
                        class="stake-info"
                      >
                        <div class="stake-info-title">
                          {{ stakeInfo.title }}
                        </div>
                        <div class="stake-info-value">
                          <info-field
                            :infoId="stakeInfo.id"
                            :options="stakeInfo.options"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </tab-pane>
              </tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      stakeInfoToDisplay: [
        {
          title: "Your Balance",
          id: "token-balance",
          options: {
            contractName: this.tokenName,
          },
        },
        {
          title: "Your Staked Balance",
          id: "token-balance",
          options: {
            contractName: "s" + this.tokenName,
          },
        },
        {
          title: "Next Reward Amount",
          id: "next-reward-amount",
          options: {
            contractName: this.tokenName,
          },
        },
        {
          title: "Next Reward Yield",
          id: "next-reward-yield",
          options: {
            contractName: this.tokenName,
          },
        },
        {
          title: "ROI (5-Day Rate)",
          id: "staking-roi",
        },
      ],
    };
  },
  methods: {
    stake(e) {
      console.log("Stake : " + e);
    },
    unstake(e) {
      console.log("Unstake : " + e);
    },
  },
};
</script>
<style>
.stake-info {
  display: flex;
  justify-content: space-between;
  padding: 0.2em 1em;
  width: 100%;
  font-weight: 560;
  font-size: 0.9em;
}
</style>
