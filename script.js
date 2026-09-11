// Global variables
let canvas;
let canvas_ctx;
let win_height;
let win_width;
let drawnImages = [];             // Array to store drawn image data
let dockVisible = true;           // Track dock visibility

let userSpecifiedBackground = ""; // Store the user-specified background
let currentIndex = 6;             // Track the current background index (bigsur)

let bgRequest = 0;                // Guards against a slow image landing after another was picked

// Random whole number below max
function rnd(max) {
  return parseInt(Math.random() * max);
}

// Every shortcut in order, driving both the key handler and the menu
const shortcuts = [
  ["Default Background", defaultBackground],
  ["White Background", () => setBackground(whiteBackground)],
  ["User Background", setUserBackground],
  ["Toggle Dock", toggleDock],
  ["Clear All Popups", setsize],
  ["Shift Background Left", () => shiftBackground(-1)],
  ["Shift Background Right", () => shiftBackground(1)],
];

// Add key combination listener for background changes
window.addEventListener("keydown", (event) => {
  // Check for Command + Option + 1 through 7
  if (!event.metaKey || !event.altKey) return;

  const shortcut = shortcuts[event.code.replace("Digit", "") - 1];
  if (shortcut) shortcut[1]();
});

// Paint a background, showing its inline preview until the full image has decoded
function setBackground(bg) {
  const request = ++bgRequest;
  const preview = bg.lqip ? `url("${bg.lqip}")` : "";

  // The preview is inline data so it paints on the very next frame
  canvas.style.backgroundImage = preview || `url("${bg.url}")`;
  if (!bg.lqip) return;

  const full = new Image();
  full.src = bg.url;

  // Layer the full image over the preview once it is ready to paint
  const reveal = () => {
    if (request !== bgRequest) return; // A newer background has since been picked
    canvas.style.backgroundImage = `url("${bg.url}"), ${preview}`;
  };

  // decode() waits for a paintable image, so the swap never stutters
  if (full.decode) full.decode().then(reveal, () => {});
  else full.onload = reveal;
}

// Set background to a default one from macOS
function defaultBackground() {
  setBackground(backgrounds[currentIndex]);
}

// Set background to user-specified one
function setUserBackground() {
  if (userSpecifiedBackground) {
    // Already a local data URL so there is nothing to preview
    bgRequest++;
    canvas.style.backgroundImage = `url("${userSpecifiedBackground}")`;
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

// Step through the backgrounds, wrapping around at either end
function shiftBackground(step) {
  currentIndex = (currentIndex + step + backgrounds.length) % backgrounds.length;
  setBackground(backgrounds[currentIndex]);
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
      setUserBackground();
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

// Build the menu from the shortcut table so the two never drift apart
shortcuts.forEach(([label, action], i) => {
  const item = document.createElement("li");
  item.textContent = `⌘ + ⌥ + ${i + 1}: ${label}`;
  item.onclick = action;
  document.getElementById("shortcutList").appendChild(item);
});

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
    const pos_y = rnd(win_height - 100) - 100;

    // prettier-ignore
    canvas_ctx.drawImage(
      canvas, 0, pos_y, win_width, 100,
      rnd(2) * 100 - 50, pos_y, win_width, 100 // (+/-)50
    );
  }
}

// Add a random image to the canvas and store its data
function add_image() {
  // Get a random image element
  const rnd_pic = document.getElementById("pic" + rnd(21));

  // Define the scaling factor (e.g., 0.5 for 50% smaller)
  const scale = 0.6;

  // Calculate the scaled size, then a random position that keeps it on screen
  const width = parseInt(rnd_pic.width * scale);
  const height = parseInt(rnd_pic.height * scale);
  const x = rnd(win_width - width);
  const y = rnd(win_height - height) - 70;

  // Draw the scaled image on the canvas
  canvas_ctx.drawImage(rnd_pic, x, y, width, height);

  // Store the image's position and size in the array
  drawnImages.push({ x, y, width, height });
}

// Remove the last drawn image with rounded corners
function remove_image() {
  // No images to remove
  if (drawnImages.length === 0) return;

  // Get the first drawn image's data
  const { x, y, width, height } = drawnImages.shift();

  // Save the current canvas state and set up the rounded rectangle path
  canvas_ctx.save();
  canvas_ctx.beginPath();
  roundedRect(canvas_ctx, x, y, width, height, 10);

  // Create a linear gradient for the top of the rounded rectangle
  const gradient = canvas_ctx.createLinearGradient(x, y, x, y + 30);
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
    canvas_ctx.clearRect(x, y + 30, width, height - 30);

    // Create a subtle shine gradient running corner to corner for a flare effect
    const shineGradient = canvas_ctx.createLinearGradient(x + width, y + height, x, y);
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0)");   // Fully transparent
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0.4)"); // Semi-transparent white

    // Fill with the shine gradient to simulate the light flare
    canvas_ctx.fillStyle = shineGradient;
    canvas_ctx.fill();
  } else {
    // Fill the bottom part with light gray
    canvas_ctx.fillStyle = "#F0F0F0";
    canvas_ctx.fillRect(x, y + 30, width, height - 30);
  }

  // Draw the divider and the outline in the same line color
  canvas_ctx.strokeStyle = "#C2C2C2";

  // Draw a horizontal line 30 pixels down
  canvas_ctx.lineWidth = 2;
  canvas_ctx.beginPath();
  canvas_ctx.moveTo(x, y + 30);
  canvas_ctx.lineTo(x + width, y + 30);
  canvas_ctx.stroke();

  // Draw the outline of the rounded rectangle
  canvas_ctx.lineWidth = 4;
  canvas_ctx.beginPath();
  roundedRect(canvas_ctx, x, y, width, height, 10);

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
dock_img.src = CDN + "src/dock.png";

// Add dock image to the bottom of the canvas
function add_dock() {
  // Span the full width and keep the aspect ratio
  const dock_height = win_width * (dock_img.height / dock_img.width);

  // Align to the bottom of the screen
  canvas_ctx.drawImage(dock_img, 0, win_height - dock_height, win_width, dock_height);
}

// Rewind and play one of the audio elements
function do_sound() {
  const rnd_snd = document.getElementById("snd" + rnd(5));
  rnd_snd.currentTime = 0;
  rnd_snd.play();
}

// Temporarily override a canvas style, then let it snap back
function flicker(property, value) {
  canvas.style[property] = value;
  setTimeout(function () {
    canvas.style[property] = "";
  }, 50);
}

// Temporarily bump the whole screen to one side
function screen_shake() {
  flicker("left", Math.random() < 0.5 ? "-50px" : "50px");
}

// Temporarily tilt the screen
function screen_tilt() {
  flicker("transform", `rotate(${rnd(360)}deg)`);
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
  do_sound();  // Play a sound effect

  // Occasionally remove an image
  if (Math.random() < 0.2) remove_image();
}

// Initialize everything
function sw_init() {
  document.getElementById("loading").style = "display:none;";
  canvas = document.getElementById("canvas");
  canvas_ctx = canvas.getContext("2d");

  // Upgrade the stylesheet preview to the full-resolution background
  defaultBackground();

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
