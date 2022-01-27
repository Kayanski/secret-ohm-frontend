import Badge from "../components/Badge";
import BaseAlert from "../components/BaseAlert";
import BaseButton from "../components/BaseButton";
import BaseCheckbox from "../components/BaseCheckbox";
import BaseDropdown from "../components/BaseDropdown";
import BaseHeader from "../components/BaseHeader";
import BaseInput from "../components/BaseInput";
import BaseNav from "../components/BaseNav";
import BasePagination from "../components/BasePagination";
import BaseProgress from "../components/BaseProgress";
import BaseSwitch from "../components/BaseSwitch";
import BaseRadio from "../components/BaseRadio";
import BaseTable from "../components/BaseTable";
import Card from "../components/Card";
import Modal from "../components/Modal";
import StatsCard from "../components/StatsCard";
import TabPane from "../components/Tabs/TabPane";
import Tabs from "../components/Tabs/Tabs";
import InfoField from "../components/InfoField";
import BalanceInfoField from "../components/BalanceInfoField";
import TokenInput from "../components/TokenInput";
import { ElTooltip, ElPopover } from "element-plus";
import easySpinner from "vue-easy-spinner";

const GlobalComponents = {
  install(app) {
    app.component("badge", Badge);
    app.component("base-alert", BaseAlert);
    app.component("base-button", BaseButton);
    app.component("base-checkbox", BaseCheckbox);
    app.component("base-dropdown", BaseDropdown);
    app.component("base-header", BaseHeader);
    app.component("base-input", BaseInput);
    app.component("base-nav", BaseNav);
    app.component("base-pagination", BasePagination);
    app.component("base-progress", BaseProgress);
    app.component("base-switch", BaseSwitch);
    app.component("base-radio", BaseRadio);
    app.component("base-table", BaseTable);
    app.component("card", Card);
    app.component("modal", Modal);
    app.component("stats-card", StatsCard);
    app.component("tab-pane", TabPane);
    app.component("tabs", Tabs);
    app.component("token-input", TokenInput, {
      emits: ["submitTokenInput", "tokenInput"],
    });
    app.component("info-field", InfoField);
    app.component("balance-info-field", BalanceInfoField);
    app.use(ElTooltip);
    app.use(ElPopover);
    app.use(easySpinner, {
      /*options*/
      prefix: "easy",
    });
  },
};

export default GlobalComponents;
