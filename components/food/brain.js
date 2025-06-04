const sTierImages = [
  { src: "../../assets/imgs/food/japan-tokyo-wagyu.jpeg", alt: "japan-tokyo-wagyu" },
  { src: "../../assets/imgs/food/japan-kyoto-wagyu-night.jpeg", alt: "japan-kyoto-wagyu-night" },
  { src: "../../assets/imgs/food/japan-osaka-a5-kobe-wagyu-skewers.jpeg", alt: "japan-osaka-a5-kobe-wagyu-skewers" },
  { src: "../../assets/imgs/food/japan-osaka-fatty-toro.jpeg", alt: "japan-osaka-fatty-toro" },
];
const aTierImages = [
  { src: "../../assets/imgs/food/vietnam-hanoi-pho.jpeg", alt: "vietnam-hanoi-pho" },
  { src: "../../assets/imgs/food/vietnam-ho-chi-minh-pho-dau.jpeg", alt: "vietnam-ho-chi-minh-pho-dau" },
  { src: "../../assets/imgs/food/vietnam-ho-chi-minh-street-food.jpeg", alt: "vietnam-ho-chi-minh-street-food" },
];
const bTierImages = [
  { src: "../../assets/imgs/food/vietnam-ho-chi-minh-bahn-mi.jpeg", alt: "vietnam-ho-chi-minh-bahn-mi" },
  { src: "../../assets/imgs/food/vietnam-hoi-an-bahn-mi.jpeg", alt: "vietnam-hoi-an-bahn-mi" },
  { src: "../../assets/imgs/food/vietnam-ho-chi-minh-bahn-mi-2.jpeg", alt: "vietnam-ho-chi-minh-bahn-mi-2" },
];
const cTierImages = [
  { src: "../../assets/imgs/food/bali-ubud-breakfast-scramble.jpeg", alt: "bali-ubud-breakfast-scramble" },
  { src: "../../assets/imgs/food/bali-ubud-dragon-fruit-bfast-bowl.jpeg", alt: "bali-ubud-dragon-fruit-bfast-bowl" },
  { src: "../../assets/imgs/food/bali-ubud-chili-fries.jpeg", alt: "bali-ubud-chili-fries" },
];
const dTierImages = [
  { src: "../../assets/imgs/food/japan-tokyo-ramen.jpeg", alt: "japan-tokyo-ramen" },
  { src: "../../assets/imgs/food/japan-kyoto-ramen.jpeg", alt: "japan-kyoto-ramen" },
  { src: "../../assets/imgs/food/japan-kyoto-ramen-2.jpeg", alt: "japan-kyoto-ramen-2" },
];
const fTierImages = [
  { src: "../../assets/imgs/food/vietnam-hanoi-cobra.jpeg", alt: "vietnam-hanoi-cobra" },
  { src: "../../assets/imgs/food/vietnam-ho-chi-minh-heart-meat.jpeg", alt: "vietnam-ho-chi-minh-heart-meat" },
  { src: "../../assets/imgs/food/vietnam-hanoi-snake-spring-rolls.jpeg", alt: "vietnam-hanoi-snake-spring-rolls" },
];

const tierMap = {
  "tier-s": sTierImages,
  "tier-a": aTierImages,
  "tier-b": bTierImages,
  "tier-c": cTierImages,
  "tier-d": dTierImages,
  "tier-f": fTierImages,
};

function loadImages() {
  let imagesLoaded = 0;
  const totalImages = Object.values(tierMap).flat().length;

  for (const tier in tierMap) {
    const imageArray = tierMap[tier];
    const tierItems = document.querySelector(`.${tier} .tier-items`);

    imageArray.forEach((imageObj) => {
      const item = document.createElement("div");
      item.classList.add("item");
      const img = document.createElement("img");
      img.src = imageObj.src;
      img.alt = imageObj.alt; // Set alt attribute
      img.draggable = false; // Disable draggable here, enable after load
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === totalImages) {
          // All images are loaded, now add event listeners
          addEventListeners();
        }
      };
      item.appendChild(img);
      tierItems.appendChild(item);
    });
  }
}

function addEventListeners() {
  const items = document.querySelectorAll(".item");
  const tiers = document.querySelectorAll(".tier-items");

  items.forEach((item) => {
    item.draggable = true; // Enable draggable here
    item.addEventListener("dragstart", dragStart);
    item.addEventListener("dragend", dragEnd); // Add dragend listener
  });

  tiers.forEach((tier) => {
    tier.addEventListener("dragover", dragOver);
    tier.addEventListener("dragenter", dragEnter);
    tier.addEventListener("dragleave", dragLeave);
    tier.addEventListener("drop", drop);
  });

  // Add double click listener to each image
  const images = document.querySelectorAll(".item img");
  images.forEach((img) => {
    img.addEventListener("dblclick", enlargeImage);
  });
}

function enlargeImage(e) {
  const img = e.target;
  img.classList.toggle("enlarged");

  // Create or remove caption
  if (img.classList.contains("enlarged")) {
    const caption = document.createElement("div");
    caption.classList.add("image-caption");
    caption.textContent = img.alt || "No caption available"; // Use alt text or default message
    img.parentNode.appendChild(caption); // Add caption after the image
  } else {
    const caption = img.parentNode.querySelector(".image-caption");
    if (caption) {
      caption.remove(); // Remove caption if it exists
    }
  }
}

let draggedItem = null;

function dragStart(e) {
  draggedItem = this;
  const img = this.querySelector("img");
  if (img) {
    e.dataTransfer.setData("text/plain", "dragging"); // Simple text data
    e.dataTransfer.setDragImage(img, 0, 0); // Use the image as the drag image
  }
  this.classList.add("dragging"); // Add a class for styling during drag
}

function dragOver(e) {
  e.preventDefault();
  this.classList.add("drag-over");

  const afterElement = getDragAfterElement(this, e.clientX);
  const items = this.querySelectorAll(".item:not(.dragging)");

  // Reset margins for all items
  items.forEach((item) => {
    item.style.marginLeft = "5px";
    item.style.marginRight = "5px";
  });

  if (afterElement == null) {
    // If dragged item is at the end, no change needed as the item will be appended
  } else if (afterElement === items[0]) {
    // If dragged item is at the beginning
    afterElement.style.marginLeft = "15px";
  } else {
    // If dragged item is in the middle
    afterElement.style.marginLeft = "15px";
  }
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function dragLeave(e) {
  this.classList.remove("drag-over");
  // Reset margins for all items
  this.querySelectorAll(".item:not(.dragging)").forEach((item) => {
    item.style.marginLeft = "5px";
    item.style.marginRight = "5px";
  });
}

function drop(e) {
  this.classList.remove("drag-over");
  // Reset margins for all items
  this.querySelectorAll(".item:not(.dragging)").forEach((item) => {
    item.style.marginLeft = "5px";
    item.style.marginRight = "5px";
  });

  const afterElement = getDragAfterElement(this, e.clientX);
  if (afterElement == null) {
    this.appendChild(draggedItem);
  } else {
    this.insertBefore(draggedItem, afterElement);
  }

  draggedItem.classList.remove("dragging");
  updateImageArrays();
  draggedItem = null;
}

function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

function updateImageArrays() {
  for (const tier in tierMap) {
    const tierItems = document.querySelector(`.${tier} .tier-items`);
    const imageElements = tierItems.querySelectorAll(".item img");
    tierMap[tier] = Array.from(imageElements).map((img) => img.src);
  }
  console.log(tierMap); // Log the updated tierMap to the console
}

function dragEnd() {
  const tiers = document.querySelectorAll(".tier-items");
  tiers.forEach((tier) => {
    tier.classList.remove("drag-over");
  });
  if (draggedItem) {
    draggedItem.classList.remove("dragging");
  }
}

window.addEventListener("load", loadImages);
