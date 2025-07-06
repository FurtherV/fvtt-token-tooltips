import { MODULE_ID } from "./constants.mjs";
import { getModuleSetting } from "./settings.mjs";
import { TokenTooltip } from "./tooltip.mjs";

export function registerWrappers() {
  libWrapper.register(
    MODULE_ID,
    "Token.prototype._onDragStart",
    function (wrapped, ...args) {
      if (getModuleSetting("disableTooltipsDrag")) TokenTooltip.instance.hide();
    },
    "LISTENER",
  );
}
