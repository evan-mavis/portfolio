function saveDetailsState() {
  const openDetails = [];
  document.querySelectorAll("details[open]").forEach((detail, index) => {
    const summary = detail.querySelector("summary");
    if (summary) {
      openDetails.push(summary.textContent.trim());
    }
  });
  localStorage.setItem("portfolioDetailsState", JSON.stringify(openDetails));
}

function restoreDetailsState() {
  try {
    const savedState = localStorage.getItem("portfolioDetailsState");
    if (savedState) {
      const openDetails = JSON.parse(savedState);

      document.querySelectorAll("details").forEach((detail) => {
        detail.removeAttribute("open");
      });

      openDetails.forEach((summaryText) => {
        const summary = Array.from(document.querySelectorAll("summary")).find(
          (s) => s.textContent.trim() === summaryText
        );
        if (summary && summary.parentElement.tagName === "DETAILS") {
          summary.parentElement.setAttribute("open", "");
        }
      });
    }
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", function () {
  restoreDetailsState();

  document.querySelectorAll("details").forEach((detail) => {
    detail.addEventListener("toggle", saveDetailsState);
  });
});

window.addEventListener("beforeunload", saveDetailsState);
