const _ = require('lodash');
const ValidatorJs = require('validatorjs');
const validator = require('validator');
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
const acceptableNamesRegex = /^[a-zA-Z]+[a-zA-Z .,'‘’´′-]*$/u;
const BaseModel = require('../models/base');
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

/**
 * Checks if incoming value already exist for unique and non-unique fields in the database
 * e.g email: required|email|exists:users,email
*/
ValidatorJs.registerAsync('exists_in_collection', function (value, attribute, req, passes) {
  if (!attribute) {
    passes(false, `Sorry, we could not validate the ${attribute}`);
    return;
  }
  //split table and column
  const attributeArray = attribute.split(",");
  // attr[2] is optional label
  if (attributeArray.length !== 2 && attributeArray.length !== 3) {
    passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
    return;
  }
  const { 0: table, 1: column } = attributeArray;
  //attribute label, use snake case if no attributeArray[2]
  const attributeLabel = (attributeArray.length > 2) ? attributeArray[2] : _.snakeCase(column);
  const msg = (this.validator && this.validator.messages && this.validator.messages.customMessages &&
    _.has(this.validator.messages.customMessages, 'exist.' + req)) ? this.validator.messages.customMessages['exist.' + req] : `The ${attributeLabel} is already being used`;
  //check if incoming value already exists in the database
  const baseModel = new BaseModel(table, database);
  let id = '';
  if (attributeArray.length === 3 && BaseModel.isMongoId(attributeArray[2].trim())) id = attributeArray[2].trim();
  // Normalize emails and phone numbers
  if (column === "email") {
    value = validator.normalizeEmail(value);
  } else if (column === "phone_number" || column === "cell_phone") {
    value = verify_phone_number(value, true);
  }

  baseModel.getRowByField(column, value).then(response => {
    if (!empty(response) && response._id) {
      if (id !== '' && response._id.toString() === id.toString()) {
        passes();
      } else {
        passes(false, msg); // return false if value exists
      }
    } else {
      passes();
    }
  });
});

/**
 * Checks if incoming value already exist for uniqueness.
 * This exists_in_collection doesnt account for update cases and therefore will fail if even if ID is passed that matches the existing record ID
 * e.g email: required|email|exists_in_collection:users,email,database
*/
ValidatorJs.registerAsync('exists_in_collection', function (value, attribute, req, passes) {
  try {

    if (!attribute) {
      passes(false, `Sorry, we could not validate the ${attribute}`);
      return;
    }
    //split table and column
    const attributeArray = attribute.split(",");

    //Rule attribute must contain 3 to 4 split params: collection_name, collection_field, database, [id]
    if (attributeArray.length !== 3 && attributeArray.length !== 4) {
      passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
      return;
    }
    const {0: table, 1: column, 2: databaseTemp} = attributeArray;

    if (empty(table) || empty(column)) {
      passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
      return;
    }
    let database = (databaseTemp && isString(databaseTemp) && !empty(databaseTemp)) ? databaseTemp.trim() : null;
    //attribute label, use snake case if no attributeArray[2]
    const attributeLabel = _.snakeCase(column);
    const msg = (this.validator && this.validator.messages && this.validator.messages.customMessages &&
      _.has(this.validator.messages.customMessages, 'exists_in_collection.' + req)) ? this.validator.messages.customMessages['exists_in_collection.' + req] : `The ${attributeLabel} is already being used`;
    //check if incoming value already exists in the database
    const baseModel = new BaseModel(table, database);

    baseModel.getRowByField(column, value).then(response => {
      if (!empty(response) && response._id) {
        passes(false, msg); // return false if value exists
      } else {
        passes();
      }
    });
  }catch(err){
    passes(false, `Sorry, we could not validate the ${attribute}`);
  }
});

/**
 * Checks if incoming value already exist for uniqueness.
 * This is_unique_in_collection  accounts for update cases and therefore will pass  if ID is passed that matches the existing record ID
 * e.g email: required|email|is_unique_in_collection:users,email,database,id
*/
ValidatorJs.registerAsync('is_unique_in_collection', function (value, attribute, req, passes) {
  try {

    if (!attribute) {
      passes(false, `Sorry, we could not validate the ${attribute}`);
      return;
    }
    //split table and column
    const attributeArray = attribute.split(",");

    //Rule attribute must contain 3 to 4 split params: collection_name, collection_field, database, [id]
    if (attributeArray.length !== 3 && attributeArray.length !== 4) {
      passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
      return;
    }
    const {0: table, 1: column, 2: databaseTemp, 3: idTemp} = attributeArray;

    if (empty(table) || empty(column)) {
      passes(false, `Sorry, Invalid format for validation rule on ${attribute}`);
      return;
    }
    let database = (databaseTemp && isString(databaseTemp) && !empty(databaseTemp)) ? databaseTemp.trim() : null;
    let id = (idTemp && isString(idTemp) && !empty(idTemp) && BaseModel.isMongoId(idTemp)) ? idTemp.trim() : '';
    //attribute label, use snake case if no attributeArray[2]
    const attributeLabel = _.snakeCase(column);
    const msg = (this.validator && this.validator.messages && this.validator.messages.customMessages &&
      _.has(this.validator.messages.customMessages, 'is_unique_in_collection.' + req)) ? this.validator.messages.customMessages['is_unique_in_collection.' + req] : `The ${attributeLabel} is already being used`;
    //check if incoming value already exists in the database
    const baseModel = new BaseModel(table, database);

    baseModel.getRowByField(column, value).then(response => {
      if (!empty(response) && response._id) {
        if (id !== '' && response._id.toString() === id.toString()) {
          passes();
        } else {
          passes(false, msg); // return false if value exists
        }
      } else {
        passes();
      }
    });
  }catch(err){
    passes(false, `Sorry, we could not validate the ${attribute}`);
  }
});

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
