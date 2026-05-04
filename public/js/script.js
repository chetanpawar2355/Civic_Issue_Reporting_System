(function () {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms)
    .forEach(function (form) {
      form.addEventListener('submit', function (event) {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }

        form.classList.add('was-validated')
      }, false)
    })
})()

document.addEventListener("click", function (e) {

    document.querySelectorAll(".dropdown-menu2").forEach(menu => {
        menu.classList.remove("show");
    });

    if (e.target.classList.contains("dropdown-toggle2")) {
        e.target.nextElementSibling.classList.toggle("show");
    }
});