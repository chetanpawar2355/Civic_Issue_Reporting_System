document.addEventListener("DOMContentLoaded", function () {
    const icon = document.getElementById("profileIcon");
    const menu = document.getElementById("profileMenu");

    // agar login nahi hai to error avoid
    if (!icon || !menu) return;

    icon.addEventListener("click", function (e) {
        e.stopPropagation();
        menu.classList.toggle("d-none");
    });

    document.addEventListener("click", function (e) {
        if (!menu.contains(e.target) && !icon.contains(e.target)) {
            menu.classList.add("d-none");
        }
    });
});
