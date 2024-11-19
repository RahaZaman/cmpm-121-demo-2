import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;

// Adding an app title as an <h1> element
const header = document.createElement("h1");
header.innerText = APP_NAME;
app.appendChild(header);

// Create the canvas element (256x256 pixels) and add it to the page
const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "sketchpad"; // Set an id for targeting in CSS
app.appendChild(canvas);

// Get the canvas context to draw
const ctx = canvas.getContext("2d")!;

// Initialize the arrays to store strokes and the redoStack (each stroke is a Drawable object)
let strokes: Drawable[] = [];
let redoStack: Drawable[] = [];

let isDrawing = false;
let currentDrawable: Drawable | null = null;
let toolPreview: Drawable | null = null; // Global variable for tool preview
let currentSticker: string | null = null; // Global variable to track if a sticker is selected

let currentThickness = 2; // Default to "thin"
let currentColorHue = 0; // Default color hue at 0°

interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
  drag?(x: number, y: number): void;
}

// Create a modal dialog for export options
const exportDialog = document.createElement("dialog");
exportDialog.innerHTML = `
  <form method="dialog">
    <h2>Export Options</h2>
    <label><input type="radio" name="bg" value="white" checked> White Background</label><br>
    <label><input type="radio" name="bg" value="transparent"> Transparent Background</label><br>
    <menu>
      <button id="export-cancel">Cancel</button>
      <button id="export-confirm" value="default">Export</button>
    </menu>
  </form>
`;
document.body.appendChild(exportDialog);

function createMarkerLine(initialX: number, initialY: number, thickness: number, hue: number): Drawable {
  const points = [{ x: initialX, y: initialY }];
  const color = `hsl(${hue}, 100%, 40%)`; // HSL color model for the marker

  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = thickness;
      ctx.stroke();
    },
    drag(x: number, y: number) {
      points.push({ x, y });
    }
  };
}

function createToolPreview(x: number, y: number, thickness: number, hue: number): Drawable {
  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(x, y, thickness / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = `hsl(${hue}, 100%, 40%)`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
}

function createSticker(initialX: number, initialY: number, sticker: string): Drawable {
  let posX = initialX;
  let posY = initialY;

  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "40px Arial";
      ctx.fillText(sticker, posX, posY);
    },
    drag(x: number, y: number) {
      posX = x;
      posY = y;
    }
  };
}

function startDrawing(event: MouseEvent) {
  isDrawing = true;
  if (currentSticker) {
    currentDrawable = createSticker(event.offsetX, event.offsetY, currentSticker);
  } else {
    currentDrawable = createMarkerLine(event.offsetX, event.offsetY, currentThickness, currentColorHue);
  }
  strokes.push(currentDrawable);
}

function draw(event: MouseEvent) {
  if (!isDrawing || !currentDrawable) return;
  currentDrawable.drag!(event.offsetX, event.offsetY);
  canvas.dispatchEvent(new Event("drawing-changed"));
}

function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  currentDrawable = null;
  redoStack = [];
}

function updateToolPreview(event: MouseEvent) {
  if (isDrawing) {
    toolPreview = null;
  } else if (currentSticker) {
    toolPreview = createSticker(event.offsetX, event.offsetY, currentSticker);
  } else {
    toolPreview = createToolPreview(event.offsetX, event.offsetY, currentThickness, currentColorHue);
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
}

// Mouse events
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", (event) => {
  draw(event);
  updateToolPreview(event);
});
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Redraw the canvas
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach((drawable) => {
    drawable.display(ctx);
  });
  if (toolPreview) {
    toolPreview.display(ctx);
  }
});

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";

clearButton.addEventListener("click", () => {
  strokes = [];
  redoStack = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const undoButton = document.createElement("button");
undoButton.innerText = "Undo";

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";

undoButton.addEventListener("click", () => {
  if (strokes.length > 0) {
    const lastStroke = strokes.pop();
    redoStack.push(lastStroke!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const strokeToRedo = redoStack.pop();
    strokes.push(strokeToRedo!);
    canvas.dispatchEvent(new Event("drawing-changed"));
  }
});

// Create a container for the slider
const sliderContainer = document.createElement("div");
sliderContainer.style.display = "flex";
sliderContainer.style.flexDirection = "column";
sliderContainer.style.alignItems = "center"; // Center the slider and label
app.appendChild(sliderContainer);

// Add description for the slider
const sliderLabel = document.createElement("label");
sliderLabel.innerText = "Adjust Marker Color:";
sliderLabel.style.color = "#000000";
sliderLabel.style.fontWeight = "bold";
app.appendChild(sliderLabel);

const slider = document.createElement("input");
slider.type = "range";
slider.min = "0";
slider.max = "360";
slider.value = "0";
app.appendChild(slider);

slider.addEventListener("input", (event: Event) => {
  const target = event.target as HTMLInputElement;
  currentColorHue = parseInt(target.value, 10);
});

const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerText = "Thin Marker";

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerText = "Thick Marker";

thinMarkerButton.addEventListener("click", () => {
  currentThickness = 4;
  currentSticker = null;
  selectTool(thinMarkerButton);
});

thickMarkerButton.addEventListener("click", () => {
  currentThickness = 8;
  currentSticker = null;
  selectTool(thickMarkerButton);
});

function selectTool(selectedButton: HTMLButtonElement) {
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");
  selectedButton.classList.add("selectedTool");
}

function selectStickerTool(stickerButton: HTMLButtonElement, sticker: string) {
  currentSticker = sticker;
  toolPreview = null;
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");
  stickerButton.classList.add("selectedTool");
}

const initialStickers = ["🌟", "🎈", "🍀"];
let stickers = [...initialStickers];

function updateStickerButtons() {
  document.querySelectorAll(".sticker-btn").forEach((btn) => btn.remove());

  stickers.forEach((sticker) => {
    const stickerButton = document.createElement("button");
    stickerButton.innerText = sticker;
    stickerButton.className = "sticker-btn";
    stickerButton.addEventListener("click", () => {
      selectStickerTool(stickerButton, sticker);
    });
    app.appendChild(stickerButton);
  });
}

updateStickerButtons();

const customStickerButton = document.createElement("button");
customStickerButton.innerText = "Add Custom Sticker";
customStickerButton.addEventListener("click", () => {
  const customSticker = prompt("Enter custom sticker text:", "🧽");
  if (customSticker) {
    stickers.push(customSticker);
    updateStickerButtons();
  }
});

// Export button to open the modal
const exportButton = document.createElement("button");
exportButton.innerText = "Export";

exportButton.addEventListener("click", () => {
  exportDialog.showModal();
});

// Handle export confirmation
exportDialog.querySelector("#export-confirm")?.addEventListener("click", () => {
  const bgValue = (document.querySelector('input[name="bg"]:checked') as HTMLInputElement).value;
  exportImage(bgValue === "white");
});

// Export function with background option
function exportImage(withWhiteBackground: boolean) {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const exportCtx = exportCanvas.getContext("2d")!;

  // Fill with white if requested, otherwise leave it transparent
  if (withWhiteBackground) {
    exportCtx.fillStyle = "#ffffff";
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  }

  strokes.forEach((drawable) => {
    drawable.display(exportCtx);
  });

  const anchor = document.createElement("a");
  anchor.href = exportCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
}

// Create a container for the buttons
const buttonsContainer = document.createElement("div");
buttonsContainer.className = "buttons-container"; // Apply flexbox styles
app.appendChild(buttonsContainer);

// Add buttons to this container
buttonsContainer.appendChild(clearButton);
buttonsContainer.appendChild(undoButton);
buttonsContainer.appendChild(redoButton);
buttonsContainer.appendChild(thinMarkerButton);
buttonsContainer.appendChild(thickMarkerButton);
buttonsContainer.appendChild(customStickerButton);
buttonsContainer.appendChild(exportButton);