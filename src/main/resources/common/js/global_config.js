// -----------------------------
// global_config.js
// 全局通用路径配置
// -----------------------------

import { siteUrl } from "./site_url.js";

window.GLOBAL_PATHS = {
    HOME_PAGE: siteUrl("index.html"),
    CONCEPT_HOME_PAGE: siteUrl("main/concept/introduction/page/Concept introduction.html"),
    COURSE_HOME_PAGE: siteUrl("main/course/Introduction/page/Course introduction.html"),
    CONCEPT_ROOT: siteUrl("main/concept/"),
    COURSE_ROOT: siteUrl("main/course/"),
    I18N_ROOT: siteUrl("i18n/"),
    IMAGE_ROOT: siteUrl("common/img/")
};
