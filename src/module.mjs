import "./less/style.less";

import { MODULE_ID, TEMPLATE_FOLDER_PATH } from "./scripts/constants.mjs";
import {
  getModuleSetting,
  registerModuleSettings,
  setModuleSetting,
} from "./scripts/settings.mjs";
import { TokenTooltip } from "./scripts/tooltip.mjs";
import { registerConfig } from "./scripts/config.mjs";
import { registerWrappers } from "./scripts/wrappers.mjs";
import { TooltipConfigModel } from "./scripts/tooltip-config-model.mjs";
import { TooltipAttributeModel } from "./scripts/tooltip-attribute-model.mjs";

Hooks.on("init", () => {
  registerModuleSettings();
  registerConfig();

  // create token tooltip singleton
  new TokenTooltip();
});

Hooks.on("i18nInit", () => {
  // Register data models in localization
  [TooltipConfigModel, TooltipAttributeModel].forEach((cls) => {
    Localization.localizeDataModel(cls);
  });
});

Hooks.on("libWrapper.Ready", () => {
  registerWrappers();
});

Hooks.on("hoverToken", async (token, hoverIn) => {
  if (hoverIn) {
    TokenTooltip.instance.show(token);
  } else {
    TokenTooltip.instance.hide();
  }
});

Hooks.on("refreshToken", (token) => {
  if (token !== TokenTooltip.instance.token) return;
  TokenTooltip.instance.update();
});

Hooks.on("deleteToken", (token) => {
  if (token.id !== TokenTooltip.instance.token.id) return;
  TokenTooltip.instance.hide();
});

Hooks.on("renderTokenHUD", () => {
  TokenTooltip.instance.hide();
});

Hooks.on(
  "canvasPan",
  foundry.utils.debounce(() => {
    TokenTooltip.instance.update();
  }, 50),
);

Hooks.on("getSceneControlButtons", (controls) => {
  if (!canvas) return;

  const tokenControl = controls.find((x) => x.name === "token");
  tokenControl.tools.push({
    name: "tooltip",
    title: "Toggle Tooltips",
    icon: "fa-solid fa-comment",
    active: getModuleSetting("enableTooltips") === true,
    toggle: true,
    onClick: (toggled) => {
      setModuleSetting("enableTooltips", toggled);
    },
  });
});
