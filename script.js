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

/* ========================================================
   Seamless Infinite Loop Carousel (No Empty Space)
   ======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const wrapper = document.getElementById('reviewCarouselWrapper');
  const track = document.getElementById('reviewTrack');
  const prevBtn = document.getElementById('reviewPrevBtn');
  const nextBtn = document.getElementById('reviewNextBtn');

  if (!wrapper || !track) return;

  const originalCards = Array.from(track.children);
  const totalOriginal = originalCards.length;
  if (totalOriginal === 0) return;

  // 1. 대형 화면(100vw)에서도 여백이 생기지 않도록 앞뒤로 2세트씩 충분히 복제 (총 5세트 구성)
  // 뒤쪽에 2세트 추가
  for (let s = 0; s < 2; s++) {
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      track.appendChild(clone);
    });
  }
  // 앞쪽에 2세트 추가
  for (let s = 0; s < 2; s++) {
    for (let i = totalOriginal - 1; i >= 0; i--) {
      const clone = originalCards[i].cloneNode(true);
      track.insertBefore(clone, track.firstChild);
    }
  }

  const allCards = Array.from(track.children);
  // 정중앙 세트(세 번째 세트)의 첫 카드부터 시작
  let currentIndex = totalOriginal * 2;
  let autoTimer = null;
  let isInteracting = false;

  // 2. 카드 이동 함수
  function goToCard(index, smooth = true) {
    currentIndex = index;
    const targetCard = allCards[currentIndex];
    if (!targetCard) return;

    const cardOffsetLeft = targetCard.offsetLeft;
    const cardWidth = targetCard.offsetWidth;
    const wrapperWidth = wrapper.offsetWidth;
    const targetScroll = cardOffsetLeft - (wrapperWidth / 2) + (cardWidth / 2);

    if (smooth) {
      wrapper.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    } else {
      wrapper.scrollLeft = targetScroll;
    }

    updateCenterHighlight();
  }

  // 3. 중앙 카드 확대 클래스 (is-center) 부여
  function updateCenterHighlight() {
    allCards.forEach((card, idx) => {
      if (idx === currentIndex) {
        card.classList.add('is-center');
      } else {
        card.classList.remove('is-center');
      }
    });
  }

  // 4. 무한 경계 체크: 너무 앞이나 뒤로 갔을 때 눈에 띄지 않게 가운데 세트로 순간 이동
  let scrollCheckTimer;
  wrapper.addEventListener('scroll', () => {
    clearTimeout(scrollCheckTimer);
    scrollCheckTimer = setTimeout(() => {
      // 오른쪽 끝 세트로 진입했을 때 -> 중앙 세트로 순간 복귀
      if (currentIndex >= totalOriginal * 3) {
        currentIndex = currentIndex - totalOriginal;
        goToCard(currentIndex, false);
      }
      // 왼쪽 끝 세트로 진입했을 때 -> 중앙 세트로 순간 복귀
      else if (currentIndex < totalOriginal) {
        currentIndex = currentIndex + totalOriginal;
        goToCard(currentIndex, false);
      }
    }, 150);
  });

  // 5. 좌우 버튼 클릭 이동
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      resetTimer();
      goToCard(currentIndex + 1, true);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      resetTimer();
      goToCard(currentIndex - 1, true);
    });
  }

  // 6. 3.2초마다 1장씩 자동 슬라이드
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      if (!isInteracting) {
        goToCard(currentIndex + 1, true);
      }
    }, 2200);
  }

  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
  }

  function resetTimer() {
    stopAuto();
    startAuto();
  }

  wrapper.addEventListener('mouseenter', () => { isInteracting = true; });
  wrapper.addEventListener('mouseleave', () => {
    isInteracting = false;
    startAuto();
  });

  // 7. 마우스 드래그 & 터치 스와이프
  let isDown = false;
  let startX;
  let initialScroll;

  wrapper.addEventListener('mousedown', (e) => {
    isDown = true;
    isInteracting = true;
    stopAuto();
    wrapper.classList.add('active-drag');
    startX = e.pageX - wrapper.offsetLeft;
    initialScroll = wrapper.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    if (!isDown) return;
    isDown = false;
    wrapper.classList.remove('active-drag');
    snapToClosest();
    isInteracting = false;
    startAuto();
  });

  wrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - wrapper.offsetLeft;
    const walk = (x - startX) * 1.3;
    wrapper.scrollLeft = initialScroll - walk;
  });

  // 가장 가까운 카드를 찾아 스냅
  function snapToClosest() {
    const wrapperCenter = wrapper.getBoundingClientRect().left + wrapper.offsetWidth / 2;
    let closestIndex = currentIndex;
    let minDiff = Infinity;

    allCards.forEach((card, idx) => {
      const cardCenter = card.getBoundingClientRect().left + card.offsetWidth / 2;
      const diff = Math.abs(wrapperCenter - cardCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = idx;
      }
    });

    goToCard(closestIndex, true);
  }

  // 모바일 터치 대응
  wrapper.addEventListener('touchstart', () => {
    isInteracting = true;
    stopAuto();
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    snapToClosest();
    isInteracting = false;
    startAuto();
  }, { passive: true });

  // 초기 렌더링 시 중앙 세트 위치로 즉시 세팅
  setTimeout(() => {
    goToCard(currentIndex, false);
    startAuto();
  }, 100);
});