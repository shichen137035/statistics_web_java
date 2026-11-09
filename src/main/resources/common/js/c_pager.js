const crumbs = document.querySelector(".concept-crumbs");
const [, section, file] = location.pathname.match(/\/concept\/([^/]+)\/page\/([^/]+)\.html$/) || [];
if (crumbs && section) {
    const index = file === "section_index";
    const parent = document.createElement(index ? "span" : "a");
    parent.dataset.i18n = "concept-title." + section;
    if (index) parent.setAttribute("aria-current", "page");
    else parent.href = "section_index.html";
    crumbs.append(parent);
    if (!index) {
        const current = document.createElement("span");
        current.dataset.i18n = "concept-section." + file;
        current.setAttribute("aria-current", "page");
        crumbs.append(current);
    }
}
