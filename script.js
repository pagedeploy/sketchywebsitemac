// Global variables
let canvas;
let canvas_ctx;
let win_height;
let win_width;
let drawnImages = []; // Array to store drawn image data
let dockVisible = true; // Track dock visibility

const whiteBackground = "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/white.png?raw=true)";
let userSpecifiedBackground = ""; // Store the user-specified background

// Array of background images
const backgrounds = [
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/yosemite.jpg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/elcapitan.jpg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/sierra.jpg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/highsierra.jpg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/mojave.jpg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/catalina.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/bigsur.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/bigsur2.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/monterey.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/ventura.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/sonoma.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/sonoma2.jpeg?raw=true)",
  "url(https://github.com/pagedeploy/cdn/blob/main/sketchy/bg/tahoe.jpeg?raw=true)",
];

let currentIndex = 6; // Track the current background index

// Add key combination listener for background changes
window.addEventListener("keydown", (event) => {
  // Check for Command + Option + 1
  if (event.metaKey && event.altKey && event.code === "Digit1") {
    defaultBackground();
  }

  // Check for Command + Option + 2
  if (event.metaKey && event.altKey && event.code === "Digit2") {
    setWhiteBackground();
  }

  // Check for Command + Option + 3
  if (event.metaKey && event.altKey && event.code === "Digit3") {
    setUserBackground();
  }

  // Check for Command + Option + 4
  if (event.metaKey && event.altKey && event.code === "Digit4") {
    toggleDock();
  }

  // Check for Command + Option + 5
  if (event.metaKey && event.altKey && event.code === "Digit5") {
    setsize();
  }

  // Check for Command + Option + 6
  if (event.metaKey && event.altKey && event.code === "Digit6") {
    shiftBackgroundLeft();
  }

  // Check for Command + Option + 7
  if (event.metaKey && event.altKey && event.code === "Digit7") {
    shiftBackgroundRight();
  }
});

// Set background to a default one from macOS
function defaultBackground() {
  canvas.style.backgroundImage = backgrounds[currentIndex];
}

// Set background to plain white
function setWhiteBackground() {
  canvas.style.backgroundImage = whiteBackground;
}

// Set background to user-specified one
function setUserBackground() {
  if (userSpecifiedBackground) {
    canvas.style.backgroundImage = `url(${userSpecifiedBackground})`;
  } else {
//    alert('No custom background has been set yet.');
  }
}

// Toggle the visibility of the dock
function toggleDock() {
  dockVisible = !dockVisible;

  // Recalculate size and re-render dock if needed
  setsize();
}

// Shift background to the left
function shiftBackgroundLeft() {
  currentIndex = (currentIndex - 1 + backgrounds.length) % backgrounds.length;
  canvas.style.backgroundImage = backgrounds[currentIndex];
}

// Shift background to the right
function shiftBackgroundRight() {
  currentIndex = (currentIndex + 1) % backgrounds.length;
  canvas.style.backgroundImage = backgrounds[currentIndex];
}

// Drag-and-drop to change the background
window.addEventListener("dragover", (event) => event.preventDefault());
window.addEventListener("drop", (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Store the dropped image URL and set the background
      userSpecifiedBackground = e.target.result;
      canvas.style.backgroundImage = `url(${e.target.result})`;
    };
    reader.readAsDataURL(file);
  } else {
//    alert('Please drop an image file.');
  }
});

// Resize the canvas to match the window
function setsize() {
  win_width = window.innerWidth;
  win_height = window.innerHeight;
  canvas.width = win_width;
  canvas.height = win_height;

  // Only add dock if it should be visible
  if (dockVisible) add_dock();
}

const menu = document.getElementById("shortcutMenu");

// Show the shortcut menu on a double click
document.addEventListener("dblclick", function (e) {
  menu.style.left = `${e.pageX}px`;
  menu.style.top = `${e.pageY}px`;
  menu.style.display = "block";
});

// Hide the shortcut menu if there is a click
document.addEventListener("click", function (e) {
  if (!menu.contains(e.target)) {
    menu.style.display = "none";
  }
});

// Grab a 100-pixel-tall horizontal strip and move it left or right by 50px
function effect_tearing() {
  for (let i = 0; i < 5; i++) {
    let pos_y = parseInt(Math.random() * (win_height - 100)) - 100;

    canvas_ctx.drawImage(
      canvas,
      0,
      pos_y,
      win_width,
      100,
      parseInt(Math.random() * 2) * 100 - 50, // (+/-)50
      pos_y,
      win_width,
      100
    );
  }
}

// Add a random image to the canvas and store its data
function add_image() {
  // Get a random image element
  let rnd_pic = document.getElementById("pic" + parseInt(Math.random() * 21));

  // Define the scaling factor (e.g., 0.5 for 50% smaller)
  let scale = 0.6;

  // Calculate the scaled width and height of the image
  let scaledWidth = parseInt(rnd_pic.width * scale);
  let scaledHeight = parseInt(rnd_pic.height * scale);

  // Calculate random positions within the canvas while considering the scaled size
  let x = parseInt(Math.random() * (win_width - scaledWidth));
  let y = parseInt(Math.random() * (win_height - scaledHeight)) - 70;

  // Draw the scaled image on the canvas
  canvas_ctx.drawImage(rnd_pic, x, y, scaledWidth, scaledHeight);

  // Store the image's position and size in the array
  drawnImages.push({ x, y, width: scaledWidth, height: scaledHeight });
}

// Remove the last drawn image with rounded corners
function remove_image() {
  // No images to remove
  if (drawnImages.length === 0) return;

  // Get the first drawn image's data
  let image = drawnImages.shift();

  // Save the current canvas state and set up the rounded rectangle path
  canvas_ctx.save();
  canvas_ctx.beginPath();
  roundedRect(canvas_ctx, image.x, image.y, image.width, image.height, 10);

  // Create a linear gradient for the top of the rounded rectangle
  const gradient = canvas_ctx.createLinearGradient(
    image.x,
    image.y,
    image.x,
    image.y + 30
  );
  gradient.addColorStop(0, "#E8E8E8"); // Lighter gray for the top
  gradient.addColorStop(1, "#D2D2D2"); // Darker gray for the bottom

  // Fill with the gradient
  canvas_ctx.fillStyle = gradient;
  canvas_ctx.fill();

  // Clip to the rounded rectangle path
  canvas_ctx.clip();

  // Randomly decide whether to restore the image or fill with gray to mimic a blank error
  if (Math.random() < 0.7) {
    // Clear within the path
    canvas_ctx.clearRect(image.x, image.y + 30, image.width, image.height - 30);

    // Create a subtle shine gradient for a flare effect
    const shineGradient = canvas_ctx.createLinearGradient(
      image.x + image.width,
      image.y + image.height, // Top-left corner
      image.x,
      image.y // Bottom-right corner
    );
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0)"); // Fully transparent
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0.4)"); // Semi-transparent white

    // Fill with the shine gradient to simulate the light flare
    canvas_ctx.fillStyle = shineGradient;
    canvas_ctx.fill();
  } else {
    // Fill the bottom part with light gray
    canvas_ctx.fillStyle = "#F0F0F0";
    canvas_ctx.fillRect(image.x, image.y + 30, image.width, image.height - 30);
  }

  // Draw a horizontal line 30 pixels down
  canvas_ctx.strokeStyle = "#C2C2C2"; // Line color
  canvas_ctx.lineWidth = 2;
  canvas_ctx.beginPath();
  canvas_ctx.moveTo(image.x, image.y + 30);
  canvas_ctx.lineTo(image.x + image.width, image.y + 30);
  canvas_ctx.stroke();

  // Draw the outline of the rounded rectangle
  canvas_ctx.strokeStyle = "#C2C2C2"; // Line color
  canvas_ctx.lineWidth = 4;
  canvas_ctx.beginPath();
  roundedRect(canvas_ctx, image.x, image.y, image.width, image.height, 10);

  // Stroke the path to create the outline
  canvas_ctx.stroke();

  // Restore the canvas state
  canvas_ctx.restore();
}

// Helper function to draw a rounded rectangle path
function roundedRect(ctx, x, y, width, height, radius) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

let dock_img = new Image();
dock_img.src = "https://github.com/pagedeploy/cdn/blob/main/sketchy/src/dock.png?raw=true";

// Add dock image to the bottom of the canvas
function add_dock() {
  let dock_width = win_width;

  // Maintain aspect ratio
  let dock_height = dock_width * (dock_img.height / dock_img.width);

  // Center horizontally and align to the bottom of the screen
  let x = (win_width - dock_width) / 2;
  let y = win_height - dock_height;
  canvas_ctx.drawImage(dock_img, x, y, dock_width, dock_height);
}

// Rewind and play one of the audio elements
function do_sound() {
  let rnd_snd = document.getElementById("snd" + parseInt(Math.random() * 5));
  rnd_snd.currentTime = 0;
  rnd_snd.play();
}

// Temporarily bump the whole screen to one side
function screen_shake() {
  canvas.style.left = Math.random() < 0.5 ? "-50px" : "50px";
  setTimeout(function () {
    canvas.style.left = "0px";
  }, 50);
}

// Temporarily tilt the screen
function screen_tilt() {
  canvas.style.transform = "rotate(" + parseInt(Math.random() * 360) + "deg)";
  setTimeout(function () {
    canvas.style.transform = "";
  }, 50);
}

// Draw vertical lines of "dead pixels" (currently unused)
/*
function vertline() {
  let base_x = parseInt(Math.random() * (win_width - 10));

  for (let i = 0; i < 10; i++) {
    canvas_ctx.strokeStyle =
      "rgb(" +
      parseInt(Math.random() * 255) +
      "," +
      parseInt(Math.random() * 255) +
      "," +
      parseInt(Math.random() * 255) +
      ")";

    let line_x = base_x + i + Math.random() * 50 - 25;

    canvas_ctx.beginPath();
    canvas_ctx.moveTo(line_x + 0.5, 0.5);
    canvas_ctx.lineTo(line_x + 0.5, 0.5 + win_height);
    canvas_ctx.stroke();
  }
}
*/

// Main loop (runs on interval)
function mainloop() {
  if (document.hidden === true) return; // Be courteous

  if (Math.random() < 0.1) effect_tearing();
  if (Math.random() < 0.05) screen_shake();
  if (Math.random() < 0.05) screen_tilt();

  add_image(); // Add a new image
  do_sound(); // Play a sound effect

  // Occasionally remove an image
  if (Math.random() < 0.2) remove_image();
}

// Initialize everything
function sw_init() {
  document.getElementById("loading").style = "display:none;";
  canvas = document.getElementById("canvas");
  canvas_ctx = canvas.getContext("2d");

  // Set up event listeners and initial canvas size
  window.addEventListener("resize", setsize);
  setsize();

  // Run the main loop every 150ms
  window.setInterval(mainloop, 150);

  // Add the dock image initially
  add_dock();
}

// Start everything once the window has loaded
window.addEventListener("load", sw_init);
