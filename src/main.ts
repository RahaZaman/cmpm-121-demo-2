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

// Initialize the arrays to store strokes and redoStack (each stroke is an array of points)
let strokes: { x: number; y: number }[][] = [];
let redoStack: { x: number; y: number }[][] = [];
let currentStroke: { x: number; y: number }[] = [];

let isDrawing = false;

// Function to start drawing
function startDrawing(event: MouseEvent) {
  isDrawing = true;
  currentStroke = [{ x: event.offsetX, y: event.offsetY }];
}

// Function to draw on the canvas and save the current stroke's points
function draw(event: MouseEvent) {
  if (!isDrawing) return;

  const point = { x: event.offsetX, y: event.offsetY };
  currentStroke.push(point);

  // Dispatch a custom event whenever a drawing change occurs
  const eventChanged = new Event("drawing-changed");
  canvas.dispatchEvent(eventChanged);
}

// Function to stop drawing
function stopDrawing() {
  if (!isDrawing) return;

  isDrawing = false;
  strokes.push(currentStroke); // Save the finished stroke into strokes array
  currentStroke = [];

  // Clear the redo stack since we've added a new action
  redoStack = [];
}

// Mouse events to control drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Redraw the canvas whenever the 'drawing-changed' event is triggered
canvas.addEventListener("drawing-changed", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

  // Redraw each stroke
  strokes.forEach((stroke) => {
    ctx.beginPath();
    stroke.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Draw the current stroke that is still being drawn
  if (currentStroke.length > 0) {
    ctx.beginPath();
    currentStroke.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
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