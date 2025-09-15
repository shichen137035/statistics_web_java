// 加载 nav
fetch("/component/course_nav.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("course-nav").innerHTML = data;
    });