document.addEventListener("DOMContentLoaded", () => {
  const imageContainer = document.querySelector(".image-container");
  const images = document.querySelectorAll(".image-container img");

  if (!imageContainer) {
    console.error("Image container not found.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = imageContainer.offsetWidth;
  canvas.height = imageContainer.offsetHeight;
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "1"; // Ensure it's above the images but below other potential content
  imageContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.setLineDash([5, 15]); // Set the dash pattern

  ctx.beginPath();

  let prevX, prevY;

  images.forEach((img, index) => {
    const rect = img.getBoundingClientRect();
    const containerRect = imageContainer.getBoundingClientRect();

    // Calculate relative position to the container
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top;
    const width = img.width;
    const height = img.height;

    // Determine a random corner
    let cornerX, cornerY;
    const corner = Math.floor(Math.random() * 4);
    switch (corner) {
      case 0: // Top-left
        cornerX = x;
        cornerY = y;
        break;
      case 1: // Top-right
        cornerX = x + width;
        cornerY = y;
        break;
      case 2: // Bottom-left
        cornerX = x;
        cornerY = y + height;
        break;
      case 3: // Bottom-right
        cornerX = x + width;
        cornerY = y + height;
        break;
    }

    if (index === 0) {
      ctx.moveTo(cornerX, cornerY);
    } else {
      ctx.lineTo(cornerX, cornerY);
    }
    prevX = cornerX;
    prevY = cornerY;
  });

  ctx.stroke();
});
