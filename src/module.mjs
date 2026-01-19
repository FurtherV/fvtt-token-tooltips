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
  // Register settings, config, and bootstrap the tooltip singleton.
  registerModuleSettings();
  registerConfig();

  // create token tooltip singleton
  new TokenTooltip();
});

Hooks.on("i18nInit", () => {
  // Register data models for localization after i18n is ready.
  [TooltipConfigModel, TooltipAttributeModel].forEach((cls) => {
    Localization.localizeDataModel(cls);
  });
});

Hooks.on("libWrapper.Ready", () => {
  // Install libWrapper hooks once the library is ready.
  registerWrappers();
});

Hooks.on("canvasTearDown", () => {
  // Hide tooltips when the canvas is torn down.
  TokenTooltip.instance.hide();
});

Hooks.on("canvasInit", () => {
  // Hide tooltips at canvas initialization to avoid stale UI.
  TokenTooltip.instance.hide();
});

Hooks.on("hoverToken", async (token, hoverIn) => {
  // Show tooltips on hover and hide them when the cursor leaves.
  if (hoverIn) {
    TokenTooltip.instance.show(token);
  } else {
    TokenTooltip.instance.hide();
  }
});

Hooks.on("refreshToken", (token) => {
  // Refresh the tooltip when the tracked token is re-rendered.
  if (token !== TokenTooltip.instance.token) return;
  TokenTooltip.instance.update();
});

Hooks.on("deleteToken", (token) => {
  // Hide the tooltip if the tracked token is deleted.
  if (token?.id !== TokenTooltip.instance.token?.id) return;
  TokenTooltip.instance.hide();
});

Hooks.on("renderTokenHUD", () => {
  // Hide tooltips when the token HUD is rendered.
  TokenTooltip.instance.hide();
});

Hooks.on(
  "canvasPan",
  // Reposition the tooltip after canvas panning, debounced for performance.
  foundry.utils.debounce(() => {
    TokenTooltip.instance.update();
  }, 50),
);

Hooks.on("getSceneControlButtons", (controls) => {
  // Add the scene control toggle for enabling/disabling tooltips.
  if (!canvas) return;

  controls.tokens.tools.tokenTooltip = {
    active: getModuleSetting("enableTooltips") === true,
    icon: "fa-solid fa-comment",
    name: "tokenTooltip",
    title: "Toggle Tooltips",
    toggle: true,
    visible: true,
    onChange: (event, active) => {
      setModuleSetting("enableTooltips", active);
    },
  };
});
