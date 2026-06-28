const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a, .nav-brand, .nav-cta, .hero-actions a, .footer a');
const scrollTopBtn = document.getElementById('scrollToTop');
const contactForm = document.getElementById('contactForm');
const phoneInput = document.getElementById('phone');
const packageButtons = document.querySelectorAll('.package-card');
const selectedPackage = document.getElementById('selectedPackage');
const previewTabs = document.querySelectorAll('.preview-tab');
const previewPanes = document.querySelectorAll('.preview-pane');
const tributeActions = document.querySelectorAll('.tribute-action');
const countElements = document.querySelectorAll('[data-count]');
const messageOpen = document.querySelector('.message-open');
const quickMessageForm = document.getElementById('quickMessage');
const quickMessageText = document.getElementById('quickMessageText');
const quickMessageClose = document.querySelector('.quick-message-close');
const hero = document.querySelector('.hero');
const memoryNotes = document.querySelector('.memory-notes');
const memoryNoteTime = document.querySelector('.memory-note-time');
const memoryNoteText = document.querySelector('.memory-note-text');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const memorialMessages = [
    { time: '방금 전', text: '함께한 시간을 오래 기억하겠습니다.' },
    { time: '1분 전', text: '멀리서나마 마음 깊이 추모합니다.' },
    { time: '3분 전', text: '따뜻했던 웃음과 마음을 잊지 않겠습니다.' },
    { time: '5분 전', text: '남겨주신 사랑을 가족과 함께 간직하겠습니다.' }
];
const contactApiEndpoint = '/api/consultations.php';
const contactBackupStorageKey = 'erusoMemorialConsultationBackups';

let noteIndex = 0;
let previewIndex = 0;
let previewTimer;
let noteRotationTimer;
const tributeCounts = {};

countElements.forEach((element) => {
    tributeCounts[element.dataset.count] = Number.parseInt(element.textContent, 10) || 0;
});

function updateNavState() {
    const scrolled = window.scrollY > 24;
    navbar.classList.toggle('scrolled', scrolled);
    scrollTopBtn.classList.toggle('active', window.scrollY > 420);

    if (hero && !reducedMotion) {
        const heroShift = Math.min(window.scrollY * 0.08, 34);
        hero.style.setProperty('--hero-shift', `${heroShift}px`);
    }
}

function closeMenu() {
    navMenu.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    const icon = navToggle.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
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

function setMemoryNote(time, text) {
    if (!memoryNotes || !memoryNoteTime || !memoryNoteText) return;

    memoryNotes.classList.add('is-changing');
    window.setTimeout(() => {
        memoryNoteTime.textContent = time;
        memoryNoteText.textContent = text;
        memoryNotes.classList.remove('is-changing');
    }, 240);
}

function restartNoteRotation() {
    if (reducedMotion || !memoryNotes) return;

    window.clearInterval(noteRotationTimer);
    noteRotationTimer = window.setInterval(rotateMemoryNote, 4300);
}

function incrementTributeCount(key) {
    const countElement = document.querySelector(`[data-count="${key}"]`);
    if (!countElement) return;

    tributeCounts[key] = (tributeCounts[key] || 0) + 1;
    countElement.textContent = tributeCounts[key];
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
    navMenu.classList.toggle('active', willOpen);
    navToggle.setAttribute('aria-expanded', String(willOpen));

    const icon = navToggle.querySelector('i');
    icon.classList.toggle('fa-bars', !willOpen);
    icon.classList.toggle('fa-times', willOpen);
});

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

tributeActions.forEach((button) => {
    button.addEventListener('click', () => {
        const key = button.dataset.tribute;
        const label = button.dataset.label;
        const noteByKey = {
            flower: '헌화로 따뜻한 마음을 전했습니다.',
            message: '추모글에 공감이 더해졌습니다.',
            visit: '방문 기록을 남겼습니다.'
        };

        incrementTributeCount(key);
        button.classList.remove('is-counting');
        void button.offsetWidth;
        button.classList.add('is-counting');
        window.setTimeout(() => button.classList.remove('is-counting'), 360);
        setMemoryNote('방금 전', noteByKey[key] || `${label}에 마음을 보탰습니다.`);
        restartNoteRotation();
    });
});

function closeQuickMessage() {
    if (!quickMessageForm || !messageOpen) return;

    quickMessageForm.classList.remove('is-open');
    messageOpen.classList.remove('is-open');
    messageOpen.setAttribute('aria-expanded', 'false');
}

if (messageOpen && quickMessageForm) {
    messageOpen.addEventListener('click', () => {
        const willOpen = !quickMessageForm.classList.contains('is-open');
        quickMessageForm.classList.toggle('is-open', willOpen);
        messageOpen.classList.toggle('is-open', willOpen);
        messageOpen.setAttribute('aria-expanded', String(willOpen));

        if (willOpen && quickMessageText) {
            quickMessageText.focus({ preventScroll: true });
        }
    });
}

if (quickMessageClose) {
    quickMessageClose.addEventListener('click', closeQuickMessage);
}

if (quickMessageForm) {
    quickMessageForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const message = quickMessageText.value.trim();
        if (!message) {
            showNotification('남길 메시지를 입력해주세요.', 'error');
            return;
        }

        incrementTributeCount('message');
        setMemoryNote('방금 전', message);
        showNotification('추모 메시지가 남겨졌습니다.', 'success');
        quickMessageText.value = '';
        closeQuickMessage();
        restartNoteRotation();
        window.scrollTo({ top: 0, behavior: 'auto' });
    });
}

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

function rotateMemoryNote() {
    noteIndex = (noteIndex + 1) % memorialMessages.length;
    setMemoryNote(memorialMessages[noteIndex].time, memorialMessages[noteIndex].text);
}

restartNoteRotation();

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
   Memorial Embed loader (eternal_memory 연동) — 2026-06-16
   - 공개 목록:   GET {API_BASE}/api/memorial-rooms/public?q=
   - 상세 링크:   {APP_BASE}/memorial/{id}/view
   설정 방법:
     <meta name="eruso-api-base" content="http://localhost:8200">
     <meta name="eruso-app-base" content="http://localhost:3200">
   ============================================================ */
(function initMemorialEmbed() {
    const listEl    = document.getElementById('memorialList');
    const searchEl  = document.getElementById('memorialSearch');
    const refreshEl = document.getElementById('memorialRefresh');
    if (!listEl) return;

    const apiBase = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute('content') || 'http://localhost:8200';
    const appBase = document.querySelector('meta[name="eruso-app-base"]')?.getAttribute('content') || 'http://localhost:3200';

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
            const title  = r?.title || `추모관 #${r?.id}`;
            const desc   = r?.deceased_name ? `고인: ${r.deceased_name}` : (r?.description || '');
            const thumb  = (r?.deceased_name || title).trim().slice(0, 1) || '故';
            const viewUrl = `${appBase}/memorial/${r.id}/view`;
            return `
<div class="memorial-card" role="listitem">
  <div class="memorial-thumb" aria-hidden="true">${esc(thumb)}</div>
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
        listEl.innerHTML = '<div class="memorial-skeleton">추모관 목록을 불러오는 중입니다...</div>';
        pagerEl.innerHTML = '';
        const url = `${apiBase}/api/memorial-rooms/public?q=${encodeURIComponent(q || '')}`;
        try {
            const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            _allRooms = await res.json();
            renderPage(1);
        } catch (e) {
            console.error('[memorial-embed] load failed:', e);
            listEl.innerHTML = '<div class="memorial-skeleton">추모관 목록을 불러오지 못했습니다. (API 주소/CORS/서버 상태 확인 필요)</div>';
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
    // 패키지 카드 선택
    document.querySelectorAll('.package-card').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.package-card').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const pkg = btn.dataset.package || btn.querySelector('strong')?.textContent?.trim();
            const hidden = document.getElementById('selectedPackage');
            if (hidden && pkg) hidden.value = pkg;
        });
    });

    // 폼 제출
    const form    = document.getElementById('contactForm');
    const notice  = document.getElementById('contactNotice');
    const submitBtn = document.getElementById('contactSubmitBtn');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.reportValidity(); return; }

        const apiBase = document.querySelector('meta[name="eruso-api-base"]')?.content || 'http://localhost:8200';

        const payload = {
            name:         form.querySelector('[name=name]')?.value.trim(),
            phone:        form.querySelector('[name=phone]')?.value.trim(),
            email:        form.querySelector('[name=email]')?.value.trim() || null,
            service_type: form.querySelector('[name=serviceType]')?.value,
            package_type: document.getElementById('selectedPackage')?.value || null,
            message:      form.querySelector('[name=message]')?.value.trim() || null,
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
            notice.textContent = '✅ 상담 신청이 접수되었습니다. 담당자가 1~2 영업일 내 연락드립니다.';
            notice.style.display = 'block';
            form.reset();
            document.querySelector('.package-card')?.click();  // 패키지 초기화
        } catch (err) {
            notice.className = 'form-notice error';
            notice.textContent = '⚠️ 신청 중 오류가 발생했습니다. 전화로 문의해 주세요.';
            notice.style.display = 'block';
            console.error('[contact form]', err);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 상담 신청 접수하기';
        }
    });
}

document.addEventListener('DOMContentLoaded', initContactForm);
