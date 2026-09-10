/* Shared mobile viewport and navigation. Does not change desktop navigation. */
(() => {
    const root = document.documentElement;
    const mobile = matchMedia('(max-width:820px)');
    const page = root.dataset.mobilePage;
    let frame = 0;
    let maxHeight = innerHeight;
    function updateViewport() {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            if (!mobile.matches) {
                root.style.removeProperty('--mobile-height');
                root.classList.remove('mobile-keyboard');
                return;
            }
            const visual = window.visualViewport;
            // Pinch zoom must remain browser-controlled, not reflow the app.
            if (visual && Math.abs(visual.scale - 1) > .05) return;
            const height = Math.round(visual?.height || innerHeight);
            maxHeight = Math.max(maxHeight, innerHeight);
            root.style.setProperty('--mobile-height', `${height}px`);
            root.classList.toggle('mobile-keyboard', page === 'index' && maxHeight - height > 150);
        });
    }
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', () => { maxHeight = 0; setTimeout(updateViewport, 200); });
    mobile.addEventListener('change', updateViewport);
    updateViewport();

    function init() {
        if (page === 'index') initNavigation();
        if (page === 'asset-manager') {
            const panel = document.getElementById('assetManagerRoot');
            if (panel) {
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.className = 'mobile-section-toggle';
                toggle.setAttribute('aria-controls', 'assetManagerRoot');
                const refresh = () => {
                    const collapsed = panel.classList.contains('mobile-nav-collapsed');
                    const title = panel.querySelector('.asset-content .panel-title strong')?.textContent || '当前分组';
                    toggle.textContent = `${title} · ${collapsed ? '展开库 / 分组 ▾' : '收起库 / 分组 ▴'}`;
                    toggle.setAttribute('aria-expanded', String(!collapsed));
                };
                panel.classList.add('mobile-nav-collapsed');
                toggle.onclick = () => { panel.classList.toggle('mobile-nav-collapsed'); refresh(); };
                panel.before(toggle);
                new MutationObserver(refresh).observe(panel, {childList:true,subtree:true});
                refresh();
            }
        }
        if (page === 'gpt-chat' && mobile.matches) {
            const input = document.getElementById('messageInput');
            if (input) {
                input.rows = 2;
                input.removeAttribute('data-i18n-placeholder');
                input.placeholder = '输入消息，换行后点击发送';
            }
        }
    }
    function initNavigation() {
        const tabs = [
            ['canvas','画布','layout-dashboard'], ['gpt-chat','对话','message-circle'],
            ['online','生图','image'], ['asset-manager','素材','folder-open']
        ];
        const extras = [['api-settings','API 设置'],['comfyui-settings','工作流设置'],['zimage','本地生图'],['enhance','图像增强'],['klein','图像编辑'],['angle','视角控制']];
        const nav = document.createElement('nav');
        nav.className = 'mobile-nav'; nav.setAttribute('aria-label','主要导航');
        const icons = {
            'layout-dashboard':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="11" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 18h7"/>',
            'message-circle':'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5z"/>',
            image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1"/><path d="m21 15-5-5L5 21"/>',
            'folder-open':'<path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v1H7l-4 10V7z"/><path d="M3 20h15l4-10H7z"/>',
            menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
        };
        const iconSvg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
        nav.innerHTML = tabs.map(([id,label,icon]) => `<button type="button" data-mobile-target="${id}">${iconSvg(icon)}<span>${label}</span></button>`).join('') + `<button type="button" id="mobileMore" aria-haspopup="dialog" aria-expanded="false">${iconSvg('menu')}<span>更多</span></button>`;
        const dialog = document.createElement('dialog');
        dialog.className = 'mobile-menu'; dialog.setAttribute('aria-labelledby','mobileMenuTitle');
        dialog.innerHTML = '<div class="mobile-menu-head"><span id="mobileMenuTitle">工具与设置</span><button type="button" aria-label="关闭菜单" data-mobile-close>✕</button></div><div class="mobile-menu-grid">' + extras.map(([id,label]) => `<button type="button" data-mobile-target="${id}">${label}</button>`).join('') + '</div><div class="mobile-menu-actions"><button type="button" data-mobile-theme>切换明暗主题</button><button type="button" data-mobile-language>中文 / English</button></div>';
        document.body.append(nav,dialog);
        const more = nav.querySelector('#mobileMore');
        const sync = () => {
            const id = document.querySelector('iframe.active')?.id.replace('frame-','');
            [...nav.querySelectorAll('[data-mobile-target]'),...dialog.querySelectorAll('[data-mobile-target]')].forEach(button => {
                const active = button.dataset.mobileTarget === id;
                button.classList.toggle('active',active);
                if (active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
            });
            more.classList.toggle('active',extras.some(([target]) => target === id));
        };
        function navigate(event) {
            const button = event.target.closest('[data-mobile-target]');
            if (!button) return;
            const id = button.dataset.mobileTarget;
            const original = [...document.querySelectorAll('#studioSidebar [onclick]')].find(el => el.getAttribute('onclick').includes(`'${id}'`));
            window.switchUI(original || null,id);
            if (dialog.open) dialog.close();
            sync();
        }
        nav.addEventListener('click',navigate);
        dialog.addEventListener('click',navigate);
        more.onclick = () => { dialog.showModal(); more.setAttribute('aria-expanded','true'); };
        dialog.querySelector('[data-mobile-close]').onclick = () => dialog.close();
        dialog.querySelector('[data-mobile-theme]').onclick = () => window.toggleTheme();
        dialog.querySelector('[data-mobile-language]').onclick = () => window.toggleLanguage();
        dialog.addEventListener('click', e => { if (e.target === dialog && e.clientY < dialog.getBoundingClientRect().top) dialog.close(); });
        dialog.addEventListener('close', () => more.setAttribute('aria-expanded','false'));
        mobile.addEventListener('change', () => { if (!mobile.matches && dialog.open) dialog.close(); });
        new MutationObserver(sync).observe(document.querySelector('.stage'),{subtree:true,attributes:true,attributeFilter:['class']});
        window.lucide?.createIcons();
        sync();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
