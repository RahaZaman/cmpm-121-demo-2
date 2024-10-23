import "./style.css";

const APP_NAME = "Sticker Sketchpad";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

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

// Initialize variables to track mouse movement and drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;

// Function to start drawing
function startDrawing(event: MouseEvent) {
  isDrawing = true;
  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Function to draw on the canvas
function draw(event: MouseEvent) {
  if (!isDrawing) return;

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.strokeStyle = "#000"; // Set drawing color to black
  ctx.lineWidth = 2; // Set line width
  ctx.stroke();
  [lastX, lastY] = [event.offsetX, event.offsetY];
}

// Function to stop drawing
function stopDrawing() {
  isDrawing = false;
}

// Mouse events to control drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Add a clear button
const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.id = "clear-btn";
app.appendChild(clearButton);

// Function to clear the canvas
clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});