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

  const OPEN_MS = 700; // opening duration (ms)
  const CLOSE_MS = 220; // faster closing duration (ms)

  function getContentElement(detailsEl) {
    const summary = detailsEl.querySelector(":scope > summary");
    if (!summary) return null;
    const content = summary.nextElementSibling;
    return content && content.tagName === "UL" ? content : null;
  }

  function clearPending(detailsEl, content) {
    if (detailsEl._onEnd) {
      content.removeEventListener("transitionend", detailsEl._onEnd);
      detailsEl._onEnd = null;
    }
  }

  function animateOpen(detailsEl, fromCurrent = false) {
    const content = getContentElement(detailsEl);
    if (!content) {
      detailsEl.setAttribute("open", "");
      saveDetailsState();
      return;
    }

    if (detailsEl._animating) {
      // Interrupt and continue opening from current height
      clearPending(detailsEl, content);
    }
    detailsEl._animating = true;
    detailsEl._animDirection = "open";

    content.style.display = "block";
    content.style.overflow = "hidden";
    const currentHeight = fromCurrent
      ? content.getBoundingClientRect().height
      : 0;
    content.style.maxHeight = currentHeight + "px";
    content.style.opacity = fromCurrent
      ? getComputedStyle(content).opacity || "1"
      : "0";
    content.style.transition = `max-height ${OPEN_MS}ms ease, opacity ${OPEN_MS}ms ease`;

    // Set open so content becomes visible and measurable
    detailsEl.setAttribute("open", "");

    requestAnimationFrame(() => {
      const target = content.scrollHeight;
      content.style.maxHeight = target + "px";
      content.style.opacity = "1";
      const onEnd = () => {
        if (detailsEl._onEnd !== onEnd) return;
        content.removeEventListener("transitionend", onEnd);
        detailsEl._onEnd = null;
        // Cleanup inline styles
        content.style.maxHeight = "";
        content.style.overflow = "";
        content.style.transition = "";
        content.style.opacity = "";
        content.style.display = "";
        detailsEl._animating = false;
        detailsEl._animDirection = null;
        saveDetailsState();
      };
      detailsEl._onEnd = onEnd;
      content.addEventListener("transitionend", onEnd);
    });
  }

  function animateClose(detailsEl, fromCurrent = false) {
    const content = getContentElement(detailsEl);
    if (!content) {
      detailsEl.removeAttribute("open");
      saveDetailsState();
      return;
    }

    if (detailsEl._animating) {
      // Interrupt and continue closing from current height
      clearPending(detailsEl, content);
    }
    detailsEl._animating = true;
    detailsEl._animDirection = "close";

    const currentHeight = content.scrollHeight;
    content.style.display = "block";
    content.style.overflow = "hidden";
    const startHeight = fromCurrent
      ? content.getBoundingClientRect().height
      : currentHeight;
    content.style.maxHeight = startHeight + "px";
    content.style.opacity = getComputedStyle(content).opacity || "1";
    content.style.transition = `max-height ${CLOSE_MS}ms ease, opacity ${CLOSE_MS}ms ease`;

    requestAnimationFrame(() => {
      content.style.maxHeight = "0px";
      content.style.opacity = "0";
      const onEnd = () => {
        if (detailsEl._onEnd !== onEnd) return;
        content.removeEventListener("transitionend", onEnd);
        detailsEl._onEnd = null;
        detailsEl.removeAttribute("open");
        // Cleanup inline styles
        content.style.maxHeight = "";
        content.style.overflow = "";
        content.style.transition = "";
        content.style.opacity = "";
        content.style.display = "";
        detailsEl._animating = false;
        detailsEl._animDirection = null;
        saveDetailsState();
      };
      detailsEl._onEnd = onEnd;
      content.addEventListener("transitionend", onEnd);
    });
  }

  // Intercept summary clicks to control animation for all folders
  document.querySelectorAll("details > summary").forEach((summary) => {
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      const detailsEl = this.parentElement;
      const isOpen = detailsEl.hasAttribute("open");
      if (detailsEl._animating) {
        // Interrupt current animation and reverse based on desired state
        if (detailsEl._animDirection === "open") {
          animateClose(detailsEl, true);
        } else if (detailsEl._animDirection === "close") {
          animateOpen(detailsEl, true);
        }
      } else if (isOpen) {
        animateClose(detailsEl);
      } else {
        animateOpen(detailsEl);
      }
    });
  });
});

window.addEventListener("beforeunload", saveDetailsState);
