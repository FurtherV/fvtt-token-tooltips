import { MODULE_ID, TEMPLATE_FOLDER_PATH } from "./constants.mjs";
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
      throw new Error("You can only create one of TokenTooltipSingleton!");
    }
    TokenTooltip.instance = this;
  }

  /**
   * @type {Token}
   */
  token;

  /**
   * Returns whether the tooltip is currently active.
   */
  get isShown() {
    return token != null;
  }

  /**
   * Shows the tooltip, displaying data of the given token.
   * @param {Token} token
   */
  async show(token) {
    // Do not do anything if disabled
    if (!getModuleSetting("enableTooltips")) return;

    // Also do not do anything if we are in ruler mode and should not show tooltips during that
    if (
      ui.controls.tool === "ruler" &&
      getModuleSetting("disableTooltipsRuler")
    )
      return;

    this.token = token;

    if (!this.#isTokenValid()) return;

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

    const htmlString = await renderTemplate(
      `${TEMPLATE_FOLDER_PATH}/token-tooltip.hbs`,
      {
        id,
        moduleId: MODULE_ID,
        activeClass: "active",
        posX,
        posY,
        header: this.token.name,
        pills: [
          {
            class: "type",
            text: actor.system.details.type.label,
          },
        ],
        columnCount: tooltipConfig.columns,
        rows: tooltipConfig.attributes
          .flatMap((x) => x.generateRow(token))
          .filter((x) => !!x),
      }
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
   * Hides the tooltip
   */
  hide() {
    this.token = null;

    const tooltipElement = document.getElementById(TOOLTIP_ID);
    if (tooltipElement) {
      tooltipElement.classList.remove("active");
    }
  }

  /**
   * Updates the active tooltip, refreshing data displayed.
   * Only works if shown!
   */
  async update() {
    if (!this.#isTokenValid()) return;

    this.show(this.token);
  }

  /**
   * Checks if the given token is valid.
   * @param {Token} token
   * @returns {boolean} True if the token is valid and a tooltip can be displayed for it, false otherwise.
   */
  #isTokenValid(token) {
    token ??= this.token;
    if (token == null || token.document == null) return false;

    // If the token has no world transform, we cant grab its position on the screen
    if (!token.worldTransform) return false;

    if (token.document.hidden) return false;

    // Ignore item piles
    if (
      game.modules.get("item-piles")?.active &&
      ItemPiles.API.isValidItemPile(token)
    )
      return false;

    return true;
  }
}

/* const worldTransform = token.worldTransform;
const posY = Math.round(worldTransform.ty - 5);
// prettier-ignore
const posX = Math.round(worldTransform.tx + (token.w * worldTransform.a) + 20);
const id = `${MODULE_ID}-token-tooltip`;

const htmlString = await renderTemplate(
  `${TEMPLATE_FOLDER_PATH}/token-tooltip.hbs`,
  {
    id,
    moduleId: MODULE_ID,
    activeClass: active ? "active" : "",
    posX,
    posY,
    header: token.name,
    pills: [],
    rows: [
      "lorem",
      "lorem",
      "lorem",
      "lorem",
      "lorem",
      "lorem",
      "lorem",
      "lorem",
    ],
  }
);

const tokenTooltipElement = document.getElementById(id);
if (tokenTooltipElement) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlString;
  const newElement = tempDiv.firstElementChild;
  tokenTooltipElement.replaceWith(newElement);
} else {
  document.body.insertAdjacentHTML("beforeend", htmlString);
} */
