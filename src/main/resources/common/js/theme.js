const key = "siteTheme";
const preference = matchMedia("(prefers-color-scheme: dark)");
const button = document.querySelector("#theme-toggle");

function updateTheme() {
    const saved = localStorage.getItem(key);
    const dark = saved ? saved === "dark" : preference.matches;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    button?.setAttribute("aria-pressed", String(dark));
    const labels = {
        en: ["Switch to dark mode", "Switch to light mode"],
        ja: ["ダークモードに切り替え", "ライトモードに切り替え"],
        zh: ["切换到深色模式", "切换到浅色模式"],
        tc: ["切換至深色模式", "切換至淺色模式"]
    };
    const label = (labels[document.documentElement.lang] || labels.en)[dark ? 1 : 0];
    button?.setAttribute("aria-label", label);
    if (button) button.title = label;
}

updateTheme();
button?.addEventListener("click", () => {
    localStorage.setItem(key, document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    updateTheme();
});
document.addEventListener("i18nApplied", updateTheme);
preference.addEventListener("change", updateTheme);
window.addEventListener("storage", updateTheme);
