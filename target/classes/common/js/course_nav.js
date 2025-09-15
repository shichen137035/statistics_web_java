// 全新控制逻辑：渲染目录树 + 展开/折叠 + 状态记忆 + 显示/隐藏
(function(){
    class CourseNav {
        /**
         * @param {Object} opts
         * @param {string} opts.dataUrl - 课程目录 JSON 路径
         * @param {HTMLElement} opts.nav - 侧栏根元素 (#courseNav)
         * @param {HTMLElement} opts.tree - 树根元素 (#courseTree)
         * @param {HTMLElement} opts.mask - 遮罩元素 (#courseNavMask)
         * @param {HTMLElement} opts.toggleBtn - 打开按钮 (#courseNavToggle)
         * @param {string} [opts.linkBase] - 文件类节点的 href 前缀（可选）
         */
        constructor(opts){
            this.dataUrl = opts.dataUrl;
            this.nav = opts.nav;
            this.tree = opts.tree;
            this.mask = opts.mask;
            this.toggleBtn = opts.toggleBtn;
            this.closeBtn = this.nav.querySelector('.course-nav__close');
            this.linkBase = opts.linkBase || '';
            this.storageKey = `CourseNav:v1:open:${this.dataUrl}`;
            this.nodes = [];
            this._bindShellEvents();
        }

        _bindShellEvents(){
            if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.show());
            if (this.closeBtn)  this.closeBtn.addEventListener('click', () => this.hide());
            if (this.mask)      this.mask.addEventListener('click', () => this.hide());

            // ESC 关闭
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible()) this.hide();
            });
        }

        isVisible(){ return this.nav.classList.contains('is-visible'); }

        show(){
            this.nav.classList.add('is-visible');
            this.nav.setAttribute('aria-hidden', 'false');
            if (this.mask) this.mask.hidden = false;
        }

        hide(){
            this.nav.classList.remove('is-visible');
            this.nav.setAttribute('aria-hidden', 'true');
            if (this.mask) this.mask.hidden = true;
        }

        async init(){
            await this._loadData();
            this._renderTree();
            this._restoreOpenState();
            this._maybeMarkActive();
            this._bindTreeEvents();
        }

        async _loadData(){
            const res = await fetch(this.dataUrl, { cache: 'no-store' });
            if (!res.ok) throw new Error(`Cannot load: ${this.dataUrl} (${res.status})`);
            this.nodes = await res.json();
        }

        _renderTree(){
            this.tree.innerHTML = '';
            const frag = document.createDocumentFragment();
            this.nodes.forEach(n => frag.appendChild(this._renderNode(n)));
            this.tree.appendChild(frag);
            this.tree.setAttribute('role', 'tree');
        }

        _renderNode(node){
            const li = document.createElement('li');
            li.className = 'course-nav__node';
            li.dataset.name = String(node.name || '').trim();

            const row = document.createElement('div');
            row.className = 'course-nav__row';
            row.setAttribute('role', 'treeitem');
            row.setAttribute('tabindex', '-1');

            const icon = document.createElement('span');
            icon.className = 'course-nav__icon';

            if (node.type === 'folder'){
                li.classList.add('is-folder');
                const caret = document.createElement('span');
                caret.className = 'course-nav__caret';
                caret.textContent = '▶';
                icon.appendChild(caret);

                const name = document.createElement('span');
                name.className = 'course-nav__name';
                name.textContent = node.name || '';

                row.appendChild(icon);
                row.appendChild(name);
                li.appendChild(row);

                const ul = document.createElement('ul');
                ul.className = 'course-nav__children';
                ul.setAttribute('role', 'group');
                li.appendChild(ul);

                (node.children || []).forEach(ch => {
                    ul.appendChild(this._renderNode(ch));
                });

                // 初始 aria
                row.setAttribute('aria-expanded', 'false');
            } else { // file
                li.classList.add('is-file');
                icon.textContent = '📄';

                const link = document.createElement('a');
                link.className = 'course-nav__link';
                link.textContent = node.name || '';
                const href = (node.path || '').replace(/^\/+/, '');
                link.href = this.linkBase ? (this.linkBase.replace(/\/+$/,'') + '/' + href) : ('/' + href);

                row.appendChild(icon);
                row.appendChild(link);
                li.appendChild(row);
            }
            return li;
        }

        _bindTreeEvents(){
            // 事件委托：点击行切换文件夹
            this.tree.addEventListener('click', (e) => {
                const row = e.target.closest('.course-nav__row');
                if (!row) return;

                const li = row.parentElement;
                if (!li.classList.contains('is-folder')) return;

                this._toggleFolder(li);
            });

            // 键盘支持：Enter/Space 切换
            this.tree.addEventListener('keydown', (e) => {
                const row = e.target.closest('.course-nav__row');
                if (!row) return;
                const li = row.parentElement;

                if ((e.key === 'Enter' || e.key === ' ') && li.classList.contains('is-folder')){
                    e.preventDefault();
                    this._toggleFolder(li);
                }
            });

            // 小屏点击文件后自动关闭（可选）
            this.tree.addEventListener('click', (e) => {
                const link = e.target.closest('.course-nav__link');
                if (!link) return;
                if (window.matchMedia('(max-width: 767px)').matches){
                    this.hide();
                }
            });
        }

        _toggleFolder(li){
            const willOpen = !li.classList.contains('is-open');
            li.classList.toggle('is-open', willOpen);

            // aria-expanded
            const row = li.querySelector('.course-nav__row');
            if (row) row.setAttribute('aria-expanded', String(willOpen));

            this._saveOpenState();
        }

        _keyOf(el){
            // 使用祖先目录名拼接，确保唯一
            const names = [];
            let cur = el;
            while (cur && cur !== this.tree){
                if (cur.classList && cur.classList.contains('course-nav__node')){
                    const nm = (cur.dataset.name || '').trim();
                    if (nm) names.unshift(nm);
                }
                cur = cur.parentElement;
            }
            return names.join('/');
        }

        _saveOpenState(){
            const keys = [];
            this.tree.querySelectorAll('.course-nav__node.is-folder.is-open').forEach(li => {
                keys.push(this._keyOf(li));
            });
            try { localStorage.setItem(this.storageKey, JSON.stringify(keys)); } catch {}
        }

        _restoreOpenState(){
            let keys = [];
            try {
                const raw = localStorage.getItem(this.storageKey);
                if (raw) keys = JSON.parse(raw) || [];
            } catch {}
            if (!keys.length) return;

            this.tree.querySelectorAll('.course-nav__node.is-folder').forEach(li => {
                const k = this._keyOf(li);
                if (keys.includes(k)) {
                    li.classList.add('is-open');
                    const row = li.querySelector('.course-nav__row');
                    if (row) row.setAttribute('aria-expanded', 'true');
                }
            });
        }

        _maybeMarkActive(){
            const here = location.pathname.replace(/\/{2,}/g,'/').replace(/\/$/,'');
            let best = null, bestLen = -1;
            this.tree.querySelectorAll('.course-nav__node.is-file .course-nav__link').forEach(a => {
                const url = new URL(a.href, location.origin);
                const p = url.pathname.replace(/\/{2,}/g,'/').replace(/\/$/,'');
                if (here === p || (here.endsWith(p) && p.length > bestLen)) { best = a; bestLen = p.length; }
            });
            if (best){
                const li = best.closest('.course-nav__node');
                li.classList.add('is-active');
                // 自动展开其父级
                let cur = li.parentElement;
                while (cur && cur !== this.tree){
                    if (cur.classList && cur.classList.contains('course-nav__children')){
                        const pLi = cur.parentElement;
                        if (pLi && pLi.classList.contains('is-folder')){
                            pLi.classList.add('is-open');
                            const row = pLi.querySelector('.course-nav__row');
                            if (row) row.setAttribute('aria-expanded','true');
                        }
                    }
                    cur = cur.parentElement;
                }
            }
        }
    }

    // // 暴露到全局，供挂载脚本使用
    window.CourseNav = CourseNav;
})();
