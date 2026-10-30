/* ========================================================
   1. HERO CAROUSEL: 0.95s Push Transition, Drag/Swipe & AutoPlay
======================================================== */
const heroCarousel = document.getElementById('heroCarousel');
const heroTrack = document.getElementById('heroTrack');
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots = document.querySelectorAll('.pagination-dot');
const heroPrevBtn = document.getElementById('heroPrevBtn');
const heroNextBtn = document.getElementById('heroNextBtn');

let currentHeroIndex = 0;
const totalHeroSlides = heroSlides ? heroSlides.length : 0;

let isDragging = false;
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
let heroAutoPlayTimer = null;

function getSlideWidth() {
  return heroCarousel ? heroCarousel.clientWidth : 0;
}

function updateHeroSlide(index) {
  if (!heroTrack || totalHeroSlides === 0) return;
  currentHeroIndex = (index + totalHeroSlides) % totalHeroSlides;
  const width = getSlideWidth();
  currentTranslate = -currentHeroIndex * width;
  prevTranslate = currentTranslate;
  
  heroTrack.style.transition = 'transform 0.95s cubic-bezier(0.25, 1, 0.35, 1)';
  heroTrack.style.transform = `translateX(${currentTranslate}px)`;

  heroDots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === currentHeroIndex);
  });
}

if (heroPrevBtn && heroNextBtn) {
  heroPrevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetHeroAutoPlay();
    updateHeroSlide(currentHeroIndex - 1);
  });

  heroNextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    resetHeroAutoPlay();
    updateHeroSlide(currentHeroIndex + 1);
  });
}

heroDots.forEach(dot => {
  dot.addEventListener('click', (e) => {
    resetHeroAutoPlay();
    const targetIdx = parseInt(e.target.dataset.index, 10);
    updateHeroSlide(targetIdx);
  });
});

function touchStart(event) {
  isDragging = true;
  stopHeroAutoPlay();
  if (heroCarousel) heroCarousel.classList.add('grabbing');
  if (heroTrack) heroTrack.classList.add('is-dragging');
  startX = getPositionX(event);
  animationID = requestAnimationFrame(dragAnimation);
}

function touchEnd() {
  if (!isDragging) return;
  isDragging = false;
  if (heroCarousel) heroCarousel.classList.remove('grabbing');
  if (heroTrack) heroTrack.classList.remove('is-dragging');
  cancelAnimationFrame(animationID);

  const movedBy = currentTranslate - prevTranslate;
  const swipeThreshold = 70;

  if (movedBy < -swipeThreshold) {
    currentHeroIndex += 1;
  } else if (movedBy > swipeThreshold) {
    currentHeroIndex -= 1;
  }

  updateHeroSlide(currentHeroIndex);
  startHeroAutoPlay();
}

function touchMove(event) {
  if (isDragging) {
    const currentX = getPositionX(event);
    currentTranslate = prevTranslate + currentX - startX;
  }
}

function getPositionX(event) {
  return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function dragAnimation() {
  if (heroTrack) {
    heroTrack.style.transform = `translateX(${currentTranslate}px)`;
  }
  if (isDragging) requestAnimationFrame(dragAnimation);
}

if (heroCarousel) {
  heroCarousel.addEventListener('mousedown', touchStart);
  heroCarousel.addEventListener('touchstart', touchStart, { passive: true });
  heroCarousel.addEventListener('mouseenter', stopHeroAutoPlay);
  heroCarousel.addEventListener('mouseleave', startHeroAutoPlay);
}

window.addEventListener('mouseup', touchEnd);
window.addEventListener('touchend', touchEnd);
window.addEventListener('mousemove', touchMove);
window.addEventListener('touchmove', touchMove, { passive: true });

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  heroAutoPlayTimer = setInterval(() => {
    updateHeroSlide(currentHeroIndex + 1);
  }, 4500);
}

function stopHeroAutoPlay() {
  if (heroAutoPlayTimer) clearInterval(heroAutoPlayTimer);
}

function resetHeroAutoPlay() {
  stopHeroAutoPlay();
  startHeroAutoPlay();
}

startHeroAutoPlay();

window.addEventListener('resize', () => {
  if (heroTrack) heroTrack.style.transition = 'none';
  updateHeroSlide(currentHeroIndex);
});

/* ========================================================
   2. LATEST STORIES: Horizontal Auto-scroll & Nav Buttons
======================================================== */
const storiesTrack = document.getElementById('storiesTrack');
const storyPrevBtn = document.getElementById('storyPrevBtn');
const storyNextBtn = document.getElementById('storyNextBtn');
let storiesAutoTimer = null;

if (storyPrevBtn && storyNextBtn && storiesTrack) {
  storyPrevBtn.addEventListener('click', () => {
    stopStoriesAuto();
    storiesTrack.scrollBy({ left: -340, behavior: 'smooth' });
    startStoriesAuto();
  });

  storyNextBtn.addEventListener('click', () => {
    stopStoriesAuto();
    storiesTrack.scrollBy({ left: 340, behavior: 'smooth' });
    startStoriesAuto();
  });

  function startStoriesAuto() {
    stopStoriesAuto();
    storiesAutoTimer = setInterval(() => {
      if (storiesTrack.scrollLeft + storiesTrack.clientWidth >= storiesTrack.scrollWidth - 10) {
        storiesTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        storiesTrack.scrollBy({ left: 340, behavior: 'smooth' });
      }
    }, 4000);
  }

  function stopStoriesAuto() {
    if (storiesAutoTimer) clearInterval(storiesAutoTimer);
  }

  storiesTrack.addEventListener('mouseenter', stopStoriesAuto);
  storiesTrack.addEventListener('mouseleave', startStoriesAuto);
  startStoriesAuto();
}

/* ========================================================
   3. ADD TO CART INTERACTION & TOAST NOTIFICATION
======================================================== */
let cartItemCount = 2;
const cartCountBadge = document.getElementById('cartCountBadge');
const cartToast = document.getElementById('cartToast');
const toastMsg = document.getElementById('toastMsg');
let toastTimeout;

function addToCart(productName) {
  cartItemCount++;
  if (cartCountBadge) {
    cartCountBadge.textContent = cartItemCount;
  }
  showToast(`Added "${productName}" to bag`);
}

function showToast(message) {
  if (!cartToast) return;
  toastMsg.textContent = message;
  cartToast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    cartToast.classList.remove('show');
  }, 2600);
}