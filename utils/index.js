const chalk = require('chalk');
global.moment = require('moment-timezone');
moment.tz.setDefault('Asia/Jakarta').locale('id');
global.axios = require('axios').default;

/**
 * Get text with color
 * @param  {String} text
 * @param  {String} color
 * @return  {String} Return text with color
 */
const color = (text, color) => {
    return !color ? chalk.green(text) : color.startsWith('#') ? chalk.hex(color)(text) : chalk.keyword(color)(text);
};

/**
 * coloring background
 * @param {string} text
 * @param {string} color
 * @returns
 */
function bgColor(text, color) {
    return !color
        ? chalk.bgGreen(text)
        : color.startsWith('#')
            ? chalk.bgHex(color)(text)
            : chalk.bgKeyword(color)(text);
}

module.exports = {
    bgColor,
    color
};
