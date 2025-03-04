import { MODULE_ID } from "./constants.mjs";
import { TooltipConfigModel } from "./tooltip-config-model.mjs";
import { TooltipConfig } from "./tooltip-config.mjs";

export function registerModuleSettings() {
  game.settings.registerMenu(MODULE_ID, "tooltipConfigMenu", {
    name: "Tooltips",
    label: "Configure Tooltips",
    hint: "Configure how token tooltips are displayed.",
    icon: "fa-solid fa-bars",
    type: TooltipConfig,
    restricted: true,
  });

  game.settings.register(MODULE_ID, "tooltipConfig", {
    name: "tooltipConfig",
    hint: "Internal",
    scope: "world",
    config: false,
    requiresReload: false,
    type: TooltipConfigModel,
    default: new TooltipConfigModel({}),
  });

  game.settings.register(MODULE_ID, "enableTooltips", {
    name: "Enable Tooltips",
    hint: "Enable to show tooltips, disable to turn them off completely.",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, "disableTooltipsRuler", {
    name: "Disable on Measurement Layer.",
    hint: "Enable to hide tooltips while using the measurement ruler.",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, "disableTooltipsDrag", {
    name: "Disable While Dragging",
    hint: "(Requires LibWrapper) Enable to prevent tooltips from appearing when moving a token.",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, "disableTooltipsPile", {
    name: "Disable on Item Piles",
    hint: "(Requires ItemPiles) Enable to hide tooltips for item piles.",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE_ID, "disableTooltipsDead", {
    name: "Disable on Dead Tokens",
    hint: "Enable to hide tooltips for tokens marked as dead.",
    scope: "client",
    config: true,
    requiresReload: false,
    type: Boolean,
    default: true,
  });
}

export async function setModuleSetting(key, value) {
  return game.settings.set(MODULE_ID, key, value);
}

export function getModuleSetting(key) {
  return game.settings.get(MODULE_ID, key);
}
