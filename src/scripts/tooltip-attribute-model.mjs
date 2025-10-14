import { getConfigValue } from "./config.mjs";
import { ATTRIBUTE_TYPES, LANG_ID, MODULE_TITLE } from "./constants.mjs";

const { StringField, BooleanField, NumberField } = foundry.data.fields;
const { DataModel } = foundry.abstract;

// TODO: Add possibility of using a macro
export class TooltipAttributeModel extends DataModel {
  static LOCALIZATION_PREFIXES = [`${LANG_ID}.Model.Tooltip.Attribute`];

  static defineSchema() {
    return {
      permission: new NumberField({
        required: true,
        nullable: false,
        initial: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
        choices: Object.keys(CONST.DOCUMENT_OWNERSHIP_LEVELS).reduce(
          (acc, x) => {
            const numVal = CONST.DOCUMENT_OWNERSHIP_LEVELS[x];
            if (numVal < 0) return acc;
            const i18n = `OWNERSHIP.${x}`;
            acc[numVal] = i18n;
            return acc;
          },
          {},
        ),
      }),
      pill: new BooleanField({
        required: true,
        nullable: false,
        initial: false,
      }),
      icon: new StringField({
        required: true,
        blank: true,
        nullable: false,
        initial: "fa-solid fa-heart",
      }),
      type: new StringField({
        required: true,
        blank: false,
        nullable: false,
        initial: Object.values(ATTRIBUTE_TYPES)[0],
        choices: Object.values(ATTRIBUTE_TYPES).reduce((acc, x) => {
          acc[x] = `${LANG_ID}.RowType.${x}`;
          return acc;
        }, {}),
      }),
      path: new StringField({
        required: true,
        blank: true,
        nullable: false,
        initial: "system.attributes.hp.value",
      }),
    };
  }

  /**
   * Generates a tooltip row using this configuration and given token as the data source.
   * @param {Token|TokenDocument} token
   * @returns {Object}
   */
  generateRow(token) {
    // If we pass the placeable, get its document
    if (token.document) {
      token = token.document;
    }

    // if token or token's actor is null, abort!
    if (token?.actor == null) return null;

    // if we dont have permissions to see the row or pill, abort!
    if (token.permission < this.permission) return null;

    let row;

    switch (this.type) {
      case ATTRIBUTE_TYPES.CODE:
        row = this.#generateCodeRow(token);
        break;
      case ATTRIBUTE_TYPES.GENERATOR:
        row = this.#generateGeneratorRow(token);
        break;
      case ATTRIBUTE_TYPES.PATH:
      default:
        row = this.#generatePathRow(token);
        break;
    }
    return row;
  }

  #generatePathRow(token) {
    let source = token.actor;
    const dataPath = this.path;

    // Process path prefixes like "token" and "actor"
    const pathPrefix = dataPath.split(".")[0];
    let shouldRemovePrefix = false;

    switch (pathPrefix) {
      case "@token":
        source = token;
        shouldRemovePrefix = true;
        break;
      case "@actor":
        shouldRemovePrefix = true;
        break;
    }

    const dataPathwithoutPrefix = shouldRemovePrefix
      ? dataPath.split(".").slice(1).join(".")
      : dataPath;

    return {
      icon: this.icon,
      value: foundry.utils
        .getProperty(source, dataPathwithoutPrefix)
        ?.toString(),
    };
  }

  #generateCodeRow(token) {
    const fnConstructor = function () {}.constructor;
    const fn = new fnConstructor(
      "actor",
      "token",
      "model",
      "presets",
      `{${this.path}\n}`,
    );

    const modelObject = this.toObject();

    try {
      // TODO: improve naming
      let row = fn.call(
        modelObject,
        token.actor,
        token,
        modelObject,
        getConfigValue("presets"),
      );

      console.debug({ row });

      // Check if the return value is a preset function
      if ((typeof row === "function") && (Object.values(getConfigValue("presets")).includes(row))) {
        // TODO: reuse args from last, no duplicate code
        row = row.call(modelObject, token.actor, token, modelObject, getConfigValue("presets"));
      }

      console.debug({ row });

      if (row != null) {
        row.icon ??= this.icon;
      }

      return row;

    } catch (err) {
      ui.notifications.error(`${MODULE_TITLE}: A tooltip code row produced an error! See the console for more details.`, {
        localize: true,
      });
      console.error("Row Data:", this.toObject());
      console.error(err);
      throw err;
    }
  }

  #generateGeneratorRow(token) {
    return {
      value: "",
    };
  }
}
