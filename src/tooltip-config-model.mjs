import { LANG_ID } from "./constants.mjs";
import { TooltipAttributeModel } from "./tooltip-attribute-model.mjs";

const { NumberField, EmbeddedDataField, ArrayField } = foundry.data.fields;
const { DataModel } = foundry.abstract;

export class TooltipConfigModel extends DataModel {
  static LOCALIZATION_PREFIXES = [`${LANG_ID}.Model.Tooltip.Config`];

  static defineSchema() {
    return {
      columns: new NumberField({
        required: true,
        nullable: false,
        initial: 1,
        min: 1,
        max: 4,
        step: 1,
        integer: true,
        positive: true,
      }),
      attributes: new ArrayField(new EmbeddedDataField(TooltipAttributeModel), {
        required: true,
        nullable: false,
        initial: [],
      }),
    };
  }
}
