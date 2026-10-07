/**
 * 봉안당 화면은 templates/columbarium/{번호}/ 구현을 그대로 붙인다.
 * active.txt 의 숫자만 바꾸면 다른 템플릿이 열리고,
 * 그 폴더의 view.html / view.css / view.js 만 고치면 새로고침 때 화면이 바뀐다.
 */
(function loadColumbariumTemplate() {
    'use strict';

    const root = document.getElementById('columbarium-template-root');
    if (!root) return;

    const base = 'templates/columbarium/';

    function ensureFonts() {
        if (document.getElementById('eruso-tpl-fonts')) return;
        const link = document.createElement('link');
        link.id = 'eruso-tpl-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&family=Noto+Sans+KR:wght@400;500;600;700&family=Noto+Serif+KR:wght@600;700&display=swap';
        document.head.appendChild(link);
    }

    function attachWhenReady() {
        if (!window.ErusoColumbarium || !window.ErusoColumbariumTemplate) return false;
        window.ErusoColumbarium.attach(window.ErusoColumbariumTemplate);
        return true;
    }

    async function load() {
        ensureFonts();
        const activeText = await fetch(base + 'active.txt', { cache: 'no-store' }).then((r) => {
            if (!r.ok) throw new Error('active.txt ' + r.status);
            return r.text();
        });
        const n = parseInt(String(activeText).trim(), 10) || 1;
        const dir = base + n + '/';
        const [html, css, js] = await Promise.all([
            fetch(dir + 'view.html', { cache: 'no-store' }).then((r) => {
                if (!r.ok) throw new Error('view.html ' + r.status);
                return r.text();
            }),
            fetch(dir + 'view.css', { cache: 'no-store' }).then((r) => {
                if (!r.ok) throw new Error('view.css ' + r.status);
                return r.text();
            }),
            fetch(dir + 'view.js', { cache: 'no-store' }).then((r) => {
                if (!r.ok) throw new Error('view.js ' + r.status);
                return r.text();
            }),
        ]);

        let style = document.getElementById('columbarium-template-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'columbarium-template-style';
            document.head.appendChild(style);
        }
        style.textContent = css;
        root.dataset.template = String(n);
        root.innerHTML = html;
        root.querySelectorAll('[data-tpl-badge]').forEach((el) => {
            el.textContent = '템플릿 #' + n;
        });

        const script = document.createElement('script');
        script.setAttribute('data-columbarium-template', String(n));
        if (/^\s*import\s/m.test(js)) script.type = 'module';
        script.textContent = js;
        document.body.appendChild(script);

        if (!attachWhenReady()) {
            const timer = window.setInterval(() => {
                if (attachWhenReady()) window.clearInterval(timer);
            }, 40);
            window.setTimeout(() => window.clearInterval(timer), 25000);
        }
    }

    load().catch((err) => {
        console.error(err);
        root.innerHTML = '<p class="columb-template-error">봉안당 템플릿을 불러오지 못했습니다.</p>';
    });
})();
