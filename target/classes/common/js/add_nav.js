// 把组件插入主页面，并初始化
(function(){
    async function ensureCss(href){
        if ([...document.styleSheets].some(s => s.href && s.href.includes(href))) return;
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
        await new Promise(r => link.addEventListener('load', r, { once:true }));
    }

    async function mountCourseNav({
                                      containerSelector = '#course-nav',     // 页面上用于承载组件的占位容器
                                      htmlUrl = '/component/course_nav.html',
                                      cssUrl  = '/component/course_nav.css',
                                      dataUrl = '/component/course.json',
                                      linkBase = '/main/course'              // 文件节点链接前缀（可按需改）
                                  } = {}){
        await ensureCss(cssUrl);

        // 确保容器存在，不存在则创建到 body 开头
        let container = document.querySelector(containerSelector);
        if (!container){
            container = document.createElement('div');
            container.id = containerSelector.replace(/^#/, '');
            document.body.prepend(container);
        }

        // 加载 HTML 片段
        const res = await fetch(htmlUrl, { cache: 'no-store' });
        const html = await res.text();
        container.innerHTML = html;

        // 取 DOM 引用
        const nav = document.getElementById('courseNav');
        const tree = document.getElementById('courseTree');
        const mask = document.getElementById('courseNavMask');
        const toggleBtn = document.getElementById('courseNavToggle');

        if (!nav || !tree) {
            console.error('CourseNav: missing required DOM. Check course_nav.html structure.');
            return;
        }

        // 初始化
        const cn = new window.CourseNav({ dataUrl, nav, tree, mask, toggleBtn, linkBase });
        try {
            await cn.init();
        } catch (e){
            console.error('CourseNav initialization failed:', e);
        }

        // 可选：页面加载后自动展开（根据需要）
        // cn.show();
    }

    // 等待 DOM 就绪再挂载（或在你的入口里手动调用）
    if (document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', () => mountCourseNav());
    } else {
        mountCourseNav();
    }
})();