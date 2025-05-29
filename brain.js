document.addEventListener("DOMContentLoaded", () => {
  const cuSpan = document.querySelector(".bio__cu-highlight");
  const dialog = document.getElementById("customAlert");
  const titleEl = document.getElementById("alertTitle");

  if (cuSpan) {
    cuSpan.classList.add("bounce");

    cuSpan.style.cursor = "pointer";
    cuSpan.addEventListener("click", () => {
      cuSpan.classList.remove("bounce");

      titleEl.textContent = "🦬Go Buffs!🦬";
      dialog.classList.add("fade-in");
      dialog.showModal();

      setTimeout(() => {
        dialog.classList.remove("fade-in");
        dialog.classList.add("fade-out");

        setTimeout(() => {
          dialog.close();
          dialog.classList.remove("fade-out");
        }, 1000);
      }, 1000);
    });
  }
});
