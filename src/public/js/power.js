$(function() {
    
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

    if($('#btn_validate_meter')[0]) {
        var validated_meter = function(response) {
            hide_spinner();
            console.log(response);
            if(!response) return;
            if(typeof response.success === "boolean" && response.success) {
                // success
                var data = response.data || {};
                if($('.purchase_power_form_section')[0]) {
                    $('.purchase_power_form_section').slideUp('slow');
                }
                if($('.transaction_ref_section')[0]) {
                    if($('#transaction_ref_con')[0]) {
                        $('#transaction_ref_con').text(!empty(data.transaction_reference) ? data.transaction_reference : '')
                    }
                    var details_html = '';
                    if(data.name) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Name: </div><div class="text-container">'+data.name+'</div>'
                        details_html += '</div>';
                        if($('form#purchase_power_form')[0]) {
                            if($('form#purchase_power_form input[name="customer_name"]')[0]) {
                                $('form#purchase_power_form input[name="customer_name"]').val(name);
                            } else {
                                $('form#purchase_power_form').append('<input type="hidden" name="customer_name" value="'+name+'" />');
                            }
                        }
                    }
                    if(data.address) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Address: </div><div class="text-container">'+data.address+'</div>'
                        details_html += '</div>';
                    }
                    if(data.email) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Email: </div><div class="text-container">'+data.email+'</div>'
                        details_html += '</div>';
                    }
                    if(data.phoneNumber) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Phone: </div><div class="text-container">'+data.phoneNumber+'</div>'
                        details_html += '</div>';
                        if($('form#purchase_power_form')[0]) {
                            if($('form#purchase_power_form input[name="customer_phone"]')[0]) {
                                $('form#purchase_power_form input[name="customer_phone"]').val(phoneNumber);
                            } else {
                                $('form#purchase_power_form').append('<input type="hidden" name="customer_phone" value="'+phoneNumber+'" />');
                            }
                        }
                    }
                    if(data.disco) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Disco: </div><div class="text-container">'+data.disco+'</div>'
                        details_html += '</div>';
                    }
                    if(data.account_type) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Account Type: </div><div class="text-container">'+data.account_type+'</div>'
                        details_html += '</div>';
                    }
                    if(data.metre_no) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Meter No: </div><div class="text-container">'+metre_no+'</div>'
                        details_html += '</div>';
                    }
                    if(typeof data.arrear !== "undefined") {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Arears: </div><div class="text-container">'+arrear+'</div>'
                        details_html += '</div>';
                    }
                    if(data.current_amount) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Amount: </div><div class="text-container">'+current_amount+'</div>'
                        details_html += '</div>';
                    }
                    if(data.customer_phone_number) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Customer Phone: </div><div class="text-container">'+customer_phone_number+'</div>'
                        details_html += '</div>';
                    }
                    if(data.customer_email) {
                        details_html += '<div class="flex-container">'
                        details_html += '<div class="label-container">Customer Email: </div><div class="text-container">'+customer_email+'</div>'
                        details_html += '</div>';
                    }
                    if($('.transaction_ref_section .meter_details')[0]) {
                        $('.transaction_ref_section .meter_details').html(details_html);
                    }
                    $('.transaction_ref_section').slideDown('slow');
                }
                return;
            }
            // Error 
            var returned_errors = {};
            var redirect;
            if (typeof response.errors !== "undefined" && response.errors) {
                returned_errors = response.errors;
            } else if (typeof response.data !== "undefined" && response.data && typeof response.data.errors !== "undefined" && response.data.errors) {
                returned_errors = response.data.errors;
            }

            if(!empty(returned_errors)) {
                if (typeof returned_errors.redirect_url !== "undefined" && returned_errors.redirect_url) {
                    redirect = returned_errors.redirect_url;
                    delete returned_errors.redirect_url;
                }
            } else {
                returned_errors = {error: "Sorry, unfortunately we could not process your request due to an error that occurred. Tru again later"};
            }
            display_errors(returned_errors, 'purchase_power_form', redirect);
        }
        $('#btn_validate_meter').on('click', function() {
            display_spinner();
            do_form_submit('purchase_power_form', null, validated_meter)
        })
    }
})