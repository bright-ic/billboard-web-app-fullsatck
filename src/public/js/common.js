var $spinner_container;

function display_spinner (overlay_text, overlay_container_id, overlay_color) {
    hide_spinner();

    $spinner_container = typeof overlay_container_id === "string" && overlay_container_id.trim() !== "" && $('#' + overlay_container_id)[0] ? $('#' + overlay_container_id) : $("body");
    var text = typeof overlay_text === "string" ? overlay_text : "Please wait while we process things, this may take a few seconds. <br/> DO NOT Reload the page!";
    var color = typeof overlay_color === "string" && overlay_color !== "" ? overlay_color : "#FFFFFF";

    $spinner_container.waitMe({
        effect: 'ios',
        text: text,
        bg: 'rgba(0, 0, 0, 0.7)',
        waitTime : -1,
        textPos : 'vertical',
        fontSize : '20px',
        color: color, 
        zIndex: 99999
    });
}
  
function hide_spinner() {
    if ($spinner_container) {
        $spinner_container.waitMe("hide");
    } else {
        $("body").waitMe("hide");
    }
}

/**
 * Do Form Submit Function, the following elements can be defined for the function
 * @data target_form_id - {string} - Form to Submit
 * @data action - {string} - Action to be taken when form is submited
 * @data callback - {function} - function to be executed after request is successfull
 */
function process_form_submit(target_form_id, action, callback_function) {
    var submit_url = $('#' + target_form_id).attr("action");
    var form_data = $('#' + target_form_id).serializeArray();
   
    if (typeof action !== "undefined" && action) {
        form_data.push({
            name: 'action',
            value: action
        });

        submit_url = action;
    }

    $.ajax({
        type: "POST",
        url: submit_url,
        dataType: "JSON",
        data: form_data,
        success: function (response) {
            console.log(1,response)
            var success_message;
            var redirect;
            if (typeof response !== "undefined" && response) {
                if (typeof response.success_message !== "undefined" && response.success_message) {
                    success_message = response.success_message;
                } else if (typeof response.data !== "undefined" && response.data && typeof response.data.success_message !== "undefined" && response.data.success_message) {
                    success_message = response.data.success_message;
                } else if (typeof response.message !== "undefined" && response.message) {
                    success_message = response.message;
                } else if (typeof response.data !== "undefined" && response.data && typeof response.data.message !== "undefined" && response.data.message) {
                    success_message = response.data.message;
                }

                if (typeof response.data.redirect_url !== "undefined" && response.data.redirect_url) {
                    redirect = response.data.redirect_url;
                } else if (typeof response.data !== "undefined" && response.data && typeof response.data.redirect_url !== "undefined" && response.data.redirect_url) {
                    redirect = response.data.redirect_url;
                }

            }
            console.log(success_message);

            if (typeof callback_function === "function") {
                callback_function.call(this, response);
            }else if (typeof callback_function !== "undefined" && callback_function && typeof window[callback_function] === "function") {
                window[callback_function](response);
            } else if (typeof success_message !== "undefined" && success_message) {
                hide_spinner();
                if($('#' + target_form_id + ' .submit_btn')[0]) {
                    $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
                    $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');
                }
                $('#' + target_form_id).trigger("reset");

                if (typeof redirect !== "undefined" && redirect) {
                    build_success_message(success_message, redirect);
                } else {
                    build_success_message(success_message);
                }
            } else {
                if (typeof redirect !== "undefined" && redirect) {
                    location.href = "" + redirect;
                } else {
                    hide_spinner();
                    if($('#' + target_form_id + ' .submit_btn')[0]) {
                        $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
                        $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');
                    }
                }
            }
        },
        error: function (result) {

            hide_spinner();
            if($('#' + target_form_id + ' .submit_btn')[0]) {
                $('#' + target_form_id + ' .submit_btn').attr('disabled', false);
                $('#' + target_form_id + ' .submit_btn').removeClass('is_clicked');
            }
            
            var error_data = {};
            var returned_errors = {};
            var redirect = "";
            var response = result.responseJSON;

            if (typeof callback_function === "function") {
                callback_function.call(this, response);
            } else if (typeof callback_function !== "undefined" && callback_function && typeof window[callback_function] === "function") {
                window[callback_function](response);
            } else {
                if (typeof response !== "undefined" && response) {
                    if (typeof response.errors !== "undefined" && response.errors) {
                        returned_errors = response.errors;
                    } else if (typeof response.data !== "undefined" && response.data && typeof response.data.errors !== "undefined" && response.data.errors) {
                        returned_errors = response.data.errors;
                    }

                    if (typeof response.redirect_url !== "undefined" && response.redirect_url) {
                        redirect = response.redirect_url;
                    } else if (typeof response.data !== "undefined" && response.data && typeof response.data.redirect_url !== "undefined" && response.data.redirect_url) {
                        redirect = response.data.redirect_url;
                    
                    } else if (typeof returned_errors !== "undefined" && returned_errors && typeof returned_errors.redirect_url !== "undefined" && returned_errors.redirect_url) {
                        redirect = returned_errors.redirect_url;
                        try {
                            delete returned_errors.redirect_url;
                        } catch (e) {}
                    }
                }

                if (typeof returned_errors !== "undefined" && returned_errors) {
                    error_data = returned_errors;
                } else {
                    error_data = {subject: "Sorry something went wrong!", message: "please refresh and try again."};
                }

                if (redirect) {
                    display_errors(error_data, target_form_id);
                } else {
                    display_errors(error_data, target_form_id);
                }
            }
        }
    });
}

// function to build errors and display them
function display_errors(errors, target_form_id, redirect_url, callback_function) {
    $('.error_label').remove();
    $('.errors').removeClass('errors');
    hide_spinner();
    var output_message = "";
    var display_html = "";
    var error_heading = "";
    var focused = false;
    var show_alert = false;
    var show_error_label = false;
    var j = 1;
    var no_matching_field_display_message = "";

    if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_error_label') === "no") {
        show_error_label = false;
    } else if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_error_label') === "yes") {
        show_error_label = true;
    }

    if (typeof errors === "object" && (Object.prototype.toString.call(errors) === "[object Object]" || Array.isArray(errors))) {
        $.each(errors, function (key, val) {
            if (val !== null && typeof val === 'object') {
                if (show_alert === false) {
                    show_alert = true;
                }
                var val_array = $.map(val, function (value, index) {
                    return [value];
                });

                display_html += "<h5><b>" + key + "</b></h5>";
                for (var i = 0; i < val_array.length; i++) {
                    display_html += val_array[i] + "<br/>";
                }
                j++;
            } else if (val !== null && typeof val !== 'object') {
                if (key !== null && key === 'error_heading') {
                    error_heading = val;
                    if (show_alert === false) {
                        show_alert = true;
                    }
                } else {
                    var selector = (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id).length) ? "#" + target_form_id + " [name='" + key + "']" : "[name='" + key + "']";
                    var selector_for = (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id).length) ? "#" + target_form_id + " [for='" + key + "']" : "[for='" + key + "']";
                    if (focused === false) {
                        if ($(selector)[0]) {
                            $(selector).focus();
                            focused = true;
                        }
                    }

                    if (show_alert === false) {
                        if (!$(selector).length) {
                            show_alert = true;
                        }
                    }

                    var error_label = '<div class="error_label">' + val + '</div>';

                    
                    if (key !== 'g-recaptcha-response') {
                        if ($(selector)[0]) {
                            if ($(selector).attr('type') == 'radio' || $(selector).attr('type') == 'checkbox') {
                                if (show_alert === false) {
                                    show_alert = true;
                                }
                                $(selector).parent().addClass('errors').addClass('field_errors').addClass('error-class-input ');
                                $(selector).addClass('errors').addClass('error-class-input ');
                                $(selector_for).addClass('errors');
                                no_matching_field_display_message += val + '<br/>';
                            } else if ($(selector).attr('type') == 'hidden') {
                                $(selector).addClass('errors').addClass('field_errors');
                                $(selector_for).addClass('errors').addClass('error-class-input ');
                                if (show_error_label === true) {
                                    $(selector_for).parent().after(error_label);
                                }
                            } else {
                                $(selector).addClass("errors").addClass('field_errors').addClass('error-class-input ');
                                $(selector).parent().addClass('errors').addClass('error-class-input ')
                                if (show_error_label === true) {
                                    $(selector_for).addClass('errors');
                                    $(selector).parent().append(error_label);
                                }
                            }
                        } else {
                            no_matching_field_display_message += val + '<br/>';
                        }
                    } else if (key === 'g-recaptcha-response') {
                        $('.g-recaptcha').after(error_label);
                    }

                    display_html += val + "<br/>";

                    if ($('.g-recaptcha').length) {
                        var c = $('.g-recaptcha').length;
                        for (var i = 0; i < c; i++) {
                            grecaptcha.reset(i);
                        }
                    }
                }
            }
        });
    } else {
        show_alert = true;
        if (typeof errors === "string") {
            display_html += errors;
        } else {
            display_html += "Sorry something went wrong, please refresh and try again.";
        }
    }

    if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_alert') === "no") {
        show_alert = false;
    } else if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_alert') === "yes") {
        show_alert = true;
    } else if (typeof target_form_id !== 'undefined' && target_form_id !== '' && $('#' + target_form_id)[0] && $('#' + target_form_id).data('show_alert_2') === "yes") {
        show_alert = true;
        if(show_error_label && no_matching_field_display_message === "") {
            show_alert = false;
            display_html = no_matching_field_display_message;
        }
    }

    if (show_alert === true) {
        if (typeof error_heading !== "undefined" && error_heading) {
            output_message = "<div class='error_body'><div class='error_heading'>" + error_heading + "</div>" + display_html + "</div>";
        } else {
            output_message = "<div class='error_body'>" + display_html + "</div>";
        }
        var meessage_object = {
            message: output_message,
            className: 'custom-error-bootbox-modal',
            callback: function() {
                if (typeof redirect_url === "string" && redirect_url !== "") {
                    display_spinner();
                    location.href = "" + redirect_url;
                }
                if(typeof callback_function !== "undefined") {
                    if(typeof window[callback_function] === "function") {
                        window[callback_function]();
                    } else if(typeof callback_function === "function") {
                        callback_function();
                    }
                }
            }
        }
        // console.log(bootbox, 'reached here')
        bootbox.alert(meessage_object);
    }
}


function build_errors () {
    if (!isUndefined(errors) && !empty(errors)) {
        display_errors(errors);
    } else if (!isUndefined(flash_errors) && !empty(flash_errors)) {
        display_errors(flash_errors);
    }
    
}

function build_success_message (success_message) {
        if(isObject(success_message)){
            var responses = Object.values(success_message);
            success_message = '<strong>Response(s):</strong>  "' + responses.join('",  "') + '"';
        }
        var template = `<div class='modal-body-content flex-center'>
                            <div class='response-alert-circle-box flex-center response_alert_success'>
                            <i class='fa fa-check text-white'></i>
                            </div>
                            <span>${!empty(success_message) ? success_message : "The process has completed successfully."}</span>
                        </div>`
        
        bootbox.alert({
            message: template,
            className: 'response_alert'
        })
}

function build_success () {
    if (!isUndefined(success_message) && !empty(success_message)) {
        build_success_message(success_message);
    }
}

String.prototype.ucwords = function () {
    var words = this.split(' ');
    for (var i = 0; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join(' ');
};


var isArray = (data) => {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Array]") || Array.isArray(data) ? true : false;
}

var isObject = function(data) {
    return (typeof data === "object" && Object.prototype.toString.call(data) === "[object Object]") ? true : false;
}

/**
 * Helper function that checks if supplied parameter is a string type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a string or false if it's not.
 */
var isString = function(data) {
    return typeof data === "string";
}

/**
 * Helper function that checks if supplied parameter is a number type or not.
 * @param {any} value - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is a number or false if it's not.
 */
var isNumber = function(value) {
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
var isBoolean = function(data) {
    return (typeof data === "boolean" || data === true || data === false);
}

/**
 * Helper function that checks if supplied parameter is undefined type or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is undefined or false if it's not.
 */
var isUndefined = function (data) {
    return (typeof data === "undefined" || data === undefined);
}

/**
 * Helper function that checks if supplied parameter is defined or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is defined or false if it's not.
 */
var isDefined = function (data) {
    return typeof data !== "undefined";
}

/**
 * Helper function that checks if supplied parameter is null type or not.
 * @param {any} data - Represents the data to run check on. Accepts international numbers too
 * @returns {boolean} - Returns true if supplied parameter (data) is a valid phone number or false if it's not.
 */
var isNull = function(data) {
    return (data === null ? true : false);
}

/**
 * Cloned Helper function that checks if supplied parameter is empty (has no value) or not.
 * Cloned from the isEmpty() function
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
var empty = function(data) {
    return isEmpty(data);
}

/**
 * Helper function that checks if supplied parameter is empty (has no value) or not.
 * @param {any} data - Represents the data to run check on.
 * @returns {boolean} - Returns true if supplied parameter (data) is empty or false if it's not.
 */
var isEmpty = function(data)  {
    let rtn = false;
    if (isString(data) && (data === "" || data.trim() === "")) rtn = true;
    else if (isNumber(data) && data === 0) rtn = true;
    else if (isBoolean(data) && data === false) rtn = true;
    else if (isObject(data) && Object.values(data).length === 0) rtn = true;
    else if (isArray(data) && data.length === 0) rtn = true;
    else if (isUndefined(data)) rtn = true;
    else if (isNull(data)) rtn = true;

    return rtn;
}

/**
 * Reindex a result set/array by a given key
 * @param {array} array Array to be searched
 * @param {string} key Field to search
 * Useful for taking database result sets and indexing them by id or unique_hash
 *
 */
var reindex = function(array, key = 'id') {
    const indexed_array = {};
    if (isArray(array) && !isEmpty(array)) {
        array.forEach(function(item) {
            if (isObject(item) && item.hasOwnProperty(key)) {
                indexed_array[item[key]] = item;
            }
        })
        return indexed_array;
    } else {
        return false;
    }
}

/**
 *
 * @param {string} str
 * @returns
 */
var humanize = (str) => {
    if (typeof str !== "string") return str;
    return str.trim().toLowerCase().replace(/[_]+/g, ' ').ucwords();
}
