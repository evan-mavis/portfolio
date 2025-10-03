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

  const OPEN_MS = 700;
  const CLOSE_MS = 220;
  let bulkMode = null;
  let pendingBulk = 0;

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

    detailsEl.setAttribute("open", "");

    requestAnimationFrame(() => {
      const target = content.scrollHeight;
      content.style.maxHeight = target + "px";
      content.style.opacity = "1";
      const onEnd = () => {
        if (detailsEl._onEnd !== onEnd) return;
        content.removeEventListener("transitionend", onEnd);
        detailsEl._onEnd = null;
        content.style.maxHeight = "";
        content.style.overflow = "";
        content.style.transition = "";
        content.style.opacity = "";
        content.style.display = "";
        detailsEl._animating = false;
        detailsEl._animDirection = null;
        saveDetailsState();
        try {
          if (!bulkMode) updateToggleButton();
        } catch (_) {}
      };
      detailsEl._onEnd = onEnd;
      content.addEventListener("transitionend", onEnd);
    });
  }

  function animateClose(detailsEl, fromCurrent = false, isBulk = false) {
    const content = getContentElement(detailsEl);
    if (!content) {
      detailsEl.removeAttribute("open");
      saveDetailsState();
      return;
    }

    if (detailsEl._animating) {
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
        if (bulkMode === "collapse" && isBulk) {
          pendingBulk = Math.max(0, pendingBulk - 1);
          if (pendingBulk === 0) {
            bulkMode = null;
            try {
              updateToggleButton();
            } catch (_) {}
          }
        } else {
          try {
            if (!bulkMode) updateToggleButton();
          } catch (_) {}
        }
      };
      detailsEl._onEnd = onEnd;
      content.addEventListener("transitionend", onEnd);
    });
  }

  document.querySelectorAll("details > summary").forEach((summary) => {
    summary.addEventListener("click", function (e) {
      e.preventDefault();
      const detailsEl = this.parentElement;
      const isOpen = detailsEl.hasAttribute("open");
      if (detailsEl._animating) {
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

  // Avatar expand/collapse without toggling the summary
  const avatar = document.querySelector(".main-heading__avatar");
  if (avatar) {
    avatar.addEventListener("click", function (e) {
      e.stopPropagation();
      const overlay = document.getElementById("avatar-overlay");
      if (!overlay) return;
      overlay.classList.add("is-open");
      const root = document.getElementById("page-root");
      if (root) root.classList.add("is-blurred");
    });
  }

  const overlay = document.getElementById("avatar-overlay");
  if (overlay) {
    function closeOverlay() {
      overlay.classList.remove("is-open");
      const root = document.getElementById("page-root");
      if (root) root.classList.remove("is-blurred");
    }

    overlay.addEventListener("click", () => closeOverlay());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeOverlay();
    });
  }

  const toggleBtn = document.getElementById("toggle-all");

  function getAllDetails() {
    return Array.from(document.querySelectorAll("details"));
  }

  function anyClosed() {
    return getAllDetails().some((d) => !d.hasAttribute("open"));
  }

  function updateToggleButton() {
    if (!toggleBtn) return;
    const expand = anyClosed();
    const icon = toggleBtn.querySelector("iconify-icon");
    if (expand) {
      toggleBtn.title = "Expand all";
      toggleBtn.setAttribute("aria-label", "Expand all");
      if (icon) icon.setAttribute("icon", "mdi:arrow-expand-all");
    } else {
      toggleBtn.title = "Collapse all";
      toggleBtn.setAttribute("aria-label", "Collapse all");
      if (icon) icon.setAttribute("icon", "mdi:arrow-collapse-all");
    }
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const expand = anyClosed();
      const icon = toggleBtn.querySelector("iconify-icon");
      if (expand) {
        toggleBtn.title = "Collapse all";
        toggleBtn.setAttribute("aria-label", "Collapse all");
        if (icon) icon.setAttribute("icon", "mdi:arrow-collapse-all");
      } else {
        toggleBtn.title = "Expand all";
        toggleBtn.setAttribute("aria-label", "Expand all");
        if (icon) icon.setAttribute("icon", "mdi:arrow-expand-all");
      }
      if (expand) {
        bulkMode = "expand";
        document.body.classList.add("instant-toggle");
        getAllDetails().forEach((d) => {
          const content = getContentElement(d);
          if (content) {
            clearPending(d, content);
            d._animating = false;
            d._animDirection = null;
            content.style.maxHeight = "";
            content.style.overflow = "";
            content.style.transition = "";
            content.style.opacity = "";
            content.style.display = "";
          }
          d.setAttribute("open", "");
        });
        saveDetailsState();
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            document.body.classList.remove("instant-toggle");
            bulkMode = null;
            try {
              updateToggleButton();
            } catch (_) {}
          });
        });
      } else {
        bulkMode = "collapse";
        const nodes = getAllDetails().sort(
          (a, b) =>
            b.querySelectorAll("details").length -
            a.querySelectorAll("details").length
        );
        const openNodes = nodes.filter((d) => d.hasAttribute("open"));
        pendingBulk = openNodes.length;
        if (pendingBulk === 0) {
          bulkMode = null;
          try {
            updateToggleButton();
          } catch (_) {}
        } else {
          openNodes.forEach((d) => animateClose(d, false, true));
        }
      }
    });
    updateToggleButton();
  }
});

window.addEventListener("beforeunload", saveDetailsState);
