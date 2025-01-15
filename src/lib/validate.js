const _ = require('lodash');
const ValidatorJs = require('validatorjs');
const validator = require('validator');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
const acceptableNamesRegex = /^[a-zA-Z]+[a-zA-Z .,'‘’´′-]*$/u;
const { array_diff, verify_phone_number, empty, isString, humanize } = require('./utility_js');

// Password regex
ValidatorJs.register('strict', value => passwordRegex.test(value),
  'Your :attribute must contain at least one uppercase letter, one lowercase letter and one number');

// No funny characters in name regex
ValidatorJs.register('strict_name', value => acceptableNamesRegex.test(value),
  'Your :attribute contains invalid characters');

// No number values in name regex
ValidatorJs.registerAsync('valid_name', function (value, attribute, req, passes) {
  if (/\d/.test(value)) {
    let message = `Your ${humanize(req)} cannot contain numbers`;
    passes(false, message);
    return;
  }
  passes();
})

// No html entities
ValidatorJs.register('no_html', value => !(/<\/?[a-z][\s\S]*>/i.test(value)),
  'Your :attribute contains invalid characters');


// Multi-inclusion
ValidatorJs.registerAsync('multi_inclusion', function (value, attribute, req, passes) {
  if (!attribute) {
    passes(false, `Sorry, we could not validate the ${attribute}`);
    return;
  }
  //split options
  const availableOptions = attribute.split(",,,");

  // values to be compared start from attr[0]
  if (empty(availableOptions) || !_.isArray(availableOptions)) {
    passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
    return;
  }

  let message = "";
  if (!empty(value) && _.isArray(value)) {
    const intersect_check = array_diff(value, availableOptions);
    if (empty(intersect_check)) {
      passes();
      return;
    }

    try {
      message = `Value(s) (${_.join(intersect_check, ",")}) is not in the list of ${(!empty(req) ? req : attribute)} options`;
    } catch (e) {
      message = "We couldn't find your selected value(s) in " + (!empty(req) ? req : attribute);
    }
    passes(false, message);
    return;
  }else if (!empty(value) && _.isString(value)) {
    if (availableOptions.indexOf(value)>-1) {
      passes();
      return;
    }
    try {
      message = `Value (${value}) is not in the list of ${(!empty(req) ? req : attribute)} options`;
    } catch (e) {
      message = "We couldn't find your selected value in " + (!empty(req) ? req : attribute);
    }
    passes(false, message);
    return;
  }
  passes();
})

/**
 * Checks if incoming phone number value is valid
*/
ValidatorJs.registerAsync('phone_number', function (value, attribute, req, passes) {
  if (!attribute) {
    passes(false, `Sorry, we could not validate the ${req}`);
    return;
  }
  let message = "";
  if (!(value.length >= 10 && value.length <= 15 && /^[+]?[0-9]+$/g.test(value))) {
    message = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456)';
    passes(false, message);
    return;
  } else if (value.length === 10 && value.substr(0, 1) === "+") {
    message = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456). If Phone Number starts with +, it must be followed by at least 10 numerical numbers.';
    passes(false, message);
    return;
  }
  passes();
})

/**
 * Checks if incoming phone number value is valid
*/
ValidatorJs.registerAsync('valid_phone', function (value, attribute, req, passes) {

  let message = "";
  if (!(value.length >= 10 && value.length <= 15 && /^[+]?[0-9]+$/g.test(value))) {
    message = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456)';
    passes(false, message);
    return;
  } else if (value.length === 10 && value.substr(0, 1) === "+") {
    message = 'Please enter a Valid Phone Number (10 to 15 numerical numbers with or without a leading "+". e.g. 12301234567 or +447911123456). If Phone Number starts with +, it must be followed by at least 10 numerical numbers.';
    passes(false, message);
    return;
  }
  passes();
})

// Req Exp pattern
ValidatorJs.register('pattern', (value, attribute) => {
  const regExp = new RegExp(attribute);
  return regExp.test(value)
}, 'Your :attribute contains invalid characters');

// JSON Array
ValidatorJs.registerAsync('json_array', (value, attribute, req, passes) => {
  try {
    if (Array.isArray(JSON.parse(value))) return passes();
  } catch (e) { }
  return passes(false)
});

/**
 * convert attribute to readable name e.g. email_address to email address
 */
ValidatorJs.setAttributeFormatter(function (attribute) {
  return _.startCase(_.camelCase(attribute));
});

/**
	 * convert mongoose errors to errors that can be displayed
	 * @param validator_errors
	 * @return {any}
	 */
const flattenValidatorErrors = (validator_errors) => {
  let returnErrors = {};
  if ((typeof validator_errors === "object" && Object.prototype.toString.call(validator_errors) === "[object Object]")) {
    _.each(validator_errors, (errorVal, errorKey) => {
      if (_.isArray(errorVal)) {
        returnErrors[errorKey] = errorVal[0];
      } else if (_.isString(errorVal)) {
        returnErrors[errorKey] = errorVal;
      }
    });
  }
  return JSON.parse(JSON.stringify(returnErrors));
}

/**
     * uniform expectation of failed response data
     * @param data
     * @return mixed
     */
const sendFailedResponse = (data) => {
  const returnData = { success: false, data: '' };
  if (!_.isUndefined(data)) {
      returnData.data = data;
  }
  return returnData;
}

/**
* uniform expectation of successful response data
* @param data
* @return mixed
*/
const sendSuccessResponse = (data) => {
  const returnData = { success: true, data: '' };
  if (!_.isUndefined(data)) {
      returnData.data = data;
  }
  return returnData;
}

/**
 * updating validate function to return errors rather than use a call back for clean await/async functionality
 * @param body
 * @param rules
 * @param customMessages
 * @return {{data: *, success: boolean}}
 */
const validateData = async (body, rules, customMessages) => {

  const validation = new ValidatorJs(body, rules, customMessages);
  return new Promise((resolve, reject) => {
    if (validation.hasAsync) {
      validation.checkAsync(() => resolve({ success: true, data: {} }), () =>
        // flattened validation response i.e. errors - email[0] = 'Email Error', email[1] = 'Another Error'
        // converted to email = 'Email Error' loses email[1] and any others, deal with first issue
        resolve(sendFailedResponse(flattenValidatorErrors(validation.errors.errors)))
      );
    } else {
      validation.passes(() => resolve({ success: true, data: {} }));
      validation.fails(() => resolve(sendFailedResponse(flattenValidatorErrors(validation.errors.errors))));
    }
  });
};

module.exports = validateData;
