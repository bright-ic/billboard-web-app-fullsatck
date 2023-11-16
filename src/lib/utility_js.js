

/**
 * Computes the difference of arrays
 * @param {array} value
 * @param {array} options
 * @return {array} an array containing all the entries from value that are not present in any of the other arrays (options).
 */
exports.array_diff = (value = [], options = []) => {
    return value.filter(v => !options.includes(v));
};

/**
 * Verify phone number
 * @param {string} phone
 * @param {boolean} should_return_data
 * @returns
 */
exports.verify_phone_number = (phone, should_return_data) => {
    let allDigitPhone = phone.replace(/\D/g, "");

    if (!(allDigitPhone.length >= 10 && allDigitPhone.length <= 15 && /^[+]?[0-9]+$/g.test(allDigitPhone)) || (allDigitPhone.length === 10 && allDigitPhone.substr(0, 1) === "+")) {
        return false;
    }
    if (typeof should_return_data !== true) {
        return true;
    }
    if (allDigitPhone.startsWith("+")) {
        allDigitPhone = allDigitPhone.substring(1);
    }
    return allDigitPhone;
};

/**
 * Helper function that checks if supplied parameter is an object type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an object or false if it's not.
 */
exports.isObject = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Object]") ? true : false;
}

/**
 * Helper function that checks if supplied parameter is an array or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is an array or false if it's not.
 */
exports.isArray = (data = null) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Array]") || Array.isArray(data) ? true : false;
}

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
exports.isString = (data = null) => {
    return typeof data === "string";
}

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
exports.isNumber = (value = null) => {
    try {
        // return typeof data === "number" || /[0-9]/.test(data);
        return typeof value === 'number' && value === value && value !== Infinity && value !== -Infinity
    } catch (err) {
        return false;
    }
}

/**
 * Helper function that checks if supplied parameter is a boolean type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a booloean type or false if it's not.
 */
exports.isBoolean = (data = null) => {
    return (typeof data === "boolean" || data === true || data === false);
}

/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
exports.isUndefined = (data = null) => {
    return (typeof data === "undefined" || data === undefined);
}

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
exports.isDefined = (data = null) => {
    return typeof data !== "undefined";
}

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
exports.isNull = (data = null) => {
    return (data === null ? true : false);
}

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.empty = (data = null) => {
    return this.isEmpty(data);
}

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
exports.isEmpty = (data = null) => {
    let rtn = false;
    if (this.isString(data) && (data === "" || data.trim() === "")) rtn = true;
    else if (this.isNumber(data) && data === 0) rtn = true;
    else if (this.isBoolean(data) && data === false) rtn = true;
    else if (this.isObject(data) && Object.values(data).length === 0) rtn = true;
    else if (this.isArray(data) && data.length === 0) rtn = true;
    else if (this.isUndefined(data)) rtn = true;
    else if (this.isNull(data)) rtn = true;

    return rtn;
}

/**
 *
 * @param {string} str
 * @returns
 */
exports.humanize = (str) => {
    if (!_.isString(str)) return str;
    return this.ucwords(str.trim().toLowerCase().replace(/[_]+/g, ' '));
}
