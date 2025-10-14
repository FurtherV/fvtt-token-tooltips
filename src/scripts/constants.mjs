/**
 * @type {string}
 * @readonly
 */
const MODULE_ID = "%config.id%";

/**
 * @type {string}
 * @readonly
 */
const MODULE_TITLE = "%config.title%";

/**
 * @type {string}
 * @readonly
 */
const LANG_ID = MODULE_ID.toUpperCase();

/**
 * @enum {string}
 * @readonly
 */
const FLAG = {
  DISABLE_TOOLTIP: "disableTooltip",
};

/**
 * @type {string}
 * @readonly
 */
const LANG_SETTINGS_PATH = `${LANG_ID}.Setting`;

/**
 * @type {string}
 * @readonly
 */
const TEMPLATE_FOLDER_PATH = `/modules/${MODULE_ID}/templates`;

/**
 * @enum {string}
 * @readonly
 */
const ATTRIBUTE_TYPES = {
  PATH: "path",
  CODE: "code",
  //GENERATOR: "generator",
};

export {
  MODULE_ID,
  MODULE_TITLE,
  LANG_ID,
  FLAG,
  LANG_SETTINGS_PATH,
  TEMPLATE_FOLDER_PATH,
  ATTRIBUTE_TYPES,
};
