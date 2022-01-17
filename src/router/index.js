import { createRouter, createWebHashHistory } from "vue-router";

import DashboardLayout from "@/layout/DashboardLayout";

import Dashboard from "../views/Dashboard.vue";
import Bonds from "../views/Bonds.vue";
import GetBond from "../views/GetBond.vue";
import Stake from "../views/Stake.vue";
import Calculator from "../views/Calculator.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
    component: DashboardLayout,
    children: [
      {
        path: "/dashboard",
        name: "dashboard",
        components: { default: Dashboard },
      },
      {
        path: "/bonds",
        name: "bonds",
        components: { default: Bonds },
        children: [
          {
            path: ":bondId",
            component: GetBond,
            props: true,
            meta: {
              showModal: true,
            },
          },
        ],
      },
      {
        path: "/stake",
        name: "stake",
        components: { default: Stake },
      },
      {
        path: "/calculator",
        name: "calculator",
        components: { default: Calculator },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: "active",
  routes,
});

export default router;
