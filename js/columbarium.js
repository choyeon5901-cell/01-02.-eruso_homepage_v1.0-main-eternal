/**
 * columbarium.js — 봉안당 Canvas 뷰어 + 시설 검색
 * eternal_memory API:
 *   GET /api/funeral-facilities/search|regions
 *   GET /api/national-cemetery/search|regions
 */
(function initColumbarium() {
    'use strict';

    const canvas = document.getElementById('columbariumCanvas');
    const infoPanel = document.getElementById('columbInfoPanel');
    const infoContent = document.getElementById('columbInfoContent');
    const infoClose = document.getElementById('columbInfoClose');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // ── API base (memorial embed와 동일) ───────────────────────
    const host = (location.hostname || '').toLowerCase();
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
    const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute('content');
    const metaApp = document.querySelector('meta[name="eruso-app-base"]')?.getAttribute('content');
    const apiBase = (isLocal ? 'http://localhost:1210' : (metaApi || 'https://api.erum2026.co.kr')).replace(/\/$/, '');
    const appBase = (isLocal ? 'http://localhost:1200' : (metaApp || 'https://erum2026.co.kr')).replace(/\/$/, '');

    const appFuneralEl = document.getElementById('columbAppFuneral');
    const appCemeteryEl = document.getElementById('columbAppCemetery');
    if (appFuneralEl) appFuneralEl.href = `${appBase}/funeral-facility`;
    if (appCemeteryEl) appCemeteryEl.href = `${appBase}/national-cemetery`;

    // ── 상수 ───────────────────────────────────────────────────
    const COLS = 10;
    const ROWS = 6;
    const PAD_LEFT   = 52;
    const PAD_TOP    = 40;
    const GAP        = 6;
    const CELL_W     = Math.floor((canvas.width - PAD_LEFT - 24 - GAP * (COLS - 1)) / COLS);
    const CELL_H     = Math.floor((canvas.height - PAD_TOP - 24 - GAP * (ROWS - 1)) / ROWS);

    const COLOR = {
        bg:        '#0f1420',
        grid:      'rgba(255,255,255,0.07)',
        occupied:  'rgba(200,169,110,0.82)',
        available: 'rgba(48,200,140,0.75)',
        hover:     'rgba(255,255,255,0.18)',
        selected:  'rgba(255,255,255,0.95)',
        label:     'rgba(255,255,255,0.28)',
        text:      '#fff',
        textDim:   'rgba(255,255,255,0.55)',
    };

    // ── 상태 ───────────────────────────────────────────────────
    let activeZone  = 'A';
    let activeFloor = '1';
    let hoverCell   = null;
    let selectedCell = null;
    let selectedFacility = null;
    let seedKey = 'default';
    const cache = {};

    const NAMES = ['홍길동','이순신','김철수','박영희','최갑순','정민우','강지연','윤성호','임미란','송태양'];

    // ── 시드 RNG (시설별 고정 배치) ────────────────────────────
    function hashStr(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }
    function makeRng(seed) {
        let s = hashStr(String(seed)) || 1;
        return function rand() {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }

    function makeData(zone, floor) {
        const rand = makeRng(`${seedKey}|${zone}|${floor}`);
        const data = {};
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const key = `${r}-${c}`;
                const roll = rand();
                const occupied = roll < 0.65;
                const row_label = r + 1;
                const col_label = c + 1;
                data[key] = {
                    id:       `${zone}${floor}-${String(row_label).padStart(2,'0')}${String(col_label).padStart(2,'0')}`,
                    zone,
                    floor,
                    row:      row_label,
                    col:      col_label,
                    occupied,
                    name:     occupied ? NAMES[Math.floor(rand() * NAMES.length)] : null,
                    birth:    occupied ? pickDate(rand, 1920, 1970) : null,
                    death:    occupied ? pickDate(rand, 1990, 2024) : null,
                    price:    !occupied && rand() >= 0.35 ? `${(Math.floor(rand() * 6) + 4) * 50}만원` : null,
                };
            }
        }
        return data;
    }

    function pickDate(rand, from, to) {
        const y = from + Math.floor(rand() * (to - from));
        const m = String(Math.floor(rand() * 12) + 1).padStart(2,'0');
        const d = String(Math.floor(rand() * 28) + 1).padStart(2,'0');
        return `${y}-${m}-${d}`;
    }

    function getData() {
        const key = `${seedKey}|${activeZone}-${activeFloor}`;
        if (!cache[key]) cache[key] = makeData(activeZone, activeFloor);
        return cache[key];
    }

    function clearSlotCache() {
        Object.keys(cache).forEach((k) => delete cache[k]);
        selectedCell = null;
        hoverCell = null;
        if (infoPanel) infoPanel.style.display = 'none';
    }

    // ── 그리기 ────────────────────────────────────────────────
    function cellRect(r, c) {
        return {
            x: PAD_LEFT + c * (CELL_W + GAP),
            y: PAD_TOP  + r * (CELL_H + GAP),
            w: CELL_W,
            h: CELL_H,
        };
    }

    function roundRect(ctx2, x, y, w, h, rad) {
        ctx2.moveTo(x + rad, y);
        ctx2.lineTo(x + w - rad, y);
        ctx2.quadraticCurveTo(x + w, y, x + w, y + rad);
        ctx2.lineTo(x + w, y + h - rad);
        ctx2.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
        ctx2.lineTo(x + rad, y + h);
        ctx2.quadraticCurveTo(x, y + h, x, y + h - rad);
        ctx2.lineTo(x, y + rad);
        ctx2.quadraticCurveTo(x, y, x + rad, y);
        ctx2.closePath();
    }

    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        const data = getData();

        ctx.clearRect(0, 0, W, H);

        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#1a1f2e');
        bg.addColorStop(1, '#0f1420');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = COLOR.label;
        ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < ROWS; r++) {
            const rect = cellRect(r, 0);
            ctx.fillText(`${r + 1}행`, PAD_LEFT - 8, rect.y + CELL_H / 2);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let c = 0; c < COLS; c++) {
            const rect = cellRect(0, c);
            ctx.fillText(`${c + 1}`, rect.x + CELL_W / 2, PAD_TOP - 6);
        }

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const key  = `${r}-${c}`;
                const cell = data[key];
                const rect = cellRect(r, c);
                const isHover    = hoverCell && hoverCell.r === r && hoverCell.c === c;
                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;

                ctx.beginPath();
                roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 8);

                if (isSelected) {
                    ctx.fillStyle = 'rgba(255,255,255,0.22)';
                } else if (isHover) {
                    ctx.fillStyle = COLOR.hover;
                } else if (cell.occupied) {
                    ctx.fillStyle = COLOR.occupied;
                } else {
                    ctx.fillStyle = COLOR.available;
                }
                ctx.fill();

                if (isSelected) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth   = 2.5;
                    ctx.stroke();
                }

                ctx.fillStyle = cell.occupied
                    ? (isSelected ? '#fff' : 'rgba(30,20,10,0.85)')
                    : 'rgba(255,255,255,0.9)';
                ctx.font = `bold ${Math.min(12, CELL_H * 0.28)}px "Noto Sans KR", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.id.split('-')[1], rect.x + rect.w / 2, rect.y + rect.h / 2);
            }
        }

        const title = selectedFacility
            ? `${selectedFacility.name} · ${activeZone}동 ${activeFloor}층`
            : `${activeZone}동 ${activeFloor}층`;
        ctx.fillStyle = 'rgba(200,169,110,0.9)';
        ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(title.length > 36 ? title.slice(0, 35) + '…' : title, PAD_LEFT, 8);
    }

    // ── 인터랙션 ──────────────────────────────────────────────
    function hitTest(evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (evt.clientX - rect.left) * scaleX;
        const my = (evt.clientY - rect.top)  * scaleY;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cr = cellRect(r, c);
                if (mx >= cr.x && mx <= cr.x + cr.w && my >= cr.y && my <= cr.y + cr.h) {
                    return { r, c };
                }
            }
        }
        return null;
    }

    canvas.addEventListener('mousemove', (e) => {
        const hit = hitTest(e);
        const changed = JSON.stringify(hit) !== JSON.stringify(hoverCell);
        if (changed) { hoverCell = hit; draw(); }
        canvas.style.cursor = hit ? 'pointer' : 'default';
    });

    canvas.addEventListener('mouseleave', () => { hoverCell = null; draw(); });

    canvas.addEventListener('click', (e) => {
        const hit = hitTest(e);
        if (!hit) return;
        selectedCell = hit;
        draw();
        showInfo(hit.r, hit.c);
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const hit = hitTest(touch);
        if (!hit) return;
        selectedCell = hit;
        draw();
        showInfo(hit.r, hit.c);
    }, { passive: false });

    function showInfo(r, c) {
        const key  = `${r}-${c}`;
        const cell = getData()[key];
        if (!cell) return;

        const facilityLine = selectedFacility
            ? `<p style="font-size:12px;color:rgba(200,169,110,0.75);margin:0 0 6px;">${esc(selectedFacility.name)}</p>`
            : '';

        const badge = cell.occupied
            ? '<span style="background:rgba(200,169,110,0.85);color:#1a1206;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:800;">사용중</span>'
            : '<span style="background:rgba(48,200,140,0.8);color:#082820;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:800;">분양가능</span>';

        const detail = cell.occupied
            ? `<p style="margin:10px 0 0;font-size:14px;color:rgba(240,240,240,0.75);">故 <strong style="font-size:16px;color:#f0f0f0;">${esc(cell.name)}</strong></p>
               <p style="font-size:12px;color:rgba(240,240,240,0.5);margin:4px 0 0;">생년월일: ${esc(cell.birth)}</p>
               <p style="font-size:12px;color:rgba(240,240,240,0.5);">사망일: ${esc(cell.death)}</p>`
            : `<p style="margin:10px 0 0;font-size:13px;color:rgba(240,240,240,0.65);">분양 상담 가능합니다.</p>
               ${cell.price ? `<p style="font-size:15px;color:#c8a96e;font-weight:800;margin:6px 0 0;">분양가: ${esc(cell.price)}</p>` : ''}`;

        infoContent.innerHTML = `
            ${facilityLine}
            <p style="font-size:13px;color:rgba(200,169,110,0.8);font-weight:700;margin:0 0 4px;">
                ${activeZone}동 ${activeFloor}층 / ${esc(cell.id)}
            </p>
            ${badge}
            ${detail}
            <div style="margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
                <a href="#contact" onclick="document.getElementById('columbInfoPanel').style.display='none';"
                   style="display:inline-flex;align-items:center;gap:8px;padding:9px 16px;background:linear-gradient(135deg,#c8a96e,#a07840);color:#fff;border-radius:8px;font-size:13px;font-weight:800;text-decoration:none;">
                   📞 상담 신청
                </a>
            </div>
        `;
        infoPanel.style.display = 'block';
    }

    if (infoClose) {
        infoClose.addEventListener('click', () => {
            infoPanel.style.display = 'none';
            selectedCell = null;
            draw();
        });
    }

    document.getElementById('columbZoneTabs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.columb-zone-tab');
        if (!btn) return;
        document.querySelectorAll('.columb-zone-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeZone = btn.dataset.zone;
        selectedCell = null;
        infoPanel.style.display = 'none';
        draw();
    });

    document.getElementById('columbFloorTabs')?.addEventListener('click', (e) => {
        const btn = e.target.closest('.columb-floor-tab');
        if (!btn) return;
        document.querySelectorAll('.columb-floor-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFloor = btn.dataset.floor;
        selectedCell = null;
        infoPanel.style.display = 'none';
        draw();
    });

    // ── 시설 선택 → 뷰어 반영 ─────────────────────────────────
    const selectedEl = document.getElementById('columbSelected');
    const selectedNameEl = document.getElementById('columbSelectedName');
    const selectedMetaEl = document.getElementById('columbSelectedMeta');
    const selectedBadgeEl = document.getElementById('columbSelectedBadge');
    const selectedLinksEl = document.getElementById('columbSelectedLinks');
    const facilityLabelEl = document.getElementById('columbFacilityLabel');
    const clearBtn = document.getElementById('columbClearSelect');

    function toAbsoluteUrl(url) {
        const u = String(url || '').trim();
        if (!u) return '';
        if (/^https?:\/\//i.test(u)) return u;
        return `https://${u}`;
    }

    function mapUrl(facility) {
        const q = facility?.address || facility?.name || '';
        return q ? `https://map.naver.com/p/search/${encodeURIComponent(q)}` : '';
    }

    function linkHtml(facility, { compact = false } = {}) {
        const parts = [];
        const home = toAbsoluteUrl(facility?.homepage);
        const map = mapUrl(facility);
        const tel = facility?.phone ? `tel:${String(facility.phone).replace(/[^0-9+]/g, '')}` : '';
        if (home) {
            parts.push(`<a class="columb-ext-link" href="${esc(home)}" target="_blank" rel="noopener" data-stop="1"><i class="fas fa-globe"></i>${compact ? '홈페이지' : '공식 홈페이지'}</a>`);
        }
        if (map) {
            parts.push(`<a class="columb-ext-link" href="${esc(map)}" target="_blank" rel="noopener" data-stop="1"><i class="fas fa-map-location-dot"></i>지도</a>`);
        }
        if (tel) {
            parts.push(`<a class="columb-ext-link" href="${esc(tel)}" data-stop="1"><i class="fas fa-phone"></i>전화</a>`);
        }
        return parts.join('');
    }

    function applyFacility(facility) {
        selectedFacility = facility;
        seedKey = facility ? (facility.id || facility.name) : 'default';
        clearSlotCache();

        if (facility && selectedEl) {
            selectedEl.hidden = false;
            if (selectedNameEl) selectedNameEl.textContent = facility.name;
            if (selectedBadgeEl) selectedBadgeEl.textContent = facility.kindLabel || '선택됨';
            const metaParts = [facility.region, facility.sigungu, facility.address, facility.phone]
                .filter(Boolean);
            if (selectedMetaEl) selectedMetaEl.textContent = metaParts.join(' · ');
            if (selectedLinksEl) selectedLinksEl.innerHTML = linkHtml(facility);
            if (facilityLabelEl) {
                facilityLabelEl.textContent = `${facility.name} 배치도 (데모 현황)`;
            }
            document.getElementById('columbariumSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (selectedEl) {
            selectedEl.hidden = true;
            if (selectedLinksEl) selectedLinksEl.innerHTML = '';
            if (facilityLabelEl) {
                facilityLabelEl.textContent = '시설을 선택하면 해당 봉안당 배치도가 표시됩니다.';
            }
        }
        draw();
    }

    clearBtn?.addEventListener('click', () => applyFacility(null));

    // ── 검색 UI ───────────────────────────────────────────────
    const catEl = document.getElementById('columbCat');
    const regionEl = document.getElementById('columbRegion');
    const keywordEl = document.getElementById('columbKeyword');
    const searchBtn = document.getElementById('columbSearchBtn');
    const statusEl = document.getElementById('columbSearchStatus');
    const listEl = document.getElementById('columbSearchList');

    function esc(s) {
        return String(s ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function setStatus(msg) {
        if (statusEl) statusEl.textContent = msg;
    }

    async function fetchJson(url) {
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }

    function normalizeFuneral(item) {
        return {
            id: `FF-${item.fcltNm || ''}-${item.addr || ''}`,
            name: item.fcltNm || '이름 없음',
            kind: 'funeral',
            kindLabel: item.gubun ? `장례식장·${item.gubun}` : '장례식장·추모공원',
            region: item.ctpv || '',
            sigungu: item.sigungu || '',
            address: item.addr || '',
            phone: item.telno || item.telNo || '',
            homepage: item.homepageUrl || item.homepage || '',
            raw: item,
        };
    }

    function normalizeCemetery(item) {
        return {
            id: item.id || `NC-${item['명칭'] || ''}`,
            name: item['명칭'] || item.name || '이름 없음',
            kind: 'cemetery',
            kindLabel: item['구분'] ? `국립묘지·${item['구분']}` : '국립묘지',
            region: item.region || '',
            sigungu: item.sigungu || '',
            address: item.address || '',
            phone: item['전화번호'] || '',
            homepage: item['홈페이지'] || item.homepage || item.website || '',
            raw: item,
        };
    }

    async function loadRegions() {
        if (!regionEl) return;
        const regions = new Set();
        try {
            const fr = await fetchJson(`${apiBase}/api/funeral-facilities/regions`);
            (fr.regions || []).forEach((r) => r && regions.add(r));
        } catch (_) { /* ignore */ }
        try {
            const nr = await fetchJson(`${apiBase}/api/national-cemetery/regions`);
            (nr.regions || []).forEach((r) => r && regions.add(r));
        } catch (_) { /* ignore */ }

        const sorted = Array.from(regions).sort((a, b) => a.localeCompare(b, 'ko'));
        regionEl.innerHTML = '<option value="">시도 전체</option>' +
            sorted.map((r) => `<option value="${esc(r)}">${esc(r)}</option>`).join('');
    }

    async function searchFacilities() {
        if (!listEl) return;
        const cat = catEl?.value || 'all';
        const region = (regionEl?.value || '').trim();
        const q = (keywordEl?.value || '').trim();

        // 검색 조건 없으면 결과 비움 (전체 목록 자동 노출 방지)
        if (!q && !region && cat === 'all') {
            listEl.innerHTML = '';
            setStatus('시설명·주소 또는 시도를 선택한 뒤 검색해 주세요.');
            return;
        }

        setStatus('검색 중…');
        listEl.innerHTML = '';

        const tasks = [];
        if (cat === 'all' || cat === 'funeral') {
            const p = new URLSearchParams({ page: '1', size: '30' });
            if (q) p.set('q', q);
            if (region) p.set('ctpv', region);
            tasks.push(
                fetchJson(`${apiBase}/api/funeral-facilities/search?${p}`)
                    .then((d) => ({ ok: true, kind: 'funeral', data: d }))
                    .catch((err) => ({ ok: false, kind: 'funeral', err }))
            );
        }
        if (cat === 'all' || cat === 'cemetery') {
            const p = new URLSearchParams();
            if (q) p.set('keyword', q);
            if (region) p.set('region', region);
            else p.set('region', '전체');
            p.set('gubun', '전체');
            tasks.push(
                fetchJson(`${apiBase}/api/national-cemetery/search?${p}`)
                    .then((d) => ({ ok: true, kind: 'cemetery', data: d }))
                    .catch((err) => ({ ok: false, kind: 'cemetery', err }))
            );
        }

        const results = await Promise.all(tasks);
        const items = [];
        const errors = [];

        results.forEach((r) => {
            if (!r.ok) {
                errors.push(r.kind);
                return;
            }
            if (r.kind === 'funeral') {
                (r.data.items || []).forEach((it) => items.push(normalizeFuneral(it)));
            } else {
                (r.data.items || []).forEach((it) => items.push(normalizeCemetery(it)));
            }
        });

        if (!items.length) {
            const errNote = errors.length
                ? ` (API 오류: ${errors.join(', ')} — ${apiBase})`
                : '';
            setStatus(`검색 결과가 없습니다.${errNote}`);
            return;
        }

        setStatus(`${items.length}곳 검색됨`);
        listEl.innerHTML = items.map((it, idx) => {
            const meta = [it.region, it.sigungu, it.address].filter(Boolean).join(' · ');
            const links = linkHtml(it, { compact: true });
            return `
                <article class="columb-search__card" role="listitem" data-idx="${idx}">
                    <span class="columb-search__card-badge">${esc(it.kindLabel)}</span>
                    <strong class="columb-search__card-name">${esc(it.name)}</strong>
                    ${meta ? `<span class="columb-search__card-meta">${esc(meta)}</span>` : ''}
                    ${it.phone ? `<span class="columb-search__card-phone">${esc(it.phone)}</span>` : ''}
                    ${links ? `<div class="columb-search__card-links">${links}</div>` : ''}
                    <button type="button" class="columb-search__card-cta" data-select="${idx}">이 시설 보기</button>
                </article>
            `;
        }).join('');

        listEl.querySelectorAll('[data-select]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = Number(btn.getAttribute('data-select'));
                const facility = items[idx];
                if (!facility) return;
                listEl.querySelectorAll('.columb-search__card').forEach((b) => b.classList.remove('is-active'));
                btn.closest('.columb-search__card')?.classList.add('is-active');
                applyFacility(facility);
            });
        });
    }

    searchBtn?.addEventListener('click', () => { searchFacilities(); });
    keywordEl?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchFacilities();
        }
    });
    // 구분/시도 변경만으로는 검색하지 않음 — 검색 버튼·Enter 로만 결과 표시

    // ── 최초 렌더 (검색 결과는 비움 — 새로고침 시 자동 목록 없음) ──
    draw();
    window.addEventListener('resize', draw);

    if (listEl) listEl.innerHTML = '';
    setStatus('시설명·주소 또는 시도를 선택한 뒤 검색해 주세요.');

    loadRegions().catch(() => {
        setStatus(`시도 목록을 불러오지 못했습니다. API: ${apiBase}`);
    });
})();
