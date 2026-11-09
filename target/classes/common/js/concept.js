// /common/js/init_config.js
import {injectCss, injectJsSequential,loadComponent} from "/common/js/util_tool.js";
// await injectJsSequential(["/common/js/nocache.js"])
await injectJsSequential([
    "/common/js/global_config.js"
])
await Promise.all([
    // loadComponent("/component/course_nav_rendered.html", "course-nav"),
    loadComponent("/component/language_switch.html", "language-switch")
    // loadComponent("/component/pager.html", "pager")
]);
if (document.getElementById("concept-list")) {
    await loadComponent("/component/concept_component.html", "concept-list");
    const search = document.getElementById("concept-search");
    search?.addEventListener("input", () => {
        const query = search.value.trim().toLocaleLowerCase();
        const root = document.getElementById("concept-list");
        root.querySelectorAll("li").forEach((item) => {
            item.hidden = query !== "" && !item.textContent.toLocaleLowerCase().includes(query);
        });
        root.querySelectorAll("section").forEach((section) => {
            const items = section.querySelectorAll("li");
            section.hidden = items.length > 0 && !Array.from(items).some((item) => !item.hidden);
        });
    });
} else {
    let container = document.getElementById("c-pager");
    if (!container) {
        container = document.createElement("div");
        container.id = "c-pager";
        document.querySelector("main").before(container);
    }
    await loadComponent("/component/c_pager.html", "c-pager");
    await import("./c_pager.js");
}

if (document.getElementById("statistic-keywords")) {
    await loadComponent("/component/statistic_keywords.html", "statistic-keywords");
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

console.log("所有组件加载完成。");

// 注入全局 CSS
injectCss([
    "/common/css/global_style.css",
    "/common/css/code_style.css",
    "/common/css/popup_style.css",
    "/common/css/concept_style.css",
    "/common/css/c_pager.css",
    // "/common/css/course_nav.css",
    "/common/css/algorithm_style.css",
    "/common/css/table.css"
    // "/common/css/pager.css"
]);

document.addEventListener("i18nApplied", () => {
    console.log("✅ All JSON loaded and applied");
    injectJsSequential([
        "/common/js/mathjax.js",
        "/common/js/code_highlight.js"
    ])
});

// 注入全局 JS
injectJsSequential([

    "/common/js/language_switch.js",
    "/common/js/keyword_popup.js",

    // "/common/js/pager.js",
    // "/common/js/course_nav_event_controller.js",

    // "/common/js/course_nav.js"
]);



