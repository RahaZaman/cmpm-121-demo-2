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