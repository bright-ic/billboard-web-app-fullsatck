
$(function() {
  $('.tabs-area-container .nav-item .nav-link').on('shown.bs.tab', function() {
    $('.tabs-area-container .nav-item .nav-item').removeClass('current_active');
    
     $('.tabs-area-container .nav-item').removeClass('current_active');

    $(this).closest('.nav-item').addClass('current_active');
  });

  // Optional: set the initial active tab on page load
  $('.tabs-area-container .nav-item .nav-link.active').each(function() {
    $(this).closest('.nav-item').addClass('current_active');
  });
});


// Feature section custom navigation control 
// Get back to fix this, hiding carousel by default or on page load
  // document.addEventListener('DOMContentLoaded', () => {
  //   const carousel = document.getElementById('cardCarousel');
  //   const nextBtn = document.getElementById('nextBtn');
  //   const prevBtn = document.getElementById('prevBtn');
  //   const bsCarousel = new bootstrap.Carousel(carousel, { interval: false });
  
  //   nextBtn.addEventListener('click', () => bsCarousel.next());
  //   prevBtn.addEventListener('click', () => bsCarousel.prev());
  // });


  // Faqs accordion
$(document).ready(function () {

  $('.accordion-header').on('click', function () {
    $('.accordion-header').removeClass('active');
    $(".panel").not($(this).closest('.accordion-item').find('.panel')).removeClass("active").css("max-height", null);

    //  $('.panel').css('max-height', '0');
    $(this).toggleClass('active');

    var $panel = $(this).closest('.accordion-item').find('.panel').first();

    if ($panel.css('max-height') !== '0px' && $panel.css('max-height') !== 'none') {
      $panel.css('max-height', '0');  $panel.removeClass("active");
    } else {
      $panel.css('max-height', '98' + 'px'); $panel.addClass("active");
    }
  });

  var yearSpan = document.querySelector('.current_year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

 
 if ($('.amount-btn').length) {
    $('.amount-btn').on('click', function() {
      let selectedAmount = $(this).val().replace(/[^\d]/g, ''); 
      $('#select_amount').val(selectedAmount);
    });
  }
 
  $(document).ready(function () {
    $('.input-icon').on('click', async function () {
      try {
        const text = await navigator.clipboard.readText();

        // Find the closest input before or inside the same group
        const input = $(this).siblings('.paste_target').length
          ? $(this).siblings('.paste_target')
          : $(this).closest('.input-group').find('.paste_target');

        input.val(text);
      } catch (err) {
        alert('Clipboard access failed. Make sure your browser allows clipboard permissions.');
        console.error(err);
      }
    });
  });
  

  
const sidebar = document.getElementById('mobileSidebar');
const toggle = document.getElementById('sidebarToggle');
const backdrop = document.getElementById('sidebarBackdrop');
const icon = document.getElementById('menuIcon'); 

toggle.addEventListener('click', () => {
  const sidebarVisible = sidebar.classList.toggle('show');
  backdrop.classList.toggle('show');
 if (sidebar.classList.contains('show')) {
    icon.classList.remove('fa-bars-staggered');
    icon.classList.add('fa-xmark');
  } else {
    icon.classList.remove('fa-xmark');
    icon.classList.add('fa-bars-staggered');
  }
});

backdrop.addEventListener('click', () => {
  sidebar.classList.remove('show');
  backdrop.classList.remove('show');
  icon.classList.remove('fa-xmark');
  icon.classList.add('fa-bars-staggered');
});




// Temperary validations, subjected to be removed
 $('.recharge-electricity').on('submit', function (e) {
    e.preventDefault();

    let isValid = true;
    $('#loader').show();

    $(this).find('input').each(function () {
      if ($.trim($(this).val()) === '') {
        isValid = false;
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid');
      }
    });

    if (isValid) {
      setTimeout(function () {
        $('#loader').hide();

         $('#payment_popup .modal-content')
        .removeClass()
        .addClass('modal-content recharge-electricity-modal');

        const modal = new bootstrap.Modal(document.getElementById('payment_popup'));
        modal.show();
      }, 500); // simulate delay
    } else {
      $('#loader').hide();
    }
  });

  $('input[name="payment_selection"]').on('change', function () {
    $('.payment-selection-wrapper .form-control').removeClass('active');
    $(this).closest('.form-control').addClass('active');
  });

document.querySelectorAll('.payment-selection-option').forEach(option => {
  option.addEventListener('click', function () {
    
    document.querySelectorAll('.payment-selection-option').forEach(opt => opt.classList.remove('active'));

    this.classList.add('active');
    const radio = this.querySelector('input[name="payment_selection"]');
    if (radio) radio.checked = true;
  });
});



   $('.login_form').on('submit', function (e) {
    e.preventDefault();

    let isValid = true;
    $('#loader').show();

    $(this).find('input').each(function () {
      if ($.trim($(this).val()) === '') {
        isValid = false;
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid');
      }
    });

    if (isValid) {
      setTimeout(function () {
        $('#loader').hide();

         $('#otp_modal .modal-content')
        .removeClass()
        .addClass('modal-content otp_modal');

        const modal = new bootstrap.Modal(document.getElementById('otp_modal'));
        modal.show();
      }, 500); // simulate delay
    } else {
      $('#loader').hide();
    }
  });

$('.request_form').on('submit', function (e) {
    e.preventDefault();

    let isValid = true;
    $('#loader').show();

    $(this).find('input').each(function () {
      if ($.trim($(this).val()) === '') {
        isValid = false;
        $(this).addClass('is-invalid');
      } else {
        $(this).removeClass('is-invalid');
      }
    });

    if (isValid) {
      setTimeout(function () {
        $('#loader').hide();

         $('#request_sent_modal .modal-content')
        .removeClass()
        .addClass('modal-content  request_sent_modal');

        const modal = new bootstrap.Modal(document.getElementById('request_sent_modal'));
        modal.show();
      }, 500); // simulate delay
    } else {
      $('#loader').hide();
    }
  });

 
  

  $('.chevron-holder').on('click', function (e) {
    e.preventDefault();

  
    $('#loader').show();
      setTimeout(function () {
        $('#loader').hide();

         $('#transfer_confirmation_modal .modal-content')
        .removeClass()
        .addClass('modal-content transfer_confirmation_modal');

        const modal = new bootstrap.Modal(document.getElementById('transfer_confirmation_modal'));
        modal.show();
      }, 500); 
  });


  // otp input to skip to next when number is entered
  document.querySelectorAll('.code-input').forEach((input, index, inputs) => {
  input.addEventListener('input', () => {
    if (input.value.length === 1 && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === "Backspace" && input.value === '' && index > 0) {
      inputs[index - 1].focus();
    }
  });
});

  // document.querySelectorAll('.method-option input[type=radio]').forEach(radio => {
  //   radio.addEventListener('change', function () {
  //     document.querySelectorAll('.method-option').forEach(opt => opt.classList.remove('active'));
  //     this.closest('.method-option').classList.add('active');
  //   });
  // });

 const tabs = document.querySelectorAll('.method-option');
  const tabContents = document.querySelectorAll('.tab-pane-content');

  tabs.forEach(tab => {
    // Handle tab click
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

const selectedTabId = tab.getAttribute('data-tab');
if (selectedTabId) {
  tabContents.forEach(content => {
    content.classList.add('d-none');
    content.classList.remove('active'); 
  });

  const contentToShow = document.getElementById(selectedTabId);
  if (contentToShow) {
    contentToShow.classList.remove('d-none');
    contentToShow.classList.add('active'); 
  }
}

const radio = tab.querySelector('input[type=radio]');
if (radio) radio.checked = true; });
  });

 

});
