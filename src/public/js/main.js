
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