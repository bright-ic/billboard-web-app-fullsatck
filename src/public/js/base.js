$(function() {
     /**
     * Submit button event handle, the following data-[attributes] can be defined for the button
     * @data waitme - {string} - Yes|No| - Load waitme overlay or not
     * @data target - {string} - Form submitted by the button
     * @data action - {string} - Action to be taken when form is submited
     */
     $('.submit_btn:not(.not_submit)').off('click').on('click', function (e) {
        e.preventDefault();
        var $this = $(this);
        // check of form has not been submitted
        if (!$this.hasClass('is_clicked')) {
            // show waitme overlay if submit button requires it
            if (typeof $this.data('waitme') !== 'undefined' && $this.data('waitme') == 'yes') {
                display_spinner();
            }
            // disable submitted button
            $this.addClass('is_clicked');
            $this.attr('disabled', 'disabled');
            $('.errors').removeClass('errors');
            $('.error_label').remove();
            // Setting Up Variables for form submission
            var action = '';
            var target_form_id = '';
            var callback_name = '';
            // Setting up action for form post submission
            if (typeof $this.data('action') !== 'undefined') {
                action = $this.data('action');
            }
            // check/get the submitted form is from the submit button
            if (typeof $this.data('target') !== 'undefined') {
                target_form_id = $this.data('target');
            }
            // check/get the success callback function
            if (typeof $this.data('callback_name') !== 'undefined') {
                callback_name = $this.data('callback_name');
            }
            // Submit Form
            if (!empty(target_form_id)) {
                // Use Ajax to Submit form
                if (!empty(action)) {
                    if (!empty(callback_name)) {
                        do_form_submit(target_form_id, action, callback_name);
                    } else {
                        do_form_submit(target_form_id, action);
                    }
                } else {
                    if (!empty(callback_name)) {
                        do_form_submit(target_form_id, null, callback_name);
                    } else {
                        do_form_submit(target_form_id);
                    }
                }
            } else {
                // Submit Form Directly
                $this.closest('form').submit();
            }
        }
    });


    if($('#purchase_power_form select[name="disco"]')[0]) {
        $('#purchase_power_form select[name="disco"]').on('change', function() {
            var selected_disco = $(this).val();
            var no_match = false;
            if(
                selected_disco && typeof all_discos_reindexed === "object" && 
                all_discos_reindexed[selected_disco] && 
                Array.isArray(all_discos_reindexed[selected_disco].supported_meter_types) && 
                !empty(all_discos_reindexed[selected_disco].supported_meter_types) &&
                $('#purchase_power_form .account_type_field_option_container')[0]
            ) {
                var html = '';
                all_discos_reindexed[selected_disco].supported_meter_types.forEach(function(supported_meter_type) {
                    if(isObject(supported_meter_type) && !empty(supported_meter_type.code)) {
                        html += '<div class="form-check form-check-inline">';
                        html += '<input class="form-check-input" type="radio" name="account_type" id="account_type_'+supported_meter_type.code+'" value="'+supported_meter_type.code+'">';
                        html += '<label class="form-check-label" for="account_type_'+supported_meter_type.code+'">'+(supported_meter_type.title ? supported_meter_type.title : supported_meter_type.code)+'</label>';
                        html += '</div>';
                    }
                });
                if(!empty(html)) {
                    $('#purchase_power_form .account_type_field_option_container').html(html);
                } else {
                    no_match = true;
                }
            } else {
                no_match = true;
                if($('#purchase_power_form .account_type_wrapper')[0]) {
                    $('#purchase_power_form .account_type_wrapper').slideUp();
                }
            }

            if(no_match) {
                $('#purchase_power_form .account_type_field_option_container').html('');
            } else if($('#purchase_power_form .account_type_wrapper')[0]) {
                $('#purchase_power_form .account_type_wrapper').slideDown();
            }
        });
    }


})