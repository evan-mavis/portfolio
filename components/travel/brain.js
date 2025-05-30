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

  // Initial draw
  resizeCanvas({ imageContainer, images, canvas, ctx });

  const debouncedResizeCanvas = debounce(
    () => resizeCanvas({ imageContainer, images, canvas, ctx }),
    100
  );

  window.addEventListener("resize", debouncedResizeCanvas);
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

  drawLine({ imageContainer, images, canvas, ctx });
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
