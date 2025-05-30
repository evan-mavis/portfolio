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
  canvas.style.zIndex = "-1"; // Ensure it's behind the images
  imageContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.strokeStyle = "red";
  ctx.lineCap = "round";
  ctx.setLineDash([5, 15]); // Set the dash pattern

  function drawLine() {
    // Remove existing pins
    const existingPins = document.querySelectorAll(".image-container span");
    existingPins.forEach(pin => pin.remove());

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
    ctx.beginPath();

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
      const padding = 20; // Padding value
      const corner = Math.floor(Math.random() * 4);
      switch (corner) {
        case 0: // Top-left
          cornerX = x + padding;
          cornerY = y + padding;
          break;
        case 1: // Top-right
          cornerX = x + width - padding;
          cornerY = y + padding;
          break;
        case 2: // Bottom-left
          cornerX = x + padding;
          cornerY = y + height - padding;
          break;
        case 3: // Bottom-right
          cornerX = x + width - padding;
          cornerY = y + height - padding;
          break;
      }

      if (index === 0) {
        ctx.moveTo(cornerX, cornerY);
      } else {
        ctx.lineTo(cornerX, cornerY);
      }

      // Add pin emoji
      const pin = document.createElement("span");
      pin.textContent = "📍"; // Tack emoji
      pin.style.position = "absolute";
      pin.style.left = `${cornerX}px`;
      pin.style.top = `${cornerY}px`;
      pin.style.fontSize = "3em"; // Adjust the size as needed
      pin.style.transform = "translate(-50%, -85%)"; // Shift the tack
      pin.style.zIndex = "2"; // Ensure it's above the line and images
      imageContainer.appendChild(pin);
    });

    ctx.stroke();
  }

  function resizeCanvas() {
    canvas.width = imageContainer.offsetWidth;
    canvas.height = imageContainer.offsetHeight;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 6; // Reduced line width
    ctx.lineCap = "round";
    ctx.setLineDash([5, 15]); // Set the dash pattern
    drawLine();
  }

  resizeCanvas(); // Initial draw
  window.addEventListener("resize", resizeCanvas);
});
