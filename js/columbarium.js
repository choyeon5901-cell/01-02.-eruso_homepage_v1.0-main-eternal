/**
 * columbarium.js — 봉안당 Canvas 뷰어
 * 서버 없이 동작하는 순수 클라이언트 뷰어
 * 
 * 구조: 동(A/B/C) × 층(1/2/3) × 격자(rows×cols)
 * - 황금색: 사용중  |  녹색: 분양가능  |  흰색테두리: 선택됨
 */
(function initColumbarium() {
    'use strict';

    const canvas = document.getElementById('columbariumCanvas');
    const infoPanel = document.getElementById('columbInfoPanel');
    const infoContent = document.getElementById('columbInfoContent');
    const infoClose = document.getElementById('columbInfoClose');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

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

    // ── 샘플 데이터 생성 ──────────────────────────────────────
    function makeData(zone, floor) {
        const data = {};
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const key = `${r}-${c}`;
                const rand = Math.random();
                const row_label = r + 1;
                const col_label = c + 1;
                data[key] = {
                    id:       `${zone}${floor}-${String(row_label).padStart(2,'0')}${String(col_label).padStart(2,'0')}`,
                    zone,
                    floor,
                    row:      row_label,
                    col:      col_label,
                    occupied: rand < 0.65,
                    name:     rand < 0.65 ? pickName() : null,
                    birth:    rand < 0.65 ? pickDate(1920, 1970) : null,
                    death:    rand < 0.65 ? pickDate(1990, 2024) : null,
                    price:    rand < 0.35 ? null : `${(Math.floor(Math.random() * 6) + 4) * 50}만원`,
                };
            }
        }
        return data;
    }

    const NAMES = ['홍길동','이순신','김철수','박영희','최갑순','정민우','강지연','윤성호','임미란','송태양'];
    function pickName() { return NAMES[Math.floor(Math.random() * NAMES.length)]; }
    function pickDate(from, to) {
        const y = from + Math.floor(Math.random() * (to - from));
        const m = String(Math.floor(Math.random() * 12) + 1).padStart(2,'0');
        const d = String(Math.floor(Math.random() * 28) + 1).padStart(2,'0');
        return `${y}-${m}-${d}`;
    }

    // 동/층별 데이터 캐시
    const cache = {};
    function getData() {
        const key = `${activeZone}-${activeFloor}`;
        if (!cache[key]) cache[key] = makeData(activeZone, activeFloor);
        return cache[key];
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

    function draw() {
        const W = canvas.width;
        const H = canvas.height;
        const data = getData();

        ctx.clearRect(0, 0, W, H);

        // 배경
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#1a1f2e');
        bg.addColorStop(1, '#0f1420');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // 행 번호 레이블
        ctx.fillStyle = COLOR.label;
        ctx.font = 'bold 13px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        for (let r = 0; r < ROWS; r++) {
            const rect = cellRect(r, 0);
            ctx.fillText(`${r + 1}행`, PAD_LEFT - 8, rect.y + CELL_H / 2);
        }

        // 열 번호 레이블
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        for (let c = 0; c < COLS; c++) {
            const rect = cellRect(0, c);
            ctx.fillText(`${c + 1}`, rect.x + CELL_W / 2, PAD_TOP - 6);
        }

        // 셀
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const key  = `${r}-${c}`;
                const cell = data[key];
                const rect = cellRect(r, c);
                const isHover    = hoverCell && hoverCell.r === r && hoverCell.c === c;
                const isSelected = selectedCell && selectedCell.r === r && selectedCell.c === c;

                // 셀 배경
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

                // 선택 테두리
                if (isSelected) {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth   = 2.5;
                    ctx.stroke();
                }

                // 칸 번호 텍스트
                ctx.fillStyle = cell.occupied
                    ? (isSelected ? '#fff' : 'rgba(30,20,10,0.85)')
                    : 'rgba(255,255,255,0.9)';
                ctx.font = `bold ${Math.min(12, CELL_H * 0.28)}px "Noto Sans KR", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.id.split('-')[1], rect.x + rect.w / 2, rect.y + rect.h / 2);
            }
        }

        // 구역 정보 타이틀
        ctx.fillStyle = 'rgba(200,169,110,0.9)';
        ctx.font = 'bold 14px "Noto Sans KR", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(`${activeZone}동 ${activeFloor}층`, PAD_LEFT, 8);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
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

    // 터치 지원
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

        const badge = cell.occupied
            ? '<span style="background:rgba(200,169,110,0.85);color:#1a1206;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:800;">사용중</span>'
            : '<span style="background:rgba(48,200,140,0.8);color:#082820;border-radius:6px;padding:2px 10px;font-size:12px;font-weight:800;">분양가능</span>';

        const detail = cell.occupied
            ? `<p style="margin:10px 0 0;font-size:14px;color:rgba(240,240,240,0.75);">故 <strong style="font-size:16px;color:#f0f0f0;">${cell.name}</strong></p>
               <p style="font-size:12px;color:rgba(240,240,240,0.5);margin:4px 0 0;">생년월일: ${cell.birth}</p>
               <p style="font-size:12px;color:rgba(240,240,240,0.5);">사망일: ${cell.death}</p>`
            : `<p style="margin:10px 0 0;font-size:13px;color:rgba(240,240,240,0.65);">분양 상담 가능합니다.</p>
               ${cell.price ? `<p style="font-size:15px;color:#c8a96e;font-weight:800;margin:6px 0 0;">분양가: ${cell.price}</p>` : ''}`;

        infoContent.innerHTML = `
            <p style="font-size:13px;color:rgba(200,169,110,0.8);font-weight:700;margin:0 0 4px;">
                ${activeZone}동 ${activeFloor}층 / ${cell.id}
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

    // ── 탭 이벤트 ─────────────────────────────────────────────
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

    // ── 최초 렌더 ─────────────────────────────────────────────
    draw();
    // 윈도우 리사이즈 시 재렌더
    window.addEventListener('resize', draw);
})();
