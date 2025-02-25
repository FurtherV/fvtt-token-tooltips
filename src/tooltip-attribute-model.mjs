import { getConfigValue } from "./config.mjs";
import { ATTRIBUTE_TYPES, LANG_ID } from "./constants.mjs";

const { StringField } = foundry.data.fields;
const { DataModel } = foundry.abstract;

// TODO: Add possibility of using a macro
export class TooltipAttributeModel extends DataModel {
  static LOCALIZATION_PREFIXES = [`${LANG_ID}.Model.Tooltip.Attribute`];

  static defineSchema() {
    return {
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
    if (token.document) {
      token = token.document;
    }

    if (token?.actor == null) return null;

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
      "shortcuts",
      `{${this.path}\n}`
    );

    const modelObject = this.toObject();

    try {
      const row = fn.call(
        modelObject,
        token.actor,
        token,
        modelObject,
        getConfigValue("shortcuts")
      );
      if (row != null) {
        row.icon ??= this.icon;
      }
      return row;
    } catch (err) {
      ui.notifications.error("A tooltip code row produced an error!", {
        localize: true,
      });
      console.error(err);
    }
  }

  #generateGeneratorRow(token) {
    return {
      value: "",
    };
  }
}
