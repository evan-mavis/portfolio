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

  resizeCanvas({ imageContainer, canvas });

  const observer = createIntersectionObserver(imageContainer, images);

  const debouncedUpdate = debounce(() => {
    resizeCanvas({ imageContainer, canvas });
    updateLines({ imageContainer, images, observer });
    window.scrollTo(0, 0);
  }, 100);

  window.addEventListener("resize", debouncedUpdate);

  let imagesLoaded = 0;
  images.forEach((img) => {
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === images.length) {
        updateLines({ imageContainer, images, observer });
      }
    };

    // handle cases where images are already cached
    if (img.complete) {
      img.onload();
    }
  });
});

function updateLines({ imageContainer, images, observer }) {
  // Clear existing lines
  const existingLines = imageContainer.querySelectorAll(".line-segment");
  existingLines.forEach((line) => line.remove());

  // Clear existing pins
  resetPins(imageContainer);

  // Calculate line segments
  let lineSegments = [];
  let cornerPositions = [];

  images.forEach((img, index) => {
    const { cornerX, cornerY, isRightSide } = calculateImageCorner(
      img,
      imageContainer
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
    line.style.left = `${segment.startX}px`;
    line.style.top = `${segment.startY}px`;
    line.style.width = "0";
    const dx = segment.endX - segment.startX;
    const dy = segment.endY - segment.startY;

    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);

    line.style.width = `${length}px`;
    line.style.transformOrigin = "top left";
    line.style.transform = `rotate(${angle}deg)`;

    line.style.pointerEvents = "none";

    line.dataset.index = index;

    imageContainer.appendChild(line);
  });

  images.forEach((img) => {
    observer.observe(img);
  });
}

function createIntersectionObserver(imageContainer, images) {
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
      threshold: 0.1,
    }
  );

  images.forEach((img) => {
    observer.observe(img);
  });

  return observer;
}

function calculateImageCorner(img, imageContainer) {
  const rect = img.getBoundingClientRect();
  const containerRect = imageContainer.getBoundingClientRect();

  const x = rect.left - containerRect.left;
  const y = rect.top - containerRect.top;
  const width = img.width;
  const height = img.height;

  return generateRandomCorner(x, y, width, height);
}

function generateRandomCorner(x, y, width, height) {
  const padding = 20;
  const corner = Math.floor(Math.random() * 4);

  const cornersX = [
    x + padding,
    x + width - padding,
    x + padding,
    x + width - padding,
  ];
  const cornersY = [
    y + padding,
    y + padding,
    y + height - padding,
    y + height - padding,
  ];

  const cornerX = cornersX[corner];
  const cornerY = cornersY[corner];
  const isRightSide = corner === 1 || corner === 3;

  return { cornerX, cornerY, isRightSide };
}

function placePin({ cornerX, cornerY, imageContainer, isRightSide }) {
  const pin = document.createElement("span");
  pin.textContent = "📍";
  pin.style.position = "absolute";
  pin.style.left = `${cornerX}px`;
  pin.style.top = `${cornerY}px`;
  pin.style.fontSize = "3em";
  pin.style.transform = `translate(-50%, -85%) rotate(${
    isRightSide ? 15 : -15
  }deg)`;
  pin.style.zIndex = "2";

  imageContainer.appendChild(pin);
}

function resetPins(imageContainer) {
  const existingPins = imageContainer.querySelectorAll("span");
  existingPins.forEach((pin) => pin.remove());
}

function resizeCanvas({ imageContainer, canvas }) {
  canvas.width = imageContainer.offsetWidth;
  canvas.height = imageContainer.offsetHeight;
}

const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};
