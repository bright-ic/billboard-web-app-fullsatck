$(document).ready(function () {
  //------ Homepage banner slider Start ------//
  var sequence_slide = document.querySelectorAll('.sequence-slide');
var imgs = document.querySelectorAll('.sequence-slide .sequence-bg');
var dots = document.querySelectorAll('.seq-pagination li');

var currentImg = 0;
imgs[currentImg].style.opacity = 1;
sequence_slide[currentImg].classList.add('seq-in');
dots[currentImg].classList.add('seq-current');
function changeSlide(n) {
  for (var i = 0; i < imgs.length; i++) {
    imgs[i].style.opacity = 0;
    dots[i].classList.remove('seq-current');
  sequence_slide[i].classList.remove('seq-in');
  sequence_slide[i].classList.add('seq-out');
  }

  currentImg = n;

  imgs[currentImg].style.opacity = 1;
  dots[currentImg].classList.add('seq-current');
  sequence_slide[currentImg].classList.remove('seq-out'); // Remove outgoing class
  sequence_slide[currentImg].classList.add('seq-in');
}

dots.forEach((dot, index) => {
  dot.addEventListener('click', () => changeSlide(index));
});

document.querySelector('.seq-prev').addEventListener('click', () => {

  currentImg = (currentImg - 1 + imgs.length) % imgs.length;
  changeSlide(currentImg);
});

document.querySelector('.seq-next').addEventListener('click', () => {
  currentImg = (currentImg + 1) % imgs.length;
  changeSlide(currentImg);
});

//------ Homepage banner slider End ------//


});

