// 加载 header
fetch("/component/language_switch.html")
    .then(res => res.text())
    .then(data => {
        document.getElementById("language_switch").innerHTML = data;
    });