/**
 * 홈페이지 의견게시판 — 페이지 이동 없이 팝업.
 * 목록은 서버 페이징(12건)만 요청한다.
 */
(function initCommunityBoardPopup() {
    const PAGE_SIZE = 12;
    const CATEGORIES = [
        { value: "feature_request", label: "기능 제안" },
        { value: "bug_report", label: "오류 신고" },
        { value: "ui_ux", label: "UI/UX" },
        { value: "content", label: "콘텐츠" },
        { value: "pricing", label: "요금/결제" },
        { value: "other", label: "기타" },
    ];
    const STATUS_LABEL = {
        pending: "신청",
        reviewing: "검토중",
        accepted: "접수",
        approved: "승인",
        applied: "완료",
        rejected: "반려",
        deferred: "보류",
    };

    const host = (location.hostname || "").toLowerCase();
    const isLocal = host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
    const metaApi = document.querySelector('meta[name="eruso-api-base"]')?.getAttribute("content");
    const apiBase = (isLocal ? "http://localhost:1210" : (metaApi || "https://api.erum2026.co.kr")).replace(/\/$/, "");

    let overlay = null;
    let page = 1;
    let total = 0;
    let category = "all";
    let titleQ = "";
    let authorQ = "";
    let statusFilter = "all";
    let dateFrom = "";
    let dateTo = "";
    let view = "list";
    let detailItem = null;
    let abortCtl = null;
    let prevOverflow = "";

    function esc(s) {
        return String(s || "").replace(/[&<>"']/g, (c) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        }[c]));
    }

    function catLabel(value) {
        return CATEGORIES.find((c) => c.value === value)?.label || value || "-";
    }

    function displayAuthor(item) {
        if (item && item.author_label) return item.author_label;
        if (item && item.is_member) {
            const text = String(item.author_name || "").trim();
            if (!text || text.startsWith("aes256gcm:")) return "(회)";
            return text + "(회)";
        }
        return "익명";
    }

    function fmtDate(iso, withTime) {
        if (!iso) return "";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        if (!withTime) return y + "-" + m + "-" + day;
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        return y + "-" + m + "-" + day + " " + hh + ":" + mm;
    }

    function fmtExpected(iso) {
        if (!iso) return "";
        const raw = String(iso);
        const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (m) return "~" + Number(m[2]) + "/" + Number(m[3]);
        return "";
    }

    function statusText(item) {
        if (!item) return "-";
        if (item.status === "approved") {
            const when = fmtExpected(item.expected_at);
            return when ? "승인 " + when : "승인";
        }
        if (item.status === "rejected") {
            const reason = String(item.reviewer_note || "").trim();
            if (reason && !reason.startsWith("[AI")) return "반려 (반려사유 : " + reason + ")";
            return "반려";
        }
        return STATUS_LABEL[item.status] || item.status || "-";
    }

    function visiblePages(current, last) {
        if (last <= 7) {
            return Array.from({ length: last }, (_, i) => i + 1);
        }
        const set = new Set([1, last, current - 1, current, current + 1]);
        return [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
    }

    function parseList(data) {
        if (Array.isArray(data)) return { items: data, total: data.length };
        return {
            items: Array.isArray(data?.items) ? data.items : [],
            total: Number(data?.total) || 0,
        };
    }

    function closeNavDrawer() {
        document.getElementById("navMenu")?.classList.remove("active");
        const backdrop = document.getElementById("navDrawerBackdrop");
        if (backdrop) {
            backdrop.classList.remove("is-open");
            backdrop.setAttribute("hidden", "");
        }
        const toggle = document.querySelector(".nav-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = prevOverflow || "";
    }

    function closePilotNotice() {
        const el = document.getElementById("pilot-notice");
        if (!el) return;
        el.style.display = "none";
        el.setAttribute("hidden", "");
        el.setAttribute("aria-hidden", "true");
    }

    function ensureOverlay() {
        if (overlay) return overlay;
        overlay = document.createElement("div");
        overlay.id = "eruso-community-popup";
        overlay.className = "eruso-board-overlay";
        overlay.hidden = true;
        overlay.innerHTML = `
            <div class="eruso-board-dialog" role="dialog" aria-modal="true" aria-labelledby="eruso-board-title">
                <header class="eruso-board-head">
                    <div>
                        <p class="eruso-board-kicker">COMMUNITY</p>
                        <h2 id="eruso-board-title">의견게시판</h2>
                    </div>
                    <div class="eruso-board-head-actions">
                        <button type="button" class="eruso-board-write-btn" data-board-write>글쓰기</button>
                        <button type="button" class="eruso-board-close" data-board-close aria-label="닫기">×</button>
                    </div>
                </header>
                <div class="eruso-board-body" data-board-body></div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeBoard();
        });
        overlay.querySelector("[data-board-close]").addEventListener("click", closeBoard);
        overlay.querySelector("[data-board-write]").addEventListener("click", () => showWrite());
        overlay.addEventListener("click", (e) => {
            const pageBtn = e.target.closest("[data-board-page]");
            if (pageBtn) {
                const next = Number(pageBtn.getAttribute("data-board-page"));
                if (next >= 1) {
                    page = next;
                    loadList();
                }
                return;
            }
            const row = e.target.closest("[data-board-id]");
            if (row) {
                openDetail(Number(row.getAttribute("data-board-id")));
            }
        });
        return overlay;
    }

    function setView(next) {
        view = next;
        const writeBtn = overlay?.querySelector("[data-board-write]");
        if (writeBtn) writeBtn.hidden = next === "write";
    }

    async function api(path, options) {
        if (abortCtl && (!options || options.method == null || options.method === "GET")) {
            abortCtl.abort();
        }
        const method = (options && options.method) || "GET";
        if (method === "GET") abortCtl = new AbortController();
        const res = await fetch(apiBase + path, {
            ...(options || {}),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                ...((options && options.headers) || {}),
            },
            signal: method === "GET" ? abortCtl.signal : undefined,
        });
        let data = {};
        try {
            data = await res.json();
        } catch (_) {
            data = {};
        }
        if (!res.ok) {
            const detail = data.detail;
            const msg = typeof detail === "string" ? detail : (data.message || "요청에 실패했습니다.");
            throw new Error(msg);
        }
        return data;
    }

    function renderPager() {
        const last = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (last <= 1) return "";
        const pages = visiblePages(page, last);
        let html = '<div class="eruso-board-pager">';
        html += `<button type="button" data-board-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>이전</button>`;
        let prev = 0;
        pages.forEach((n) => {
            if (prev && n - prev > 1) html += '<span class="eruso-board-ellipsis">…</span>';
            html += `<button type="button" data-board-page="${n}" class="${n === page ? "is-on" : ""}">${n}</button>`;
            prev = n;
        });
        html += `<button type="button" data-board-page="${page + 1}" ${page >= last ? "disabled" : ""}>다음</button>`;
        html += "</div>";
        return html;
    }

    function renderList(items, loading, error) {
        const body = overlay.querySelector("[data-board-body]");
        const catOpts = [{ value: "all", label: "전체" }].concat(CATEGORIES)
            .map((c) => `<option value="${esc(c.value)}"${category === c.value ? " selected" : ""}>${esc(c.label)}</option>`)
            .join("");
        const statusOpts = [{ value: "all", label: "전체" }].concat(
            Object.keys(STATUS_LABEL).map((k) => ({ value: k, label: STATUS_LABEL[k] }))
        ).map((s) => `<option value="${esc(s.value)}"${statusFilter === s.value ? " selected" : ""}>${esc(s.label)}</option>`).join("");

        let rows = "";
        if (loading) {
            rows = '<tr><td colspan="6" class="eruso-board-empty">불러오는 중…</td></tr>';
        } else if (error) {
            rows = `<tr><td colspan="6" class="eruso-board-empty">${esc(error)}</td></tr>`;
        } else if (!items.length) {
            rows = '<tr><td colspan="6" class="eruso-board-empty">아직 등록된 글이 없습니다.</td></tr>';
        } else {
            rows = items.map((item, idx) => {
                const no = total - ((page - 1) * PAGE_SIZE + idx);
                const lock = item.has_password ? "🔒 " : "";
                return `<tr class="eruso-board-row" data-board-id="${item.id}" tabindex="0">
                    <td class="is-center">${no}</td>
                    <td class="is-center">${esc(catLabel(item.category))}</td>
                    <td class="is-title">${lock}${esc(item.title)}</td>
                    <td class="is-center">${esc(displayAuthor(item))}</td>
                    <td class="is-center">${esc(fmtDate(item.created_at))}</td>
                    <td class="is-center">${esc(statusText(item))}</td>
                </tr>`;
            }).join("");
        }

        const cards = (!loading && !error && items.length)
            ? items.map((item, idx) => {
                const no = total - ((page - 1) * PAGE_SIZE + idx);
                const lock = item.has_password ? "🔒 " : "";
                return `<button type="button" class="eruso-board-card" data-board-id="${item.id}">
                    <span class="eruso-board-card-meta">${esc(catLabel(item.category))} · ${esc(fmtDate(item.created_at))}</span>
                    <strong>${no}. ${lock}${esc(item.title)}</strong>
                    <span>${esc(displayAuthor(item))} · ${esc(statusText(item))}</span>
                </button>`;
            }).join("")
            : "";

        body.innerHTML = `
            <p class="eruso-board-sub">등록하면 바로 게시판에 표시되고, 담당자가 검토합니다.</p>
            <form class="eruso-board-search" data-board-search>
                <div class="eruso-board-search-row">
                    <label>분류 <select name="category">${catOpts}</select></label>
                    <label>상태 <select name="status">${statusOpts}</select></label>
                    <label>시작일 <input type="date" name="date_from" value="${esc(dateFrom)}"></label>
                    <label>종료일 <input type="date" name="date_to" value="${esc(dateTo)}"></label>
                    <button type="submit" class="eruso-board-search-go">조회</button>
                    <button type="button" class="eruso-board-search-reset" data-board-reset>초기화</button>
                </div>
                <div class="eruso-board-search-row">
                    <label>제목 <input name="title" value="${esc(titleQ)}" placeholder="제목 검색"></label>
                    <label>작성자 <input name="author" value="${esc(authorQ)}" placeholder="이름·아이디"></label>
                    <span class="eruso-board-count">총 ${total.toLocaleString("ko-KR")}건</span>
                </div>
            </form>
            <div class="eruso-board-table-wrap">
                <table class="eruso-board-table">
                    <thead>
                        <tr>
                            <th>번호</th><th>분류</th><th>제목</th><th>작성자</th><th>작성일</th><th>상태</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div class="eruso-board-mobile">${loading || error ? "" : (cards || '<p class="eruso-board-empty">아직 등록된 글이 없습니다.</p>')}</div>
            ${renderPager()}
        `;
        const form = body.querySelector("[data-board-search]");
        form?.addEventListener("submit", (e) => {
            e.preventDefault();
            category = form.category.value || "all";
            statusFilter = form.status.value || "all";
            titleQ = (form.title.value || "").trim();
            authorQ = (form.author.value || "").trim();
            dateFrom = form.date_from.value || "";
            dateTo = form.date_to.value || "";
            page = 1;
            loadList();
        });
        body.querySelector("[data-board-reset]")?.addEventListener("click", () => {
            category = "all";
            statusFilter = "all";
            titleQ = "";
            authorQ = "";
            dateFrom = "";
            dateTo = "";
        });
    }

    async function loadList() {
        setView("list");
        renderList([], true, "");
        try {
            const params = new URLSearchParams({
                board: "homepage",
                skip: String((page - 1) * PAGE_SIZE),
                limit: String(PAGE_SIZE),
            });
            if (category && category !== "all") params.set("category", category);
            if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
            if (titleQ) params.set("title", titleQ);
            if (authorQ) params.set("author", authorQ);
            if (dateFrom) params.set("date_from", dateFrom);
            if (dateTo) params.set("date_to", dateTo);
            const data = parseList(await api("/api/community/feedback?" + params.toString()));
            total = data.total;
            const last = Math.max(1, Math.ceil(total / PAGE_SIZE) || 1);
            if (page > last) {
                page = last;
                return loadList();
            }
            renderList(data.items, false, "");
        } catch (err) {
            if (err && err.name === "AbortError") return;
            total = 0;
            renderList([], false, err.message || "목록을 불러오지 못했습니다.");
        }
    }

    function renderDetail(item, loading) {
        const body = overlay.querySelector("[data-board-body]");
        if (loading || !item) {
            body.innerHTML = `
                <button type="button" class="eruso-board-back" data-board-back>← 목록</button>
                <p class="eruso-board-empty">${loading ? "불러오는 중…" : "글을 찾을 수 없습니다."}</p>
            `;
            body.querySelector("[data-board-back]").addEventListener("click", () => loadList());
            return;
        }
        const extra = [];
        if (!item.content_locked) {
            if (item.ai_summary) extra.push(`<p><strong>요약</strong> ${esc(item.ai_summary)}</p>`);
            if (item.status === "approved" && item.expected_at) {
                extra.push(`<p><strong>적용예상시간</strong> ${esc(fmtExpected(item.expected_at))}</p>`);
            }
            if (item.status === "rejected" && item.reviewer_note && !String(item.reviewer_note).startsWith("[AI 자동처리]")) {
                extra.push(`<p><strong>반려사유</strong> ${esc(item.reviewer_note)}</p>`);
            }
            if (item.applied_note) extra.push(`<p><strong>운영 메모</strong> ${esc(item.applied_note)}</p>`);
        }
        const bodyHtml = item.content_locked
            ? `<form class="eruso-board-form" data-board-unlock>
                    <p class="eruso-board-sub">비밀번호가 있는 글입니다. 비밀번호를 입력하면 내용을 확인할 수 있습니다.</p>
                    <label>비밀번호
                        <input name="password" type="password" required autocomplete="current-password">
                    </label>
                    <p class="eruso-board-error" data-unlock-error hidden></p>
                    <div class="eruso-board-form-actions">
                        <button type="submit" class="eruso-board-write-btn">내용 확인</button>
                    </div>
               </form>`
            : `<div class="eruso-board-detail-body">${esc(item.content).replace(/\n/g, "<br>")}</div>
               ${extra.length ? `<div class="eruso-board-detail-note">${extra.join("")}</div>` : ""}`;
        body.innerHTML = `
            <button type="button" class="eruso-board-back" data-board-back>← 목록</button>
            <h3 class="eruso-board-detail-title">${item.has_password ? "🔒 " : ""}${esc(item.title)}</h3>
            <div class="eruso-board-detail-meta">
                <span>${esc(catLabel(item.category))}</span>
                <span>작성자 ${esc(displayAuthor(item))}</span>
                <span>작성일 ${esc(fmtDate(item.created_at, true))}</span>
                <span>상태 ${esc(statusText(item))}</span>
            </div>
            ${bodyHtml}
        `;
        body.querySelector("[data-board-back]").addEventListener("click", () => loadList());
        const unlockForm = body.querySelector("[data-board-unlock]");
        if (unlockForm) {
            unlockForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const errEl = unlockForm.querySelector("[data-unlock-error]");
                const btn = unlockForm.querySelector('button[type="submit"]');
                errEl.hidden = true;
                btn.disabled = true;
                try {
                    detailItem = await api("/api/community/feedback/" + encodeURIComponent(item.id) + "/unlock", {
                        method: "POST",
                        body: JSON.stringify({ password: (unlockForm.password.value || "").trim() }),
                    });
                    renderDetail(detailItem, false);
                } catch (err) {
                    errEl.hidden = false;
                    errEl.textContent = err.message || "비밀번호가 일치하지 않습니다.";
                    btn.disabled = false;
                }
            });
        }
    }

    async function openDetail(id) {
        setView("detail");
        renderDetail(null, true);
        try {
            detailItem = await api("/api/community/feedback/" + encodeURIComponent(id));
            renderDetail(detailItem, false);
        } catch (err) {
            renderDetail(null, false);
        }
    }

    function showWrite(doneMsg) {
        setView("write");
        const body = overlay.querySelector("[data-board-body]");
        const catOpts = CATEGORIES.map((c) => `<option value="${esc(c.value)}">${esc(c.label)}</option>`).join("");
        body.innerHTML = `
            <button type="button" class="eruso-board-back" data-board-back>← 목록</button>
            <h3 class="eruso-board-detail-title">의견 등록</h3>
            <p class="eruso-board-sub">등록하면 바로 게시판에 표시됩니다. 담당자가 검토합니다.</p>
            ${doneMsg ? `<p class="eruso-board-ok">${esc(doneMsg)}</p>` : ""}
            <form class="eruso-board-form" data-board-form>
                <label>분류
                    <select name="category">${catOpts}</select>
                </label>
                <label>이름 <span class="eruso-board-req">*</span>
                    <input name="guest_name" maxlength="100" required placeholder="이름 또는 닉네임" autocomplete="name">
                </label>
                <label>비밀번호 <span class="eruso-board-opt">(선택)</span>
                    <input name="guest_password" type="password" maxlength="64" placeholder="내용을 확인할 때 사용합니다" autocomplete="new-password">
                </label>
                <label>제목
                    <input name="title" maxlength="200" required placeholder="제목을 입력하세요">
                </label>
                <label>내용
                    <textarea name="content" maxlength="2000" required rows="6" placeholder="내용을 입력하세요"></textarea>
                </label>
                <p class="eruso-board-error" data-board-error hidden></p>
                <div class="eruso-board-form-actions">
                    <button type="button" class="eruso-board-cancel" data-board-back>취소</button>
                    <button type="submit" class="eruso-board-write-btn">등록</button>
                </div>
            </form>
        `;
        body.querySelectorAll("[data-board-back]").forEach((btn) => {
            btn.addEventListener("click", () => loadList());
        });
        body.querySelector("[data-board-form]").addEventListener("submit", onSubmit);
    }

    async function onSubmit(e) {
        e.preventDefault();
        const form = e.currentTarget;
        const errEl = form.querySelector("[data-board-error]");
        const submitBtn = form.querySelector('button[type="submit"]');
        const payload = {
            board: "homepage",
            category: form.category.value,
            guest_name: (form.guest_name.value || "").trim(),
            guest_password: (form.guest_password.value || "").trim() || undefined,
            title: (form.title.value || "").trim(),
            content: (form.content.value || "").trim(),
        };
        errEl.hidden = true;
        if (!payload.guest_name) {
            errEl.hidden = false;
            errEl.textContent = "이름을 입력해 주세요.";
            return;
        }
        if (payload.title.length < 2) {
            errEl.hidden = false;
            errEl.textContent = "제목을 2자 이상 입력해 주세요.";
            return;
        }
        if (payload.content.length < 5) {
            errEl.hidden = false;
            errEl.textContent = "내용을 5자 이상 입력해 주세요.";
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = "등록 중…";
        try {
            const res = await api("/api/community/feedback", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            page = 1;
            if (res && res.id) {
                if (payload.guest_password) {
                    try {
                        detailItem = await api("/api/community/feedback/" + encodeURIComponent(res.id) + "/unlock", {
                            method: "POST",
                            body: JSON.stringify({ password: payload.guest_password }),
                        });
                        setView("detail");
                        renderDetail(detailItem, false);
                    } catch (_) {
                        await openDetail(res.id);
                    }
                } else {
                    await openDetail(res.id);
                }
            } else {
                await loadList();
            }
        } catch (err) {
            errEl.hidden = false;
            errEl.textContent = err.message || "등록에 실패했습니다.";
            submitBtn.disabled = false;
            submitBtn.textContent = "등록";
        }
    }

    function openBoard(startView) {
        ensureOverlay();
        closePilotNotice();
        closeNavDrawer();
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        overlay.hidden = false;
        overlay.removeAttribute("hidden");
        page = 1;
        category = "all";
        titleQ = "";
        authorQ = "";
        statusFilter = "all";
        dateFrom = "";
        dateTo = "";
        if (startView === "write") showWrite();
        else loadList();
        overlay.querySelector(".eruso-board-close")?.focus();
    }

    function closeBoard() {
        if (!overlay) return;
        overlay.hidden = true;
        overlay.setAttribute("hidden", "");
        document.body.style.overflow = prevOverflow || "";
        if (abortCtl) abortCtl.abort();
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && overlay && !overlay.hidden) {
            if (view !== "list") loadList();
            else closeBoard();
        }
    });

    document.addEventListener("click", (e) => {
        const link = e.target.closest(".js-community-board");
        if (!link) return;
        if (e.defaultPrevented) return;
        if (e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const start = link.getAttribute("data-community-view") === "write" ? "write" : "list";
        openBoard(start);
    });
})();
