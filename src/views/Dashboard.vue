<template>
  <div>
    <base-header type="gradient-success" class="pb-6 pb-8 pt-5 pt-lg-7">
      <div class="row">
        <div class="col-xs-12 col-sm-6 col-xl-4 col-lg-4">
          <stats-card
            title="Market Cap"
            type="gradient-red"
            sub-title="350,897"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field infoId="market-cap" />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-xl-4 col-lg-4">
          <stats-card
            :title="tokenName + ' Price'"
            type="gradient-orange"
            sub-title="true"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field
                infoId="token-price"
                :options="{ tokenName: tokenName }"
              />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-xl-4 col-lg-4">
          <stats-card
            title="Circulating Supply"
            type="gradient-red"
            sub-title="350,897"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field infoId="circulating-supply-total" />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-sm-6 col-xl-4 col-lg-4">
          <stats-card
            :title="'Backing per ' + tokenName"
            type="gradient-red"
            sub-title="350,897"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field infoId="backing-per-token" />
            </template>
          </stats-card>
        </div>
        <div class="col-xs-12 col-xl-8 col-lg-8">
          <stats-card
            title="Current Index"
            type="gradient-green"
            sub-title="924"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field infoId="current-index" />
            </template>
          </stats-card>
        </div>
      </div>
    </base-header>
  </div>
</template>
<script>
export default {
  data() {
    return {};
  },
  methods: {},
  mounted() {},
};
</script>
<style></style>
