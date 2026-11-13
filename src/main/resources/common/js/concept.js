// /common/js/init_config.js
import {injectCss, injectJsSequential,loadComponent} from "./util_tool.js?v=2";
// await injectJsSequential(["common/js/nocache.js"])
await injectJsSequential([
    "common/js/global_config.js?v=2"
])
await Promise.all([
    // loadComponent("component/course_nav_rendered.html?v=2", "course-nav"),
    loadComponent("component/language_switch.html?v=5", "language-switch")
    // loadComponent("component/pager.html", "pager")
]);
if (document.getElementById("concept-list")) {
    await loadComponent("component/concept_component.html?v=2", "concept-list");
    const search = document.getElementById("concept-search");
    const root = document.getElementById("concept-list");
    const filterConcepts = () => {
        if (!search || !root) return;
        const query = search.value.trim().toLocaleLowerCase();
        root.querySelectorAll("li").forEach((item) => {
            item.hidden = query !== "" && !item.textContent.toLocaleLowerCase().includes(query);
        });
        root.querySelectorAll("section").forEach((section) => {
            const items = section.querySelectorAll("li");
            section.hidden = items.length > 0 && !Array.from(items).some((item) => !item.hidden);
        });
    };
    search?.addEventListener("input", filterConcepts);
    document.addEventListener("i18nApplied", () => {
        // A query in the previous language may not match translated labels.
        if (search?.value) search.value = "";
        filterConcepts();
    });
} else {
    let container = document.getElementById("c-pager");
    if (!container) {
        container = document.createElement("div");
        container.id = "c-pager";
        document.querySelector("main").before(container);
    }
    await loadComponent("component/c_pager.html?v=2", "c-pager");
    await import("./c_pager.js");
}

if (document.getElementById("statistic-keywords")) {
    await loadComponent("component/statistic_keywords.html?v=2", "statistic-keywords");
    if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

console.log("所有组件加载完成。");

// 注入全局 CSS
injectCss([
    "common/css/global_style.css?v=11",
    "common/css/code_style.css?v=11",
    "common/css/popup_style.css?v=11",
    "common/css/concept_style.css?v=11",
    "common/css/c_pager.css?v=11",
    // "common/css/course_nav.css?v=11",
    "common/css/algorithm_style.css?v=11",
    "common/css/table.css?v=11"
    // "common/css/pager.css?v=11"
]);

let pageEnhancementsStarted = false;
document.addEventListener("i18nApplied", () => {
    if (!pageEnhancementsStarted) {
        pageEnhancementsStarted = true;
        void injectJsSequential([
            "common/js/mathjax.js",
            "common/js/code_highlight.js?v=2"
        ]);
        return;
    }
    window.MathJax?.typesetPromise?.();
});

// 注入全局 JS
injectJsSequential([

    "common/js/language_switch.js?v=6",
    "common/js/keyword_popup.js",

    // "common/js/pager.js",
    // "common/js/course_nav_event_controller.js",

    // "common/js/course_nav.js"
]);



