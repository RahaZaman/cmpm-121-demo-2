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

// Global variable to store the current marker thickness
let currentThickness = 2; // Default to "thin"

// Define the Drawable interface to include display and drag methods
interface Drawable {
  display(ctx: CanvasRenderingContext2D): void;
  drag?(x: number, y: number): void; // Optional method for dragging (extending the line)
}

// Function to create a marker line object that conforms to Drawable interface
function createMarkerLine(initialX: number, initialY: number, thickness: number): Drawable {
  let points = [{ x: initialX, y: initialY }];

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
      ctx.strokeStyle = "#000";
      ctx.lineWidth = thickness;
      ctx.stroke();
    },
    drag(x: number, y: number) {
      points.push({ x, y });
    }
  };
}

// Function to create a tool preview (a circle showing the size of the marker)
function createToolPreview(x: number, y: number, thickness: number): Drawable {
  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(x, y, thickness / 2, 0, 2 * Math.PI);
      ctx.strokeStyle = "#646cff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  };
}

// Function to create a sticker command (for dragging and placing stickers)
function createSticker(initialX: number, initialY: number, sticker: string): Drawable {
  let posX = initialX;
  let posY = initialY;

  return {
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "30px Arial";
      ctx.fillText(sticker, posX, posY);
    },
    drag(x: number, y: number) {
      posX = x;
      posY = y;
    }
  };
}

// Function to start drawing
function startDrawing(event: MouseEvent) {
  isDrawing = true;
  if (currentSticker) {
    currentDrawable = createSticker(event.offsetX, event.offsetY, currentSticker); // Sticker tool
  } else {
    currentDrawable = createMarkerLine(event.offsetX, event.offsetY, currentThickness); // Marker tool
  }
  strokes.push(currentDrawable); // Add the current drawable to strokes
}

// Function to draw and extend the current stroke
function draw(event: MouseEvent) {
  if (!isDrawing || !currentDrawable) return;
  currentDrawable.drag!(event.offsetX, event.offsetY); // Call the drag method to extend or move
  canvas.dispatchEvent(new Event("drawing-changed"));
}

// Function to stop drawing
function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  currentDrawable = null; // Reset currentDrawable
  redoStack = []; // Clear the redo stack when a new action is performed
}

// Function to update tool preview based on mouse movement
function updateToolPreview(event: MouseEvent) {
  if (isDrawing) {
    toolPreview = null; // No preview when drawing
  } else if (currentSticker) {
    toolPreview = createSticker(event.offsetX, event.offsetY, currentSticker); // Sticker preview
  } else {
    toolPreview = createToolPreview(event.offsetX, event.offsetY, currentThickness); // Marker preview
  }
  canvas.dispatchEvent(new Event("drawing-changed"));
}

// Mouse events to control drawing and tool preview
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", (event) => {
  draw(event);
  updateToolPreview(event); // Update tool preview when moving the mouse
});
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Redraw the canvas whenever the 'drawing-changed' event is triggered
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing

  // Redraw each stroke
  strokes.forEach((drawable) => {
    drawable.display(ctx); // Use the display method to draw each stroke
  });

  // Draw the tool preview if available
  if (toolPreview) {
    toolPreview.display(ctx);
  }
});

// Add a clear button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.id = "clear-btn";
app.appendChild(clearButton);

// Function to clear the canvas and reset the strokes
clearButton.addEventListener("click", () => {
  strokes = []; // Clear the strokes array
  redoStack = []; // Clear the redo stack
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
});

// Adding Undo and Redo buttons
const undoButton = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.id = "undo-btn";
app.appendChild(undoButton);

const redoButton = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.id = "redo-btn";
app.appendChild(redoButton);

// Undo button functionality
undoButton.addEventListener("click", () => {
  if (strokes.length > 0) {
    const lastStroke = strokes.pop(); // Remove the most recent stroke
    redoStack.push(lastStroke!); // Push it to the redo stack
    canvas.dispatchEvent(new Event("drawing-changed")); // Redraw
  }
});

// Redo button functionality
redoButton.addEventListener("click", () => {
  if (redoStack.length > 0) {
    const strokeToRedo = redoStack.pop(); // Remove from redo stack
    strokes.push(strokeToRedo!); // Add it back to the strokes array
    canvas.dispatchEvent(new Event("drawing-changed")); // Redraw
  }
});

// Adding marker tool buttons for thin and thick markers
const thinMarkerButton = document.createElement("button");
thinMarkerButton.innerText = "Thin Marker";
thinMarkerButton.id = "thin-marker-btn";
app.appendChild(thinMarkerButton);

const thickMarkerButton = document.createElement("button");
thickMarkerButton.innerText = "Thick Marker";
thickMarkerButton.id = "thick-marker-btn";
app.appendChild(thickMarkerButton);

// Function to select the thin marker
thinMarkerButton.addEventListener("click", () => {
  currentThickness = 2; // Set thickness for thin marker
  currentSticker = null; // Disable sticker mode
  selectTool(thinMarkerButton); // Update CSS to show it's selected
});

// Function to select the thick marker
thickMarkerButton.addEventListener("click", () => {
  currentThickness = 6; // Set thickness for thick marker
  currentSticker = null; // Disable sticker mode
  selectTool(thickMarkerButton); // Update CSS to show it's selected
});

// Helper function to apply the selectedTool class to the active tool
function selectTool(selectedButton: HTMLButtonElement) {
  // Remove the selectedTool class from all buttons
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");

  // Add the selectedTool class to the currently selected button
  selectedButton.classList.add("selectedTool");
}

// Stickers preview helper function
function selectStickerTool(stickerButton: HTMLButtonElement, sticker: string) {
  // Reset tool preview
  currentSticker = sticker;
  toolPreview = null;

  // Remove the selectedTool class from marker buttons
  thinMarkerButton.classList.remove("selectedTool");
  thickMarkerButton.classList.remove("selectedTool");

  // Add the selectedTool class to the selected sticker button
  stickerButton.classList.add("selectedTool");
}

// Define an array to hold sticker emojis
const initialStickers = ["🌟", "🎈", "🍀"];
let stickers = [...initialStickers]; // Spread operator to easily reset

// Helper function to update sticker buttons
function updateStickerButtons() {
  // Clear existing sticker buttons
  document.querySelectorAll(".sticker-btn").forEach((btn) => btn.remove());

  // Add buttons for each sticker
  stickers.forEach((sticker) => {
    const stickerButton = document.createElement("button");
    stickerButton.innerText = sticker;
    stickerButton.className = "sticker-btn"; // Use a class name for easy removal
    stickerButton.addEventListener("click", () => {
      selectStickerTool(stickerButton, sticker);
    });
    app.appendChild(stickerButton);
  });
}

// Initialize sticker buttons
updateStickerButtons();

// Add custom sticker creation functionality
const customStickerButton = document.createElement("button");
customStickerButton.innerText = "Add Custom Sticker";
customStickerButton.addEventListener("click", () => {
  const customSticker = prompt("Enter custom sticker text:", "🧽");
  if (customSticker) {
    stickers.push(customSticker); // Add new sticker to the array
    updateStickerButtons(); // Refresh buttons
  }
});
app.appendChild(customStickerButton);