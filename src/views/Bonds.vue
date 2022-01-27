<template>
  <div>
    <base-header type="gradient-success" class="pb-6 pb-8 pt-5 pt-lg-7">
      <!-- Card stats -->
      <div class="row">
        <div class="col-lg-6">
          <stats-card
            title="Treasury Balance"
            type="gradient-red"
            sub-title="true"
            class="mb-4"
          >
            <template v-slot:valueSlot>
              <info-field infoId="treasury-balance" />
            </template>
          </stats-card>
        </div>
        <div class="col-lg-6">
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
      </div>
    </base-header>

    <div class="container-fluid mt--7">
      <div class="row">
        <div class="col">
          <div class="card shadow d-none d-md-flex">
            <div class="card-header bg-transparent">
              <h3 class="mb-0">Bonds (1,1)</h3>
            </div>
            <div class="card-body bond-table">
              <div class="col-12 row bond-header bond-row">
                <div class="col-2 bond-icon"></div>
                <div class="col-2 bond-table-item bond-name">
                  <strong>Bond</strong>
                </div>
                <div class="col-3 d-flex bond-table-item">
                  <div class="col-6 bond-table-item bond-price">
                    <strong>Price</strong>
                  </div>
                  <div class="col-6 bond-table-item bond-roi">
                    <strong>ROI</strong>
                  </div>
                </div>
                <div class="col-3 bond-table-item bond-purchased">
                  <strong>Purchased</strong>
                </div>
              </div>
              <div
                class="col-12 row bond-row"
                v-for="(bond, index) in bonds"
                :key="index"
              >
                <div class="col-2 bond-table-item bond-icon">
                  <div class="icons-container">
                    <span
                      class="rounded-circle bond-icon"
                      v-for="(icon, index) in bond.icons"
                      :key="icon + index"
                      :class="{
                        firstTokenInBond: index === 0 && bond.icons.length > 1,
                        secondTokenInBond: index === 1,
                      }"
                    >
                      <img
                        alt="bond.name"
                        :src="icon"
                        class="token-icon rounded-circle"
                      />
                    </span>
                  </div>
                </div>
                <div class="col-2 bond-table-item bond-name">
                  <strong>
                    {{ bond.name }}
                  </strong>
                </div>
                <div class="col-3 bond-table-item d-flex">
                  <div class="col-6 bond-table-item">
                    <info-field
                      infoId="bond-price"
                      :options="{ bondName: bond.name }"
                    />
                  </div>
                  <div class="col-6 bond-table-item">
                    <info-field
                      infoId="bond-roi"
                      :options="{ bondName: bond.name }"
                    />
                  </div>
                </div>
                <div class="col-3 bond-table-item bond-purchased">
                  <info-field
                    infoId="bond-purchased"
                    :options="{ bondName: bond.name }"
                  />
                </div>
                <el-tooltip placement="top" content="Save Now" class="col-2">
                  <router-link :to="bondLink(bond)">
                    <button class="btn btn-secondary">Bond</button>
                  </router-link>
                </el-tooltip>
              </div>
            </div>
          </div>
          <div class="bond-square-container">
            <div
              class="card shadow d-flex d-md-none bond-square col-12"
              v-for="(bond, index) in bonds"
              :key="bond + index"
            >
              <div class="card-body bond-table d-flex d-md-none">
                <div class="bond-icon-name row">
                  <div class="bond-icon bond-table-item">
                    <div class="square-icons-container">
                      <span
                        class="rounded-circle bond-icon"
                        v-for="(icon, index) in bond.icons"
                        :key="icon + index"
                        :class="{
                          firstTokenInBond:
                            index === 0 && bond.icons.length > 1,
                          secondTokenInBond: index === 1,
                        }"
                      >
                        <img
                          alt="bond.name"
                          :src="icon"
                          class="token-icon rounded-circle"
                        />
                      </span>
                    </div>
                  </div>
                  <div class="col-4 bond-table-item bond-name">
                    <strong>
                      {{ bond.name }}
                    </strong>
                  </div>
                </div>
                <div class="row bond-square-property">
                  <div class="bond-table-item">Price</div>
                  <div class="bond-table-item">
                    <info-field
                      infoId="bond-price"
                      :options="{ bondName: bond.name }"
                    />
                  </div>
                </div>
                <div class="row bond-square-property">
                  <div class="bond-table-item">ROI</div>
                  <div class="bond-table-item">
                    <info-field
                      infoId="bond-roi"
                      :options="{ bondName: bond.name }"
                      @valueAvailable="update"
                    />
                  </div>
                </div>

                <div class="row bond-square-property">
                  <div class="bond-table-item">Purchased</div>
                  <div class="bond-table-item">
                    <info-field
                      infoId="bond-purchased"
                      :options="{ bondName: bond.name }"
                    />
                  </div>
                </div>
                <el-tooltip placement="top" content="Save Now" class="col-12">
                  <router-link :to="bondLink(bond)">
                    <button class="btn btn-secondary bond-button">
                      Bond {{ bond.name }}
                    </button>
                  </router-link>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showModal" class="modal-route">
      <div class="modal-content-custom">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showModal: false,
      toolTipText: {},
    };
  },
  created() {
    this.bonds.forEach(function (bond) {
      bond.toolTipText = "Save";
    }, this);
  },
  methods: {
    onCopy(el) {
      var test = document.getElementById(el);
      test.select();
      document.execCommand("copy");
    },
    bondLink(bond) {
      return "/bonds/" + bond.id;
    },
    async update(event) {
      if (event.type == "bond-roi") {
        this.getBondByName(event["options"]["bondName"]).roi = await event[
          "value"
        ];
      }
      console.log(this.bonds);
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler: function (newVal) {
        this.showModal = newVal.meta && newVal.meta.showModal;
      },
    },
  },
};
</script>

<style>
.bond-row {
  align-items: center;
  text-align: center;
}
.bond-table {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-size: 0.9em;
}
.bond-header {
  color: grey;
}
.token-icon {
  width: 35px;
  height: 35px;
}
.firstTokenInBond .secondTokenInBond {
  min-width: 70px;
}
.firstTokenInBond {
  position: relative;
  right: -2px;
}
.secondTokenInBond {
  position: relative;
  left: -2px;
}
.bond-square-container {
}
.bond-square {
  margin-bottom: 15px;
}
.bond-table-item {
  padding: 0px !important;
}
.bond-icon-name {
  align-items: center;
  margin-left: 2em !important;
}
.bond-square-property {
  justify-content: space-between;
  padding: 0em 1.5em;
  font-weight: bold;
}
.bond-button {
  width: 100%;
}
.square-icons-container {
  margin-right: 1.5em;
}
/*Modal Style*/
.modal-route {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 0px;
  z-index: 1;
}
.modal-content-custom {
  width: 90%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 803px;
}
</style>
