const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navDrawerBackdrop = document.getElementById('navDrawerBackdrop');
const navInner = document.querySelector('.nav-inner');
const navLinks = document.querySelectorAll('.nav-menu a, .nav-brand, .nav-cta, .hero-actions a, .footer a');
const scrollTopBtn = document.getElementById('scrollToTop');
const contactForm = document.getElementById('contactForm');
const phoneInput = document.getElementById('phone');
const packageButtons = document.querySelectorAll('.package-card');
const selectedPackage = document.getElementById('selectedPackage');
const previewTabs = document.querySelectorAll('.preview-tab');
const previewPanes = document.querySelectorAll('.preview-pane');
const countElements = document.querySelectorAll('[data-count]');
const hero = document.querySelector('.hero');
const heroSlides = document.querySelectorAll('[data-hero-slide]');
const heroVideo = document.querySelector('[data-hero-video]');
const heroSlideshow = document.querySelector('[data-hero-slideshow]');
const heroCaption = document.querySelector('[data-hero-caption]');
const HERO_SLIDE_MS = 6500;
const NAV_DRAWER_MQ = window.matchMedia('(max-width: 1400px)');
let heroSlideTimer = null;
let heroLoopActive = true;
let navBodyOverflowPrev = '';
let navMenuHomeParent = navInner;
let navMenuHomeNext = null;

function isNavDrawerMode() {
    return NAV_DRAWER_MQ.matches;
}

function placeNavMenuForViewport() {
    if (!navMenu || !navInner) return;

    if (isNavDrawerMode()) {
        // fixed 기준을 viewport로 — navbar 밖으로 이동
        if (navMenu.parentElement !== document.body) {
            navMenuHomeParent = navMenu.parentElement;
            navMenuHomeNext = navMenu.nextSibling;
            document.body.appendChild(navMenu);
        }
        if (navDrawerBackdrop && navDrawerBackdrop.parentElement !== document.body) {
            document.body.appendChild(navDrawerBackdrop);
        }
        return;
    }

    // 데스크톱: 네비 안으로 복귀
    if (navMenu.parentElement !== navInner) {
        const anchor = navInner.querySelector('.nav-right');
        if (anchor) navInner.insertBefore(navMenu, anchor);
        else navInner.appendChild(navMenu);
    }
    if (navDrawerBackdrop && navbar && navDrawerBackdrop.parentElement !== navbar) {
        navbar.appendChild(navDrawerBackdrop);
    }
    closeMenu();
}

function clearHeroSlideTimer() {
    if (heroSlideTimer) {
        window.clearInterval(heroSlideTimer);
        heroSlideTimer = null;
    }
}

function showHeroCaption(visible) {
    if (!heroCaption) return;
    heroCaption.classList.toggle('is-visible', !!visible);
}

function activateHeroVideo() {
    if (!heroVideo) {
        revealHeroSlideshow();
        return;
    }

    clearHeroSlideTimer();
    showHeroCaption(true);

    if (heroSlideshow) {
        heroSlideshow.classList.add('is-waiting');
        heroSlideshow.classList.remove('is-active');
    }

    heroVideo.classList.add('is-active');
    try {
        heroVideo.currentTime = 0;
    } catch (_) { /* ignore */ }

    const onEnded = () => {
        heroVideo.removeEventListener('ended', onEnded);
        heroVideo.removeEventListener('error', onEnded);
        if (!heroLoopActive) return;
        revealHeroSlideshow();
    };

    heroVideo.addEventListener('ended', onEnded, { once: true });
    heroVideo.addEventListener('error', onEnded, { once: true });

    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
            // autoplay blocked → stills only, but keep looping stills
            onEnded();
        });
    }
}

function revealHeroSlideshow() {
    showHeroCaption(false);

    if (heroVideo) {
        heroVideo.classList.remove('is-active');
        try { heroVideo.pause(); } catch (_) { /* ignore */ }
    }

    if (heroSlideshow) {
        heroSlideshow.classList.remove('is-waiting');
        heroSlideshow.classList.add('is-active');
    }

    // reset to first still
    heroSlides.forEach((el, i) => el.classList.toggle('is-active', i === 0));
    startHeroSlideshow();
}

function startHeroSlideshow() {
    if (!heroSlides.length) return;
    clearHeroSlideTimer();

    let index = Array.from(heroSlides).findIndex((el) => el.classList.contains('is-active'));
    if (index < 0) index = 0;
    let steps = 0;

    heroSlideTimer = window.setInterval(() => {
        steps += 1;

        // 마지막 장까지 충분히 보여준 뒤 영상으로 복귀
        if (heroLoopActive && heroVideo && steps >= heroSlides.length) {
            clearHeroSlideTimer();
            window.setTimeout(() => {
                if (heroLoopActive) activateHeroVideo();
            }, 400);
            return;
        }

        heroSlides[index].classList.remove('is-active');
        index = (index + 1) % heroSlides.length;
        heroSlides[index].classList.add('is-active');
    }, HERO_SLIDE_MS);
}

function startHeroLifeJourney() {
    const preferReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (preferReduced || !heroVideo) {
        heroLoopActive = false;
        revealHeroSlideshow();
        // reduced motion: still loop images only
        if (heroSlides.length > 1) {
            heroLoopActive = false;
            clearHeroSlideTimer();
            let index = 0;
            heroSlideTimer = window.setInterval(() => {
                heroSlides[index].classList.remove('is-active');
                index = (index + 1) % heroSlides.length;
                heroSlides[index].classList.add('is-active');
            }, HERO_SLIDE_MS);
        }
        return;
    }

    activateHeroVideo();
}

startHeroLifeJourney();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const contactApiEndpoint = '/api/consultations.php';
const contactBackupStorageKey = 'erusoMemorialConsultationBackups';

let previewIndex = 0;
let previewTimer;
const tributeCounts = {};

function formatStatNumber(value) {
    const n = Number(value) || 0;
    return n.toLocaleString('ko-KR');
}

function setTributeCount(key, value) {
    const countElement = document.querySelector(`[data-count="${key}"]`);
    if (!countElement) return;
    tributeCounts[key] = Number(value) || 0;
    countElement.textContent = formatStatNumber(tributeCounts[key]);
}

countElements.forEach((element) => {
    tributeCounts[element.dataset.count] = Number.parseInt(String(element.textContent).replace(/,/g, ''), 10) || 0;
    element.textContent = formatStatNumber(tributeCounts[element.dataset.count]);
});

/** 홈페이지 추모 통계 — eternal_memory 공개 API */
async function loadHomepageTributeStats() {
    const host = (location.hostname || '').toLowerCase();
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1';
    const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute('content');
    const apiBase = (isLocal ? 'http://localhost:1210' : (metaApi || 'https://api.erum2026.co.kr')).replace(/\/$/, '');
    try {
        const res = await fetch(`${apiBase}/api/public/homepage-stats`, { credentials: 'omit' });
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const data = await res.json();
        [
            ['candle', data.candle],
            ['incense', data.incense],
            ['flower', data.flower],
            ['offering', data.offering],
            ['messages', data.messages],
            ['visits', data.visits],
        ].forEach(([key, value]) => setTributeCount(key, value));
    } catch (err) {
        console.warn('homepage stats load failed', err);
    }
}

/** 홈페이지 URL 접속 기록 → 방문기록 통계 (동일 접속자 1시간 윈도우) */
async function trackHomepageVisit() {
    const host = (location.hostname || '').toLowerCase();
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1';
    const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute('content');
    const apiBase = (isLocal ? 'http://localhost:1210' : (metaApi || 'https://api.erum2026.co.kr')).replace(/\/$/, '');
    const keyName = 'eruso_visitor_key';
    const hitKey = 'eruso_visit_hit:homepage|' + (location.pathname || '/');
    const windowMs = 60 * 60 * 1000;
    let visitorKey = '';
    try {
        visitorKey = localStorage.getItem(keyName) || '';
        if (!visitorKey || visitorKey.length < 8) {
            visitorKey = (crypto.randomUUID ? crypto.randomUUID() : `v${Date.now()}${Math.random()}`).replace(/-/g, '');
            localStorage.setItem(keyName, visitorKey);
        }
        const prev = Number(localStorage.getItem(hitKey) || 0);
        if (prev && Date.now() - prev < windowMs) {
            await loadHomepageTributeStats();
            return;
        }
    } catch (_) {
        visitorKey = `v${Date.now()}${Math.random().toString(36).slice(2)}`;
    }
    try {
        await fetch(`${apiBase}/api/public/page-visit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'omit',
            body: JSON.stringify({
                path: location.pathname || '/',
                page_kind: 'homepage',
                visitor_key: visitorKey,
            }),
        });
        try { localStorage.setItem(hitKey, String(Date.now())); } catch (_) { /* ignore */ }
        await loadHomepageTributeStats();
    } catch (err) {
        console.warn('homepage visit track failed', err);
    }
}

loadHomepageTributeStats();
trackHomepageVisit();

function updateNavState() {
    const scrolled = window.scrollY > 24;
    navbar.classList.toggle('scrolled', scrolled);
    scrollTopBtn.classList.toggle('active', window.scrollY > 420);

    if (hero && !reducedMotion) {
        const heroShift = Math.min(window.scrollY * 0.08, 34);
        hero.style.setProperty('--hero-shift', `${heroShift}px`);
    }
}

function setNavDrawerOpen(open) {
    if (!navMenu || !navToggle) return;

    if (open && isNavDrawerMode()) {
        placeNavMenuForViewport();
    }

    navMenu.classList.toggle('active', open);
    navbar?.classList.toggle('nav-drawer-open', open);
    document.body.classList.toggle('nav-drawer-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');

    const icon = navToggle.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-bars', !open);
        icon.classList.toggle('fa-times', open);
    }

    if (navDrawerBackdrop) {
        navDrawerBackdrop.classList.toggle('is-open', open);
        if (open) navDrawerBackdrop.removeAttribute('hidden');
        else navDrawerBackdrop.setAttribute('hidden', '');
    }

    if (open) {
        navBodyOverflowPrev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = navBodyOverflowPrev || '';
    }
}

function closeMenu() {
    setNavDrawerOpen(false);
}

function showNotification(message, type = 'success') {
    const previous = document.querySelector('.notification');
    if (previous) previous.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'circle-exclamation'}"></i>
        <span>${message}</span>
        <button type="button" aria-label="알림 닫기"><i class="fas fa-times"></i></button>
    `;

    notification.querySelector('button').addEventListener('click', () => notification.remove());
    document.body.appendChild(notification);

    window.setTimeout(() => {
        notification.classList.add('leaving');
        window.setTimeout(() => notification.remove(), 240);
    }, 4200);
}

function loadConsultationBackups() {
    try {
        return JSON.parse(localStorage.getItem(contactBackupStorageKey) || '[]');
    } catch (error) {
        console.warn('상담 신청 백업 내역을 읽지 못했습니다.', error);
        return [];
    }
}

function saveConsultationBackup(consultation) {
    const consultations = loadConsultationBackups();
    consultations.unshift(consultation);
    localStorage.setItem(contactBackupStorageKey, JSON.stringify(consultations.slice(0, 20)));
    return consultations.length;
}

async function submitConsultationToServer(consultation) {
    if (!window.fetch) {
        throw new Error('브라우저가 서버 저장 기능을 지원하지 않습니다.');
    }

    const response = await window.fetch(contactApiEndpoint, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(consultation)
    });

    let result = {};
    let responseText = '';
    try {
        responseText = await response.text();
        result = JSON.parse(responseText);
    } catch (error) {
        const preview = responseText.trim().slice(0, 160);
        console.error('상담 API가 JSON이 아닌 응답을 반환했습니다.', {
            status: response.status,
            contentType: response.headers.get('Content-Type'),
            preview
        });

        if (response.status === 404) {
            throw new Error('상담 저장 API를 찾지 못했습니다. /api/consultations.php 파일이 서버에 업로드됐는지 확인해주세요.');
        }

        if (preview.startsWith('<?php')) {
            throw new Error('PHP가 실행되지 않고 파일 내용이 그대로 반환되고 있습니다. PHP 지원 서버에서 실행해야 합니다.');
        }

        if (/<!doctype|<html/i.test(preview)) {
            throw new Error('상담 API 대신 HTML 페이지가 응답했습니다. 서버의 API 경로 또는 rewrite 설정을 확인해주세요.');
        }

        throw new Error('상담 API가 올바른 JSON 응답을 반환하지 않았습니다.');
    }

    if (!response.ok || !result.success) {
        throw new Error(result.message || '상담 요청을 서버에 저장하지 못했습니다.');
    }

    return result;
}

window.addEventListener('scroll', updateNavState);
updateNavState();

navToggle.addEventListener('click', () => {
    const willOpen = !navMenu.classList.contains('active');
    setNavDrawerOpen(willOpen);
});

navDrawerBackdrop?.addEventListener('click', () => {
    closeMenu();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu?.classList.contains('active')) {
        closeMenu();
    }
});

placeNavMenuForViewport();
if (typeof NAV_DRAWER_MQ.addEventListener === 'function') {
    NAV_DRAWER_MQ.addEventListener('change', placeNavMenuForViewport);
} else if (typeof NAV_DRAWER_MQ.addListener === 'function') {
    NAV_DRAWER_MQ.addListener(placeNavMenuForViewport);
}

navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        closeMenu();

        const offset = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
            top: Math.max(targetPosition, 0),
            behavior: 'smooth'
        });
    });
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

if (phoneInput) {
    phoneInput.addEventListener('input', (event) => {
        let value = event.target.value.replace(/\D/g, '').slice(0, 11);
        if (value.length > 7) {
            value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
        } else if (value.length > 3) {
            value = `${value.slice(0, 3)}-${value.slice(3)}`;
        }
        event.target.value = value;
    });
}

packageButtons.forEach((button) => {
    button.addEventListener('click', () => {
        packageButtons.forEach((item) => item.classList.remove('active'));
        button.classList.add('active');
        selectedPackage.value = button.dataset.package;
        showNotification(`${button.dataset.package} 상담 항목이 선택되었습니다.`, 'success');
    });
});

function activatePreviewTab(tab) {
    const selected = tab.dataset.preview;
    previewTabs.forEach((item) => item.classList.toggle('active', item === tab));
    previewPanes.forEach((pane) => {
        pane.classList.toggle('active', pane.dataset.pane === selected);
    });
}

function startPreviewRotation() {
    if (reducedMotion || previewTabs.length < 2) return;

    window.clearInterval(previewTimer);
    previewTimer = window.setInterval(() => {
        previewIndex = (previewIndex + 1) % previewTabs.length;
        activatePreviewTab(previewTabs[previewIndex]);
    }, 5600);
}

previewTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
        previewIndex = Array.from(previewTabs).indexOf(tab);
        activatePreviewTab(tab);
        startPreviewRotation();
    });
});

startPreviewRotation();

if (contactForm) {
    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name').trim();
        const phone = formData.get('phone').trim();
        const email = formData.get('email').trim();
        const serviceType = formData.get('serviceType').trim();
        const message = formData.get('message').trim();
        const packageName = formData.get('selectedPackage') || '기본 추모관';

        if (!name || !phone || !email || !serviceType || !message) {
            showNotification('필수 항목을 모두 입력해주세요.', 'error');
            return;
        }

        const phoneRegex = /^010-\d{3,4}-\d{4}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('연락처는 010-0000-0000 형식으로 입력해주세요.', 'error');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('이메일 주소를 다시 확인해주세요.', 'error');
            return;
        }

        const consultation = {
            name,
            phone,
            email,
            serviceType,
            message,
            packageName
        };
        const submitButton = contactForm.querySelector('.form-submit');
        const originalButtonHtml = submitButton ? submitButton.innerHTML : '';

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.classList.add('is-loading');
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 서버에 저장 중';
            }

            const result = await submitConsultationToServer(consultation);
            saveConsultationBackup({
                ...consultation,
                serverId: result.id,
                savedAt: result.savedAt
            });
            console.info('상담 신청 서버 저장 완료:', result.id);
            showNotification(`상담 요청이 서버에 저장되었습니다. 접수번호: ${result.id}`, 'success');
            contactForm.reset();
            selectedPackage.value = '기본 추모관';
            packageButtons.forEach((button, index) => button.classList.toggle('active', index === 0));
        } catch (error) {
            console.error('상담 신청 서버 저장 실패:', error);
            showNotification(error.message || '상담 요청 서버 저장에 실패했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.classList.remove('is-loading');
                submitButton.innerHTML = originalButtonHtml;
            }
        }
    });
}

const revealTargets = document.querySelectorAll('.about-card, .feature-card, .process-step, .memorial-preview, .contact-form, .section-copy, .section-header, .contact-copy, .support-band, .package-card');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

revealTargets.forEach((target) => revealObserver.observe(target));

console.log('ERUSO Memorial System page loaded.');

/* ============================================================
   Memorial Embed loader (eternal_memory 연동)
   - 공개 목록:   GET {API_BASE}/api/memorial-rooms/public?q=
   - 상세 링크:   {APP_BASE}/memorial/{id}/view
   - is_public=true 인 추모관만 API에서 반환
   설정:
     <meta name="eruso-api-base" content="https://api.erum2026.co.kr">
     <meta name="eruso-app-base" content="https://erum2026.co.kr">
   로컬(localhost/file)에서는 자동으로 :8200 / :3200 사용
   ============================================================ */
(function initMemorialEmbed() {
    const listEl    = document.getElementById('memorialList');
    const searchEl  = document.getElementById('memorialSearch');
    const refreshEl = document.getElementById('memorialRefresh');
    if (!listEl) return;

    const host = (location.hostname || '').toLowerCase();
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1';
    const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute('content');
    const metaApp = document.querySelector('meta[name="eruso-app-base"]')?.getAttribute('content');
    const apiBase = (isLocal ? 'http://localhost:1210' : (metaApi || 'https://api.erum2026.co.kr')).replace(/\/$/, '');
    const appBase = (isLocal ? 'http://localhost:1200' : (metaApp || 'https://erum2026.co.kr')).replace(/\/$/, '');

    const PAGE_SIZE = 4;
    let _allRooms   = [];
    let _curPage    = 1;

    /* 페이지네이션 컨테이너 — listEl 다음에 자동 삽입 */
    let pagerEl = document.getElementById('memorialPager');
    if (!pagerEl) {
        pagerEl = document.createElement('div');
        pagerEl.id = 'memorialPager';
        pagerEl.style.cssText = 'display:flex;justify-content:center;align-items:center;gap:4px;margin-top:10px;flex-wrap:wrap;';
        listEl.parentNode.insertBefore(pagerEl, listEl.nextSibling);
    }

    function esc(s) {
        return String(s || '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function assetUrl(path) {
        if (!path) return '';
        if (/^https?:\/\//i.test(path)) return path;
        return `${apiBase}/${String(path).replace(/^\//, '')}`;
    }

    function formatDates(r) {
        const birth = (r?.deceased_birth_date || '').slice(0, 10);
        const death = (r?.deceased_death_date || '').slice(0, 10);
        if (birth && death) return `${birth} ~ ${death}`;
        if (death) return `별세 ${death}`;
        if (birth) return `출생 ${birth}`;
        return '';
    }

    function renderPage(page) {
        _curPage = page;
        const start = (page - 1) * PAGE_SIZE;
        const slice = _allRooms.slice(start, start + PAGE_SIZE);

        if (slice.length === 0) {
            listEl.innerHTML = '<div class="memorial-skeleton">공개된 추모관이 없습니다. (또는 검색 결과가 없습니다)</div>';
            pagerEl.innerHTML = '';
            return;
        }

        listEl.innerHTML = slice.map((r) => {
            const title  = r?.title || r?.memorial_name || `추모관 #${r?.id}`;
            const nameLine = r?.deceased_name ? `故 ${r.deceased_name}` : '';
            const dateLine = formatDates(r);
            const desc   = [nameLine, dateLine].filter(Boolean).join(' · ')
                || (r?.memorial_name && r.memorial_name !== title ? r.memorial_name : '')
                || (r?.description || '');
            const thumbLetter = (r?.deceased_name || title).trim().slice(0, 1) || '故';
            const imgSrc = assetUrl(r?.image_url);
            const thumbHtml = imgSrc
                ? `<img class="memorial-thumb-img" src="${esc(imgSrc)}" alt="" loading="lazy" data-fallback="${esc(thumbLetter)}">`
                : esc(thumbLetter);
            const viewUrl = `${appBase}/memorial/${r.id}/view`;
            return `
<div class="memorial-card" role="listitem">
  <div class="memorial-thumb" aria-hidden="true">${thumbHtml}</div>
  <div class="memorial-meta">
    <div class="memorial-name" title="${esc(title)}">${esc(title)}</div>
    <div class="memorial-desc" title="${esc(desc)}">${esc(desc)}</div>
    <div class="memorial-actions">
      <a class="primary" href="${esc(viewUrl)}" target="_blank" rel="noopener">방문하기</a>
      <a href="#" data-share="${esc(viewUrl)}"><i class="fas fa-share-nodes"></i>공유</a>
    </div>
  </div>
</div>`;
        }).join('');

        listEl.querySelectorAll('.memorial-thumb-img').forEach((img) => {
            img.addEventListener('error', () => {
                const fall = img.getAttribute('data-fallback') || '故';
                img.replaceWith(document.createTextNode(fall));
            });
        });

        /* 공유 버튼 핸들러 */
        listEl.querySelectorAll('[data-share]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const url = btn.getAttribute('data-share');
                try {
                    if (navigator.share) {
                        await navigator.share({ title: '추모관 공유', url });
                    } else {
                        await navigator.clipboard.writeText(url);
                        showNotification('링크가 복사되었습니다.', 'success');
                    }
                } catch {
                    try { await navigator.clipboard.writeText(url); showNotification('링크가 복사되었습니다.', 'success'); }
                    catch { showNotification('공유에 실패했습니다. 링크를 직접 복사해 주세요.', 'error'); }
                }
            });
        });

        /* 페이지 버튼 렌더 */
        const totalPages = Math.ceil(_allRooms.length / PAGE_SIZE);
        if (totalPages <= 1) { pagerEl.innerHTML = ''; return; }

        const btnBase = 'display:inline-flex;align-items:center;justify-content:center;' +
            'width:34px;height:34px;border-radius:8px;border:1.5px solid;' +
            'font-size:13px;font-weight:700;cursor:pointer;transition:all .18s;';

        let html = '';
        /* ← 이전 */
        html += `<button type="button" data-page="${page - 1}" ${page===1?'disabled':''} aria-label="이전 페이지"
            style="${btnBase}background:${page===1?'#f1f5f9':'#fff'};border-color:${page===1?'#e2e8f0':'#cbd5e1'};color:${page===1?'#cbd5e1':'#475569'};">‹</button>`;

        /* 숫자 버튼 */
        for (let p = 1; p <= totalPages; p++) {
            const isActive = p === page;
            html += `<button type="button" data-page="${p}" aria-current="${isActive?'page':'false'}"
                style="${btnBase}background:${isActive?'#1c2a44':'#fff'};border-color:${isActive?'#1c2a44':'#cbd5e1'};color:${isActive?'#c8a96e':'#475569'};">${p}</button>`;
        }

        /* → 다음 */
        html += `<button type="button" data-page="${page + 1}" ${page===totalPages?'disabled':''} aria-label="다음 페이지"
            style="${btnBase}background:${page===totalPages?'#f1f5f9':'#fff'};border-color:${page===totalPages?'#e2e8f0':'#cbd5e1'};color:${page===totalPages?'#cbd5e1':'#475569'};">›</button>`;

        pagerEl.innerHTML = html;
        pagerEl.querySelectorAll('button[data-page]:not([disabled])').forEach((btn) => {
            btn.addEventListener('click', () => renderPage(Number(btn.getAttribute('data-page'))));
        });
    }

    async function load(q = '') {
        listEl.innerHTML = '<div class="memorial-skeleton">공개 추모관 목록을 불러오는 중입니다...</div>';
        pagerEl.innerHTML = '';
        const url = `${apiBase}/api/memorial-rooms/public?q=${encodeURIComponent(q || '')}`;
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            // 공개 API가 이미 is_public 필터를 적용하지만, 응답 형태 방어적으로 정규화
            const rows = Array.isArray(data) ? data : (data.items || []);
            _allRooms = rows.filter((r) => r && (r.is_public === undefined || r.is_public === true));
            renderPage(1);
        } catch (e) {
            console.error('[memorial-embed] load failed:', e, url);
            listEl.innerHTML = `<div class="memorial-skeleton">공개 추모관 목록을 불러오지 못했습니다.<br><small style="opacity:.75">API: ${esc(apiBase)} — 서버/CORS 상태를 확인해 주세요.</small></div>`;
        }
    }

    /* 검색 디바운스 */
    let t = null;
    searchEl?.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => load(searchEl.value.trim()), 300);
    });

    refreshEl?.addEventListener('click', () => load(searchEl?.value?.trim() || ''));

    load('');
})();
// ═══════════════════════════════════════════════════════
// 패키지 선택 + 상담 신청 폼 제출 (API 연동)
// ═══════════════════════════════════════════════════════
function initContactForm() {
    const PLAN_NAMES = {
        FREE: '무료',
        PRESERVE: '기억의 보존',
        SHARE: '기억의 공유',
        ETERNAL: '기억의 영속',
    };

    const host = (location.hostname || '').toLowerCase();
    const isLocal = !host || host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    const metaApp = document.querySelector('meta[name="eruso-app-base"]')?.content;
    const appBase = (isLocal ? 'http://localhost:1200' : (metaApp || 'https://erum2026.co.kr')).replace(/\/$/, '');

    function syncPlanSelection(btn) {
        document.querySelectorAll('.package-card').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const plan = (btn.dataset.plan || btn.dataset.package || 'FREE').toUpperCase();
        const pkgHidden = document.getElementById('selectedPackage');
        const planHidden = document.getElementById('selectedPlanCode');
        if (pkgHidden) pkgHidden.value = PLAN_NAMES[plan] || plan;
        if (planHidden) planHidden.value = plan;

        const signup = document.getElementById('planSignupLink');
        if (signup) {
            signup.href = `${appBase}/signup?plan=${encodeURIComponent(plan)}`;
            signup.textContent = '무료로 회원가입';
        }
        const pricing = document.querySelector('.pkg-pricing-link');
        if (pricing) pricing.href = `${appBase}/pricing`;
    }

    document.querySelectorAll('.package-card').forEach(btn => {
        btn.addEventListener('click', () => syncPlanSelection(btn));
    });
    const active = document.querySelector('.package-card.active') || document.querySelector('.package-card');
    if (active) syncPlanSelection(active);

    // 폼 제출
    const form    = document.getElementById('contactForm');
    const notice  = document.getElementById('contactNotice');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.content;
        const apiBase = (isLocal ? 'http://localhost:1210' : (metaApi || 'https://api.erum2026.co.kr')).replace(/\/$/, '');
        const planCode = document.getElementById('selectedPlanCode')?.value || 'FREE';
        const planLabel = document.getElementById('selectedPackage')?.value || PLAN_NAMES[planCode] || planCode;

        const payload = {
            name:         form.querySelector('[name=name]')?.value.trim(),
            phone:        form.querySelector('[name=phone]')?.value.trim(),
            email:        form.querySelector('[name=email]')?.value.trim() || null,
            service_type: form.querySelector('[name=serviceType]')?.value,
            package_type: planLabel,
            memorial_name: form.querySelector('[name=memorialName]')?.value.trim() || null,
            message:      [
                form.querySelector('[name=message]')?.value.trim() || '',
                `[선택요금제] ${planLabel} (${planCode})`,
            ].filter(Boolean).join('\n'),
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 접수 중...';

        try {
            const resp = await fetch(`${apiBase}/api/consultations/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!resp.ok) throw new Error(await resp.text());

            notice.className = 'form-notice success';
            notice.textContent = '✅ 이용신청이 접수되었습니다. 관리자 사용승인 후 추모방이 생성됩니다. (1~2 영업일)';
            notice.style.display = 'block';
            form.reset();
            const svc = document.getElementById('serviceType');
            if (svc) svc.value = '온라인 추모관 개설';
            document.querySelector('.package-card[data-plan="FREE"]')?.click();
        } catch (err) {
            notice.className = 'form-notice error';
            notice.textContent = '⚠️ 신청 중 오류가 발생했습니다. 전화로 문의해 주세요.';
            notice.style.display = 'block';
            console.error('[contact form]', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 이용신청 접수하기';
        }
    });
}

/** 사이버 추모관 신청 CTA → 폼 프리셋 + 회원가입 링크 */
function initCyberMemorialApply() {
    const host = (location.hostname || '').toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    const metaApp = document.querySelector('meta[name="eruso-app-base"]')?.getAttribute('content');
    const appBase = (isLocal ? 'http://localhost:1200' : (metaApp || 'https://erum2026.co.kr')).replace(/\/$/, '');

    const signup = document.getElementById('cyberSignupLink');
    if (signup) signup.href = `${appBase}/signup`;

    const jesaTrialHref = `${appBase}/service-select?mode=trial`;
    ['heroJesaTrialLink', 'footerJesaTrialLink'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.href = jesaTrialHref;
    });

    const applyBtn = document.getElementById('cyberApplyBtn');
    applyBtn?.addEventListener('click', () => {
        const service = applyBtn.getAttribute('data-service') || '온라인 추모관 개설';
        const svc = document.getElementById('serviceType');
        if (svc) {
            const opt = Array.from(svc.options).find((o) => o.value === service || o.textContent.includes(service));
            if (opt) svc.value = opt.value;
            else svc.value = service;
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactForm);
document.addEventListener('DOMContentLoaded', initCyberMemorialApply);
document.addEventListener('DOMContentLoaded', initReligionGuideTabs);
document.addEventListener('DOMContentLoaded', initWorkflowGuideLang);

function initWorkflowGuideLang() {
    const root = document.getElementById('workflow-guide');
    if (!root) return;

    const video = root.querySelector('[data-workflow-video]');
    const source = video?.querySelector('source');
    const tabs = root.querySelectorAll('[data-workflow-lang]');
    const stepNodes = root.querySelectorAll('[data-workflow-steps] li');
    if (!video || !source || !tabs.length) return;

    const version = video.getAttribute('data-video-version') || '1';
    const copy = {
        ko: [
            ['네이버 검색', '이루소 추모서비스'],
            ['결과 클릭', '이루소 서비스 진입'],
            ['회원가입', '무료 체험 → 다음'],
            ['이용신청', '상담·개설 버튼'],
            ['사용승인', '관리자 검토 대기'],
            ['로그인', '카카오·네이버 로그인'],
            ['앱 사용', '사진·방명록·부고'],
            ['제사당 체험', '무료체험 버튼'],
        ],
        en: [
            ['Naver search', '이루소 추모서비스'],
            ['Tap result', 'Open Eruso'],
            ['Sign up', 'Free Trial → Next'],
            ['Apply', 'Consult / Open buttons'],
            ['Approval', 'Wait for admin'],
            ['Login', 'Kakao / Naver login'],
            ['Use app', 'Photos, guestbook'],
            ['Hall trial', 'Free trial button'],
        ],
        zh: [
            ['Naver搜索', '이루소 추모서비스'],
            ['点击结果', '进入이루소'],
            ['注册', '免费体验 → 下一步'],
            ['申请', '咨询/开设按钮'],
            ['审批', '等待管理员'],
            ['登录', 'Kakao/Naver登录'],
            ['使用', '照片、留言'],
            ['祭堂体验', '免费体验按钮'],
        ],
        ja: [
            ['Naver検索', '이루소 추모서비스'],
            ['結果タップ', '이루소へ'],
            ['会員登録', '無料体験 → 次へ'],
            ['利用申請', '相談・開設ボタン'],
            ['承認', '管理者確認待ち'],
            ['ログイン', 'Kakao・Naver'],
            ['アプリ利用', '写真・芳名録'],
            ['祭祀堂体験', '無料体験ボタン'],
        ],
        hi: [
            ['Naver खोज', '이루소 추모서비스'],
            ['परिणाम टैप', 'Eruso खोलें'],
            ['साइन-अप', 'Free Trial → Next'],
            ['आवेदन', 'Consult बटन'],
            ['स्वीकृति', 'एडमिन प्रतीक्षा'],
            ['लॉगिन', 'Kakao / Naver'],
            ['ऐप उपयोग', 'फ़ोटो, अतिथि पुस्तक'],
            ['ट्रायल', 'Free Trial बटन'],
        ],
    };

    const applyLang = (lang) => {
        const wasPlaying = !video.paused;
        const labels = copy[lang] || copy.ko;
        tabs.forEach((tab) => {
            const active = tab.getAttribute('data-workflow-lang') === lang;
            tab.classList.toggle('is-active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        stepNodes.forEach((li, i) => {
            const pair = labels[i];
            if (!pair) return;
            const title = li.querySelector('[data-step-title]');
            const desc = li.querySelector('[data-step-desc]');
            if (title) title.textContent = pair[0];
            if (desc) desc.textContent = pair[1];
        });
        video.poster = `images/workflow-guide/${lang}/slide_01.png`;
        source.src = `images/workflow-guide-${lang}.mp4?v=${version}`;
        video.load();
        if (wasPlaying) {
            video.play().catch(() => {});
        }
    };

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const lang = tab.getAttribute('data-workflow-lang');
            if (!lang) return;
            applyLang(lang);
        });
    });
}

function initReligionGuideTabs() {
    const root = document.querySelector('[data-etiquette-guide]');
    if (!root) return;

    const parentTabs = root.querySelectorAll('[data-etiquette-parent]');
    const childTabs = root.querySelectorAll('[data-etiquette-child]');
    const panels = root.querySelectorAll('[data-etiquette-panel]');
    const defaults = { religion: 'buddhist', country: 'korea' };
    let activeParent = 'religion';
    let activeChild = defaults.religion;

    const setParent = (parentKey) => {
        activeParent = parentKey;
        parentTabs.forEach((tab) => {
            const on = tab.getAttribute('data-etiquette-parent') === parentKey;
            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        const firstVisible = Array.from(childTabs).find(
            (tab) => tab.getAttribute('data-parent') === parentKey
        );
        const preferred = defaults[parentKey] || firstVisible?.getAttribute('data-etiquette-child');
        setChild(preferred || firstVisible?.getAttribute('data-etiquette-child'));
    };

    const setChild = (childKey) => {
        if (!childKey) return;
        activeChild = childKey;

        childTabs.forEach((tab) => {
            const parent = tab.getAttribute('data-parent');
            const key = tab.getAttribute('data-etiquette-child');
            const visible = parent === activeParent;
            const on = visible && key === childKey;

            if (visible) tab.removeAttribute('hidden');
            else tab.setAttribute('hidden', '');

            tab.classList.toggle('is-active', on);
            tab.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        panels.forEach((panel) => {
            const on = panel.getAttribute('data-etiquette-panel') === childKey;
            panel.classList.toggle('is-active', on);
            if (on) panel.removeAttribute('hidden');
            else panel.setAttribute('hidden', '');
        });
    };

    parentTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-etiquette-parent');
            if (key) setParent(key);
        });
    });

    childTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const key = tab.getAttribute('data-etiquette-child');
            if (key) setChild(key);
        });
    });

    setParent(activeParent);
}
