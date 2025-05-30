document.addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.querySelector(".image-container");
  const images = document.querySelectorAll(".image-container img");

  if (!imageContainer) {
    console.error("Image container not found.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "-1";
  imageContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "red";
  ctx.lineCap = "round";
  ctx.setLineDash([5, 15]);

  resizeCanvas({ imageContainer, images, canvas, ctx });

  const debouncedResizeCanvas = debounce(() => {
    resizeCanvas({ imageContainer, images, canvas, ctx });
    resetLines({ imageContainer, images, observer }); // Clear and redraw lines
    window.scrollTo(0, 0); // Scroll to top
  }, 100);

  window.addEventListener("resize", debouncedResizeCanvas);

  // Pre-calculate line segments
  let lineSegments = [];
  let cornerPositions = [];

  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const width = img.width;
    const height = img.height;

    let { cornerX, cornerY, isRightSide } = generateRandomCorner(
      x,
      y,
      width,
      height
    );

    cornerPositions.push({ cornerX, cornerY });
    placePin({ cornerX, cornerY, imageContainer, isRightSide });

    if (index > 0) {
      lineSegments.push({
        startX: cornerPositions[index - 1].cornerX,
        startY: cornerPositions[index - 1].cornerY,
        endX: cornerX,
        endY: cornerY,
      });
    }
  });

  // Create line elements and add them to the container
  lineSegments.forEach((segment, index) => {
    const line = document.createElement("div");
    line.classList.add("line-segment");
    line.style.position = "absolute";
    line.style.left = `${segment.startX}px`; // Position the line
    line.style.top = `${segment.startY}px`; // Position the line
    line.style.width = "0"; // Set initial width to 0

    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    line.style.width = `${length}px`; // Set the length of the line
    line.style.transformOrigin = "top left";
    line.style.transform = `rotate(${angle}deg)`;

    line.style.pointerEvents = "none"; // Make sure it doesn't block interactions

    // Use a data attribute to store the segment index
    line.dataset.index = index;

    imageContainer.appendChild(line);
  });

  // Intersection Observer to reveal line segments
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const index = Array.from(images).indexOf(img);

          // Make the corresponding line segment visible
          if (index > 0) {
            const line = imageContainer.querySelector(
              `.line-segment[data-index="${index - 1}"]`
            );
            if (line) {
              line.classList.add("visible");
            }
          }
        }
      });
    },
    {
      root: null,
      threshold: 0.1, // Changed threshold to 0.1
    }
  );

  // Observe each image
  images.forEach((img) => {
    observer.observe(img);
  });

  // Function to draw a single line segment (no longer used)
  function drawLineSegment(ctx, startX, startY, endX, endY) {
    // (Leave empty)
  }
});

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

function resizeCanvas({ imageContainer, images, canvas, ctx }) {
  canvas.width = imageContainer.offsetWidth;
  canvas.height = imageContainer.offsetHeight;
  ctx.strokeStyle = "red";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.setLineDash([5, 15]);
}

function drawLine({ imageContainer, images, canvas, ctx }) {
  resetPins(imageContainer);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();

  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const width = img.width;
    const height = img.height;

    let { cornerX, cornerY, isRightSide } = generateRandomCorner(
      x,
      y,
      width,
      height
    );

    if (index === 0) {
      ctx.moveTo(cornerX, cornerY);
    } else {
      ctx.lineTo(cornerX, cornerY);
    }

    placePin({ cornerX, cornerY, imageContainer, isRightSide });
  });

  ctx.stroke();
}

function placePin({ cornerX, cornerY, imageContainer, isRightSide }) {
  const pin = document.createElement("span");
  pin.textContent = "📍";
  pin.style.position = "absolute";
  pin.style.left = `${cornerX}px`;
  pin.style.top = `${cornerY}px`;
  pin.style.fontSize = "3em";
  pin.style.transform = "translate(-50%, -85%)";
  pin.style.zIndex = "2";

  if (isRightSide) {
    pin.style.transform += " rotate(15deg)";
  } else {
    pin.style.transform += " rotate(-15deg)";
  }

  imageContainer.appendChild(pin);
}

function resetPins(imageContainer) {
  const existingPins = imageContainer.querySelectorAll("span");
  existingPins.forEach((pin) => pin.remove());
}

function generateRandomCorner(x, y, width, height) {
  let cornerX, cornerY;
  let isRightSide = false;
  const padding = 20;
  const corner = Math.floor(Math.random() * 4);

  switch (corner) {
    case 0: // Top-left
      cornerX = x + padding;
      cornerY = y + padding;
      break;
    case 1: // Top-right
      cornerX = x + width - padding;
      cornerY = y + padding;
      isRightSide = true;
      break;
    case 2: // Bottom-left
      cornerX = x + padding;
      cornerY = y + height - padding;
      break;
    case 3: // Bottom-right
      cornerX = x + width - padding;
      cornerY = y + height - padding;
      isRightSide = true;
      break;
  }
  return { cornerX, cornerY, isRightSide };
}

function resetLines({ imageContainer, images, observer }) {
  // Clear existing lines
  const existingLines = imageContainer.querySelectorAll(".line-segment");
  existingLines.forEach((line) => line.remove());

  // Clear existing pins
  resetPins(imageContainer);

  // Re-calculate line segments
  let lineSegments = [];
  let cornerPositions = [];

  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const width = img.width;
    const height = img.height;

    let { cornerX, cornerY, isRightSide } = generateRandomCorner(
      x,
      y,
      width,
      height
    );

    cornerPositions.push({ cornerX, cornerY });
    placePin({ cornerX, cornerY, imageContainer, isRightSide });

    if (index > 0) {
      lineSegments.push({
        startX: cornerPositions[index - 1].cornerX,
        startY: cornerPositions[index - 1].cornerY,
        endX: cornerX,
        endY: cornerY,
      });
    }
  });

  // Re-create line elements and add them to the container
  lineSegments.forEach((segment, index) => {
    const line = document.createElement("div");
    line.classList.add("line-segment");
    line.style.position = "absolute";
    line.style.left = `${segment.startX}px`; // Position the line
    line.style.top = `${segment.startY}px`; // Position the line
    line.style.width = "0"; // Set initial width to 0

    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    line.style.width = `${length}px`; // Set the length of the line
    line.style.transformOrigin = "top left";
    line.style.transform = `rotate(${angle}deg)`;

    line.style.pointerEvents = "none"; // Make sure it doesn't block interactions

    // Use a data attribute to store the segment index
    line.dataset.index = index;

    imageContainer.appendChild(line);
  });

  // Re-observe each image
  images.forEach((img) => {
    observer.observe(img);
  });

  // Check initial intersection for the first two images and manually add "visible" class
  setTimeout(() => {
    if (images.length > 1) {
      const firstImage = images[0];
      const secondImage = images[1];

      const firstImageRect = firstImage.getBoundingClientRect();
      const secondImageRect = secondImage.getBoundingClientRect();

      const isFirstImageVisible =
        firstImageRect.top >= 0 && firstImageRect.top <= window.innerHeight;
      const isSecondImageVisible =
        secondImageRect.top >= 0 && secondImageRect.top <= window.innerHeight;

      if (isFirstImageVisible && isSecondImageVisible) {
        const line = imageContainer.querySelector(
          `.line-segment[data-index="0"]`
        );
        if (line) {
          line.classList.add("visible");
        }
      }
    }
  }, 100);
}
