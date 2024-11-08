/**
 * Checks the parameter to see if it is a a String.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a String0, false otherwise
 */
function isString(candidate: any): candidate is string {
    return typeof candidate === 'string';
}

/**
 * Checks the parameter to see if it is a a String with a length greater than 0.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a String with a length greater than 0, false otherwise
 */
function isStringProvided(candidate: any): boolean {
    return isString(candidate) && candidate.length > 0;
}

/**
 * Checks the parameter to see if it can be converted into a number.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter is a number, false otherwise
 */
function isNumberProvided(candidate: any): boolean {
    return (
        isNumber(candidate) ||
        (candidate != null &&
            candidate != '' &&
            !isNaN(Number(candidate.toString())))
    );
}

/**
 * Helper
 * @param x data value to check the type of
 * @returns true if the type of x is a number, false otherise
 */
function isNumber(x: any): x is number {
    return typeof x === 'number';
}

/**
 * Checks the parameter to see if it can be a valid isbn13.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter could be a valid isbn13, false otherwise
 */
function isValidISBN(candidate: any): boolean {
    candidate = candidate.trim();
    return candidate && candidate.length === 13 && isNumberProvided(candidate);
}
/**
 * Checks the parameter to see if it can be a valid date. Valid dates are published in C.E.
 * and no later than 5 years in the future from the present year. The extra 5 years are for
 * planned publishings (to be released soon).
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter could be a valid publication year, false otherwise
 */
function isValidPublicationYear(candidate: any): boolean {
    candidate = candidate.trim();
    if (!isNumberProvided(candidate)) return false;
    const currentYear = new Date().getFullYear();
    const plannedPublishingBuffer = 5;
    return (
        Number.isInteger(candidate) &&
        candidate >= 0 &&
        candidate <= currentYear + plannedPublishingBuffer
    );
}

/**
 * Checks the parameter to see if it can be a valid imageURL.
 *
 * @param {any} candidate the value to check
 * @returns true if the parameter could be a valid imageURL, false otherwise
 */
function isValidImageUrl(candidate: any): boolean {
    if (typeof candidate !== 'string') return false;
    // Regular expression to match typical URL patterns and image file extensions
    const urlPattern: RegExp =
        /^(https?:\/\/[^\s/$.?#].[^\s]*\.(?:png|jpg|jpeg|gif|bmp|webp|svg))$/i;
    return urlPattern.test(candidate);
}

// Add more/your own password validation here. The *rules* must be documented
// and the client-side validation should match these rules.
const isValidPassword = (password: string): boolean =>
    isStringProvided(password) && password.length > 7;

const isDefined = (param: any): boolean =>
    param !== undefined && param !== null;
// Feel free to add your own validations functions!
// for example: isNumericProvided, isValidPassword, isValidEmail, etc
// don't forget to export any

const validationFunctions = {
    isStringProvided,
    isNumberProvided,
    isValidISBN,
    isValidPublicationYear,
    isValidImageUrl,
    isValidPassword,
    isDefined,
};

export { validationFunctions };
