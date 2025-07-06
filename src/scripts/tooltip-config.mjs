import { MODULE_ID, TEMPLATE_FOLDER_PATH } from "./constants.mjs";
import { TooltipAttributeModel } from "./tooltip-attribute-model.mjs";
import { TooltipConfigModel } from "./tooltip-config-model.mjs";
import { makeField, pascalToWords, slugify } from "./utils.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } =
  foundry.applications.api;

export class TooltipConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);

    /** @type {TooltipConfigModel} */
    this.object = game.settings.get(MODULE_ID, "tooltipConfig").clone();
  }

  static DEFAULT_OPTIONS = {
    tag: "form",
    id: `${MODULE_ID}-${slugify(pascalToWords(this.name))}`,
    classes: [
      MODULE_ID,
      slugify(pascalToWords(this.name)),
      "dnd5e2",
      "standard-form",
    ],
    position: {
      width: 1000,
      height: "auto",
    },
    window: {
      title: "Configure Tooltips",
    },
    form: {
      handler: TooltipConfig.formHandler,
      submitOnChange: true,
      closeOnSubmit: false,
    },
    actions: {
      addRow: TooltipConfig.addRow,
      removeRow: TooltipConfig.removeRow,
      openEditor: TooltipConfig.openEditor,
      export: TooltipConfig.export,
      import: TooltipConfig.importDialog,
    },
  };

  static PARTS = {
    config: {
      template: `${TEMPLATE_FOLDER_PATH}/tooltip-config/config.hbs`,
    },
    attributes: {
      template: `${TEMPLATE_FOLDER_PATH}/tooltip-config/attributes.hbs`,
    },
    footer: {
      template: "templates/generic/form-footer.hbs",
    },
  };

  /** @inheritdoc */
  async _renderFrame(options) {
    const frame = await super._renderFrame(options);

    const exportLabel = "Export";
    const exportButton = `<button type="button" class="header-control icon fa-solid fa-file-export" data-action="export" data-tooltip="${exportLabel}" aria-label="${exportLabel}"></button>`;
    this.window.close.insertAdjacentHTML("beforebegin", exportButton);

    const importLabel = "Import";
    const importButton = `<button type="button" class="header-control icon fa-solid fa-file-import" data-action="import" data-tooltip="${importLabel}" aria-label="${importLabel}"></button>`;
    this.window.close.insertAdjacentHTML("beforebegin", importButton);

    return frame;
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);

    const schema = this.object.schema;
    const data = this.object;

    const fields = (context.fields = {});
    fields.columns = makeField(schema, data, "columns");
    fields.attributes = data.attributes.map((el, index) => {
      const innerFields = {};
      const innerSchema = schema.fields.attributes.element;
      Object.keys(innerSchema.fields).forEach((prop) => {
        innerFields[prop] = makeField(innerSchema, el, prop, {
          name: `attributes.${index}.${prop}`,
        });
      });
      return {
        fields: innerFields,
      };
    });

    context.buttons = [
      { type: "submit", icon: "fas fa-save", label: "Save Changes" },
    ];
    return context;
  }

  static async formHandler(event, form, formData) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const data = foundry.utils.expandObject(formData.object);

    const update = {
      columns: data.columns,
      attributes: Object.values(data.attributes ?? {}),
    };

    if (event.type === "submit") {
      await game.settings.set(MODULE_ID, "tooltipConfig", update);
      await this.close();
    } else {
      this.object.updateSource(update);
    }
  }

  static addRow(event, target) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const attributes = thisApp.object.attributes;
    attributes.push(new TooltipAttributeModel());
    thisApp.object.updateSource({
      attributes,
    });

    thisApp.render();
  }

  static removeRow(event, target) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const index = target.closest("li[data-index]").dataset.index;

    const attributes = thisApp.object.attributes;
    attributes.splice(index, 1);
    thisApp.object.updateSource({
      attributes,
    });

    thisApp.render();
  }

  static async openEditor(event, target) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const index = target.closest("li[data-index]").dataset.index;
    const attributes = thisApp.object.attributes;
    const attributeWithIndex = attributes[index];

    const text = await DialogV2.prompt({
      window: {
        title: "Editor",
      },
      content: await foundry.applications.handlebars.renderTemplate(`${TEMPLATE_FOLDER_PATH}/editor.hbs`, {
        text: attributeWithIndex.path,
      }),
      rejectClose: false,
      modal: false,
      ok: {
        callback: (event, button, dialog) => button.form.elements.text.value,
      },
    });

    attributeWithIndex.updateSource({
      path: text ?? attributeWithIndex.path ?? "",
    });

    thisApp.render();
  }

  static export(event, target) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const jsonString = JSON.stringify(thisApp.object.toJSON(), null, 2);
    const filename = "tooltip-config.json";
    saveDataToFile(jsonString, "text/json", filename);
  }

  #import(text) {
    /** @type {TooltipConfig} */
    const thisApp = this;
    thisApp.object.updateSource(JSON.parse(text));

    thisApp.render();
  }

  static async importDialog(event, target) {
    /** @type {TooltipConfig} */
    const thisApp = this;

    const files = await DialogV2.confirm({
      window: {
        title: "Import Tooltip Config",
      },
      content: await foundry.applications.handlebars.renderTemplate(
        `${TEMPLATE_FOLDER_PATH}/import-config.hbs`,
        {},
      ),
      rejectClose: false,
      modal: true,
      yes: {
        icon: `fas fa-file-import`,
        label: "Import",
        default: true,
        callback: (event, button, dialog) => button.form.elements.data.files,
      },
      no: {
        icon: `fas fa-file-import`,
        label: "Cancel",
      },
    });
    if (!files.length)
      return ui.notifications.error("You did not upload a data file!");
    foundry.utils.readTextFromFile(files[0]).then((json) => thisApp.#import(json));
  }
}
