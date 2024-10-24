# Sticker Sketchpad 🎨

**Sticker Sketchpad** is an interactive, web-based application that allows users to unleash their creativity by sketching and placing stickers on a digital canvas. This app leverages the **Command** and **Observer** design patterns to create a dynamic and responsive user experience. Users can draw with various marker thicknesses, apply pre-built or custom stickers, and undo/redo their actions in real-time.

The application offers high-resolution export functionality and includes a modal dialog for exporting options. Users can choose between a transparent or white background for their exported images. Built with modern web technologies, the project demonstrates proficiency in **TypeScript**, **Deno**, **GitHub Actions**, and front-end development using **HTML5 Canvas**.

## Features ✨

- **Canvas Drawing:** Users can draw freehand on a canvas using mouse input.
- **Multiple Markers:** Choose between thin and thick markers, with an adjustable color hue slider.
- **Sticker Selection:** A range of preset stickers (emoji-based), along with an option to create custom stickers.
- **Undo/Redo:** Implemented using the **Command pattern**, allowing users to revert or reapply changes.
- **High-Resolution Export:** Export the canvas as a 1024x1024 PNG image, with an option to select a white or transparent background via a modal dialog.
- **Custom Sticker Tool:** Users can add custom stickers, extending the set of available stickers.

## Demo 🎥

Check out the live demo of Sticker Sketchpad [here](https://rahazaman.github.io/cmpm-121-demo-2/).

## Usage 🖊️

- **Drawing:** Select a marker size and begin drawing on the canvas.
- **Stickers:** Choose from preset stickers or add a custom one, then drag it onto the canvas.
- **Undo/Redo:** Use the Undo/Redo buttons to navigate through previous states of your canvas.
- **Export:** Click the export button to save your masterpiece as a PNG image, with an option for a transparent or white background.

## Technologies Used 🛠️

- **Vite**: Blazing fast front-end tool for development.
- **Deno**: Unified runtime for running modern JavaScript and TypeScript, ensuring secure and efficient development.
- **Node.js**: Used alongside Deno for modern web development features.
- **TypeScript**: Strongly typed programming language that builds on JavaScript.
- **HTML5 Canvas**: Core for drawing and rendering the sketchpad functionalities.
- **CSS3**: Styles the sketchpad, ensuring a visually appealing interface.
- **GitHub Actions**: Automates workflows, builds, and deployments for continuous integration.
- **Git**: Version control system for managing project source code.
- **npm**: Node package manager for managing dependencies.

## Design Patterns Implemented 🧠

- **Command Pattern:** Centralized control over undo/redo actions, encapsulating user commands.
- **Observer Pattern:** Observes changes and events such as drawing actions, ensuring efficient canvas updates.