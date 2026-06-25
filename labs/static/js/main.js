/* Лабораторная 1: навигация и слайдшоу (CSS + JavaScript) */

document.addEventListener('DOMContentLoaded', function () {
  initMobileNav();
  initSlideshow();
});

function initMobileNav() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    nav.classList.toggle('open');
    toggle.textContent = nav.classList.contains('open') ? '✕ Закрыть' : '☰ Меню';
  });
}

function initSlideshow() {
  var slides = document.querySelectorAll('.slide');
  if (slides.length === 0) return;

  var current = 0;

  function showSlide(index) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle('active', i === index);
    });
    current = index;
  }

  var prevBtn = document.querySelector('.slide-prev');
  var nextBtn = document.querySelector('.slide-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      showSlide((current - 1 + slides.length) % slides.length);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      showSlide((current + 1) % slides.length);
    });
  }

  setInterval(function () {
    showSlide((current + 1) % slides.length);
  }, 5000);

  showSlide(0);
}
