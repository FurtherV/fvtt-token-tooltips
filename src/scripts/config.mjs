import { MODULE_ID } from "./constants.mjs";
import { minimumDistanceBetweenTokens } from "./utils.mjs";

export function registerConfig() {
  const defaultconfig = {};

  const shortcuts = {};
  shortcuts.healthState = shortcutHealthState;
  shortcuts.armorState = shortcutArmorState;
  shortcuts.distance = shortcutDistance;
  defaultconfig.shortcuts = shortcuts;

  // in theory users could register changes to the config before we actually add our stuff to it...
  const existingConfig = CONFIG[MODULE_ID];

  CONFIG[MODULE_ID] = foundry.utils.mergeObject(defaultconfig, existingConfig, {
    inplace: false,
  });
}

export function getConfigValue(path) {
  return foundry.utils.getProperty(CONFIG[MODULE_ID], path);
}

function shortcutHealthState(actor) {
  const pct = actor.system.attributes.hp.pct;
  const dmg = actor.system.attributes.hp.damage;
  const hp = actor.system.attributes.hp.value;

  // 95–100% → Healthy
  // 50–94% → Lightly Wounded
  // 35–49% → Wounded
  // 20–34% → Heavily Wounded
  // 0–19% → Almost Dead
  // HP === 0 → Down / Dead

  let status;
  if (pct >= 95) {
    status = "Healthy";
  } else if (pct >= 50) {
    status = "Lightly Wounded";
  } else if (pct >= 35) {
    status = "Wounded";
  } else if (pct >= 20) {
    status = "Heavily Wounded";
  } else {
    status = "Almost Dead";
  }

  if (hp === 0) {
    status = "Down / Dead";
  }

  return { value: `${status} (${dmg})` };
}

function shortcutArmorState(actor) {
  let armorText = "";

  const actorAcCalc = actor.system.attributes.ac.calc;
  if ((actorAcCalc === "natural") || (actorAcCalc === "flat")) {
    // Natural Armor / Fixed AC
    const actorAcValue = actor.system.attributes.ac.value - actor.system.attributes.ac.shield;
    if (actorAcValue >= 18) {
      armorText = "Heavy Natural";
    } else if (actorAcValue >= 14) {
      armorText = "Medium Natural";
    } else if (actorAcValue >= 11) {
      armorText = "Light Natural";
    } else {
      armorText = "None";
    }
  } else if (actorAcCalc === "mage") {
    // Mage Armor
    armorText = "Mage Armor";
  } else if (actorAcCalc === "draconic") {
    // Draconic Resilience
    armorText = "Draconic Resilience";
  } else if ((actorAcCalc === "unarmoredMonk") || (actorAcCalc === "unarmoredBarb") || (actorAcCalc === "unarmoredBard")) {
    // Unarmored Defense
    armorText = "Unarmored Defense";
  } else {
    // Equiped Armor
    armorText = actor.system.attributes.ac.equippedArmor?.system.type.label ?? "None";
  }

  if (actor.system.attributes.ac.equippedShield) {
    armorText = armorText + " + Shield";
  }
  return { value: `${armorText}` };
}

function shortcutDistance(token) {
  if (token instanceof TokenDocument) {
    token = token?.object;
  }

  const speaker = ChatMessage.implementation.getSpeaker();
  const userToken = game.canvas.tokens.get(speaker.token) || null;

  let text = NaN.toString();
  if ((userToken?.document) && (userToken !== token)) {
    const horizontalDistance = minimumDistanceBetweenTokens(
      token,
      userToken,
      game.scenes.current,
    );
    const verticalDistance = Math.abs(
      token.document.elevation - userToken.document.elevation,
    );
    let total = horizontalDistance;

    if (
      game.settings.get("core", "gridDiagonals") ===
      CONST.GRID_DIAGONALS.EQUIDISTANT
    ) {
      total = Math.max(horizontalDistance, verticalDistance);
    }

    text = `${total.toFixed(1)}  ${game.canvas.grid.units}`.trim();
  }

  return {
    value: text,
  };
}
