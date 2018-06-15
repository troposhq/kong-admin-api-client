/**
 * Removes all keys from an object that are undefined, null, or ''
 *
 * @returns {Object} the object with keys omitted
 */

exports.omitEmpty = function omitEmpty(obj) {
  return Object.keys(obj).reduce((p, c) => {
    const r = { ...p };
    if (obj[c] !== undefined && obj[c] !== null && obj[c] !== '') {
      r[c] = obj[c];
    }

    return r;
  }, {});
};
