
/**
 * Noop for now, but it's better to use it from beginning.
 *
 * @param {String} text
 * @return {String}
 */
export function gettext(text) {
    return text;
}

/**
 * Return date formatted for lists
 *
 * @param {String} dateString
 * @return {String}
 */
export function shortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
}
