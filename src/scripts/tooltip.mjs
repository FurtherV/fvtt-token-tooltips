import { FLAG, MODULE_ID, TEMPLATE_FOLDER_PATH } from "./constants.mjs";
import { getModuleSetting } from "./settings.mjs";
import { TooltipConfigModel } from "./tooltip-config-model.mjs";

const TOOLTIP_ID = `${MODULE_ID}-token-tooltip`;

export class TokenTooltip {
  /**
   * Singleton instance.
   * @type {TokenTooltip}
   */
  static instance;

  constructor() {
    if (TokenTooltip.instance) {
      throw new Error(`You can only create one of ${TokenTooltip.name}!`);
    }

    TokenTooltip.instance = this;
    this.token = null;
  }

  /**
   * @type {foundry.canvas.placeables.Token | null}
   */
  token;

  /**
   * Returns whether the tooltip is currently shown.
   */
  get isShown() {
    return token != null;
  }

  /**
   * Shows the tooltip.
   * @param {foundry.canvas.placeables.Token} token
   */
  async show(token) {
    // Do not do anything if disabled
    if (!getModuleSetting("enableTooltips")) return;

    // Also do not do anything if we are in ruler mode and should not show tooltips during that
    if (
      (ui.controls.tool === "ruler") &&
      getModuleSetting("disableTooltipsRuler")
    )
      return;

    this.token = token;

    if (!this.#shouldShowTooltip()) return;

    // If the token hud is open, we do not render a tooltip for that token
    if (game.canvas?.tokens?.hud?.rendered) {
      if (game.canvas.tokens.hud.object === token) return;
    }

    const actor = this.token.actor;
    const worldTransform = this.token.worldTransform;
    const posY = Math.round(worldTransform.ty - 5);
    // prettier-ignore
    const posX = Math.round(worldTransform.tx + (this.token.w * worldTransform.a) + 20);
    const id = `${MODULE_ID}-token-tooltip`;

    /** @type {TooltipConfigModel} */
    const tooltipConfig =
      game.settings.get(MODULE_ID, "tooltipConfig") ?? new TooltipConfigModel();

    let tooltipPills = [];
    let tooltipRows = [];
    try {
      tooltipPills = tooltipConfig.attributes
        .filter((x) => x.pill)
        .flatMap((x) => x.generateRow(token, game.user))
        .filter((x) => !!x);

      tooltipRows = tooltipConfig.attributes
        .filter((x) => !x.pill)
        .flatMap((x) => x.generateRow(token, game.user))
        .filter((x) => !!x);
    } catch (err) {
      console.error(err);
      this.hide();
      return;
    }

    const htmlString = await foundry.applications.handlebars.renderTemplate(
      `${TEMPLATE_FOLDER_PATH}/token-tooltip.hbs`,
      {
        id,
        moduleId: MODULE_ID,
        activeClass: "active",
        posX,
        posY,
        header: this.token.name,
        pills: tooltipPills,
        columnCount: tooltipConfig.columns,
        rows: tooltipRows,
      },
    );

    const tooltipElement = document.getElementById(id);
    if (tooltipElement) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const newElement = tempDiv.firstElementChild;
      tooltipElement.replaceWith(newElement);
    } else {
      document.body.insertAdjacentHTML("beforeend", htmlString);
    }
  }

  /**
   * Hides the tooltip.
   */
  hide() {
    this.token = null;

    const tooltipElement = document.getElementById(TOOLTIP_ID);
    if (tooltipElement) {
      tooltipElement.classList.remove("active");
    }
  }

  /**
   * Updates and refreshes the shown tooltip.
   */
  async update() {
    if (!this.#shouldShowTooltip()) return;

    this.show(this.token);
  }

  /**
   * Returns whether a tooltip should be shown for the given token.
   * Falls back to the currently active token when no token is provided.
   * @param {foundry.canvas.placeables.Token | null | undefined} [token]
   * @returns {boolean} `true` when tooltip display conditions are met, otherwise `false`.
   */
  #shouldShowTooltip(token) {
    token ??= this.token;
    if ((token == null) || (token.document == null) || (token.actor == null))
      return false;

    // Sometimes a token has no world transform, which makes it invalid since we don't know its screen position.
    if (!token.worldTransform) return false;

    // Ignore hidden, secret or not visible tokens
    if (token.document.hidden) return false;
    if (token.document.isSecret) return false;
    if (!token.visible) return false;

    // Ignore invisible or nondetectable tokens
    if ([CONFIG.specialStatusEffects.INVISIBLE, CONFIG.specialStatusEffects.NONDETECTION].some((x) => token.document.hasStatusEffect(x))) return false;

    // Ignore group and vehicle actors
    if (["group", "vehicle"].includes(token.actor.type)) return false;

    // Ignore item piles if required
    if (
      game.modules.get("item-piles")?.active &&
      ItemPiles.API.isValidItemPile(token) &&
      getModuleSetting("disableTooltipsPile")
    )
      return false;

    // Ignore dead actors
    if (
      getModuleSetting("disableTooltipsDead") &&
      token.document.actor.statuses.has(CONFIG.specialStatusEffects.DEFEATED)
    )
      return false;

    // Ignore if tooltips are disabled for this token
    if (token.document.getFlag(MODULE_ID, FLAG.DISABLE_TOOLTIP) === true) return false;

    return true;
  }
}
