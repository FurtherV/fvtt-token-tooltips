import { MODULE_TITLE } from "./constants.mjs";

const { SchemaField, ArrayField, EmbeddedDataField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Logging                                     */
/* -------------------------------------------- */

/**
 * Logs a styled console message with the module title as prefix.
 *
 * @param {string} message - Message to display.
 * @param {object} [options={}] - Optional settings.
 * @param {string} [options.color="#0b8000"] - Log message color.
 * @param {any[]} [options.extras=[]] - Additional arguments for the log.
 * @param {string} [options.level="log"] - Console method (log, warn, error, etc).
 */
export function log(message, { color = "#a7cc00", extras = [], level = "log" } = {}) {
  console[level](
    `%c${MODULE_TITLE} | %c${message}`,
    `color: ${color}; font-weight: bold;`,
    "color: revert",
    ...extras,
  );
}

/* -------------------------------------------- */
/*  OTher                                       */
/* -------------------------------------------- */

export function pascalToWords(str) {
  return str.replace(/([A-Z])/g, " $1").trim();
}

export function slugify(str) {
  return str.slugify();
}

export function makeField(schema, source, path, options = {}) {
  let field = schema.getField(path);
  let value = foundry.utils.getProperty(source, path);

  return {
    field: field,
    value: value,
    ...options,
  };
}

/**
 * Get the centers of all grid spaces that overlap with a token document.
 * @param {Token} token     The token document on the scene.
 * @returns {object[]}        An array of xy coordinates.
 * @author krbz999
 */
export function collectTokenCenters(token) {
  const points = [];
  const shape = token.shape;
  const [i, j, i1, j1] = canvas.grid.getOffsetRange(token.bounds);
  const delta =
    canvas.grid.type === CONST.GRID_TYPES.GRIDLESS ? canvas.dimensions.size : 1;
  const offset =
    canvas.grid.type === CONST.GRID_TYPES.GRIDLESS
      ? canvas.dimensions.size / 2
      : 0;
  for (let x = i; x < i1; x += delta) {
    for (let y = j; y < j1; y += delta) {
      const point = canvas.grid.getCenterPoint({
        i: x + offset,
        j: y + offset,
      });
      const p = {
        x: point.x - token.document.x,
        y: point.y - token.document.y,
      };
      if (shape.contains(p.x, p.y)) points.push(point);
    }
  }
  return points;
}

/**
 * Calculates the minimum distance between a token and an arbitary point in a scene.
 * @param {Token} tokenA
 * @param {*} point
 * @param {Scene} scene
 * @author krbz999
 * @returns {number} minimum distance between token and point on scene.
 */
export function minimumDistanceBetweenTokenAndPoint(tokenA, point, scene) {
  if ((tokenA == null) || (point == null) || (scene == null)) {
    return NaN;
  }

  const centersTokenA = collectTokenCenters(tokenA);
  const distances = centersTokenA.map(
    (a) => scene.grid.measurePath([a, point]).distance,
  );

  return Math.min(...distances);
}

/**
 * Calculates the minimum distance between two tokens.
 * @param {Token} tokenA
 * @param {Token} tokenB
 * @param {Scene} scene
 * @author krbz999
 * @returns {number} minimum distance between the tokens.
 */
export function minimumDistanceBetweenTokens(tokenA, tokenB, scene) {
  if ((tokenA == null) || (tokenB == null) || (scene == null)) {
    return NaN;
  }

  const centersTokenA = collectTokenCenters(tokenA);
  const centersTokenB = collectTokenCenters(tokenB);
  const distances = centersTokenA.flatMap((a) =>
    centersTokenB.map((b) => scene.grid.measurePath([a, b]).distance),
  );

  return Math.min(...distances);
}
