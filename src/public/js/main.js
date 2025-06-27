
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
  

});
