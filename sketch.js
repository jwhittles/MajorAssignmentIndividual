// Dynamic background color variables
let dayLength = 1000; // Duration of a day (in frames)
let sunriseColor, noonColor, sunsetColor, nightColor;

// Tree animation variables
let growthSpeed = 0.4;
let maxSize = 40;
let circleSizes = [];
let noiseOffsets = [];
let swayNoiseOffset; // Noise offset for sway effect

// Intialise varibles which will be used for sound
let song;
let fft;
let numBins = 128;
let smoothing = 0.5;
let button;
let clouds = [];

//Class for the clouds
class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(windowWidth/40, windowWidth/20); //The size of the clouds changes with the size of window
  }

  move() {
    this.x += 1;
    if (this.x > width + this.size) {
      this.x = -this.size;
    }
  }

  show() {
    noStroke();
    
    // Get current background color
    let timeOfDay = frameCount % dayLength;
    let currentBgColor;
    
    if (timeOfDay < dayLength / 4) { // Sunrise
      let sunriseProgress = sin(map(timeOfDay, 0, dayLength / 2, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(nightColor), red(sunriseColor), sunriseProgress),
        lerp(green(nightColor), green(sunriseColor), sunriseProgress),
        lerp(blue(nightColor), blue(sunriseColor), sunriseProgress)
      );
    } else if (timeOfDay < dayLength / 2) { // Daytime
      let dayProgress = sin(map(timeOfDay, dayLength / 4, dayLength / 2, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(sunriseColor), red(noonColor), dayProgress),
        lerp(green(sunriseColor), green(noonColor), dayProgress),
        lerp(blue(sunriseColor), blue(noonColor), dayProgress)
      );
    } else if (timeOfDay < (3 * dayLength) / 4) { // Sunset
      let sunsetProgress = sin(map(timeOfDay, dayLength / 2, (3 * dayLength) / 4, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(noonColor), red(sunsetColor), sunsetProgress),
        lerp(green(noonColor), green(sunsetColor), sunsetProgress),
        lerp(blue(noonColor), blue(sunsetColor), sunsetProgress)
      );
    } else { // Night
      let nightProgress = sin(map(timeOfDay, (3 * dayLength) / 4, dayLength, -HALF_PI, HALF_PI));
      currentBgColor = color(
        lerp(red(sunsetColor), red(nightColor), nightProgress),
        lerp(green(sunsetColor), green(nightColor), nightProgress),
        lerp(blue(sunsetColor), blue(nightColor), nightProgress)
      );
    }
    
    // Create gradient effect for each cloud element
    for (let i = 0; i <= this.size; i += 2) {
      // Make cloud color lighter than background
      let cloudColor = color(
        min(red(currentBgColor) + 40, 255),
        min(green(currentBgColor) + 40, 255),
        min(blue(currentBgColor) + 40, 255)
      );
      
      // Create gradient from top to bottom
      let alpha = map(i, 0, this.size, 255, 180);
      cloudColor.setAlpha(alpha);
      fill(cloudColor);

      // Draw cloud shapes with gradient
      let yOffset = map(i, 0, this.size, 0, this.size * 0.2);
      ellipse(this.x, this.y + yOffset, this.size - i);
      ellipse(this.x + this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
      ellipse(this.x - this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
    }
  }

  display(spectrumValue){
    noStroke();
    fill(255, 255, - spectrumValue * 255, 255);
    this.size = map(spectrumValue, 0, 1, windowWidth/40, windowWidth/10);
    ellipse(this.x, this.y, this.size);
  }
}

// Initalises the sound
function preload(){
  song = loadSound('Music/755199__danjfilms__biblically-accurate-angel-dying-death-of-a-god.wav');
  fft = new p5.FFT(smoothing, numBins);
  song.connect(fft);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize dynamic background colors
  nightColor = color(20, 24, 82);      // Night color (deep blue)
  sunriseColor = color(255, 160, 80);  // Sunrise color (orange)
  noonColor = color(135, 206, 250);    // Daytime color (light blue)
  sunsetColor = color(255, 99, 71);    // Sunset color (orange-red)

  // Initialize tree parameters
  let totalCircles = 6 + 4 * 2 + 3 * 2 + 2 * 2;
  swayNoiseOffset = random(1000); // Initialize noise offset for sway effect
  for (let i = 0; i < totalCircles; i++) {
    circleSizes.push(0);          // Initial size of all circles is 0
    noiseOffsets.push(random(1000)); // Random noise offset for each circle
  }

  initaliseClouds();


  // This part of the code creates a button at the bottom of the canvas which allows the user to start or pause the sound file.
  button = createButton('Play/Pause');
  button.position((width - button.width) / 2, height - button.height - 2);
  button.mousePressed(play_pause);

}

function draw() {
  // Calculate current background color (transitioning from night to sunrise, daytime, and then sunset)

  let scaleFactor = min(windowWidth, windowHeight) / 700; //scaleFactor is used to reshape the sizes of the fruit and the tree as the window grows and shrinks.

  let timeOfDay = frameCount % dayLength;
  let r, g, b;
  if (timeOfDay < dayLength / 4) { // Sunrise
    let sunriseProgress = sin(map(timeOfDay, 0, dayLength / 2, -HALF_PI, HALF_PI));
    r = lerp(red(nightColor), red(sunriseColor), sunriseProgress);
    g = lerp(green(nightColor), green(sunriseColor), sunriseProgress);
    b = lerp(blue(nightColor), blue(sunriseColor), sunriseProgress);
  } else if (timeOfDay < dayLength / 2) { // Daytime
    let dayProgress = sin(map(timeOfDay, dayLength / 4, dayLength / 2, -HALF_PI, HALF_PI));
    r = lerp(red(sunriseColor), red(noonColor), dayProgress);
    g = lerp(green(sunriseColor), green(noonColor), dayProgress);
    b = lerp(blue(sunriseColor), blue(noonColor), dayProgress);
  } else if (timeOfDay < (3 * dayLength) / 4) { // Sunset
    let sunsetProgress = sin(map(timeOfDay, dayLength / 2, (3 * dayLength) / 4, -HALF_PI, HALF_PI));
    r = lerp(red(noonColor), red(sunsetColor), sunsetProgress);
    g = lerp(green(noonColor), green(sunsetColor), sunsetProgress);
    b = lerp(blue(noonColor), blue(sunsetColor), sunsetProgress);
  } else { // Night
    let nightProgress = sin(map(timeOfDay, (3 * dayLength) / 4, dayLength, -HALF_PI, HALF_PI));
    r = lerp(red(sunsetColor), red(nightColor), nightProgress);
    g = lerp(green(sunsetColor), green(nightColor), nightProgress);
    b = lerp(blue(sunsetColor), blue(nightColor), nightProgress);
  }

  background(r, g, b); // Set background color

  // Clouds move across the window
  for (let cloud of clouds){
    cloud.move();
    cloud.show();
  }

  // Draw tree animation
  drawBaseStructure(scaleFactor);
  drawCircles(scaleFactor);

  // Control growth of circle sizes
  for (let i = 0; i < circleSizes.length; i++) {
    if (circleSizes[i] < maxSize*scaleFactor) {
      circleSizes[i] += growthSpeed*scaleFactor;
    }
  }

  //Get the frequency spectrum data from the source sound
  let spectrum = fft.analyze();
  for (let i = 0; i < clouds.length; i++){
    let spectrumValue = spectrum[i]/255;
    clouds[i].display(spectrumValue);
  }
}

// Draw the base structure (flowerpot)
function drawBaseStructure(scaleFactor) {
  fill(150, 180, 100); // Pot color
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height - 150*scaleFactor, 350*scaleFactor, 80*scaleFactor);

  fill(80, 160, 90); // Green semi-circles
  for (let i = 0; i < 5; i++) {
    arc(width / 2 - 120 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, PI, 0);
  }

  fill(200, 60, 60); // Red semi-circles
  for (let i = 0; i < 4; i++) {
    arc(width / 2 - 90 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, 0, PI);
  }

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 300 === maxSize){
    resetCircleSize();
  }
}


// Draw circles for tree trunk and branches with noise-based sway
function drawCircles(scaleFactor) {
  let currentIndex = 0;
  let circleSize = 50*scaleFactor;

  drawVerticalCircles(width / 2, height - 200*scaleFactor, 6, circleSize, currentIndex, scaleFactor);
  currentIndex += 6;

  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 4;
  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, 1, currentIndex, scaleFactor);
  currentIndex += 4;

  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 3;
  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, 1, currentIndex, scaleFactor);
  currentIndex += 3;

  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, -1, currentIndex, scaleFactor);
  currentIndex += 2;
  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, 1, currentIndex, scaleFactor);

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 300 === maxSize){
    resetCircleSize();
  }
}

// Draw vertical circles (trunk) with sway effect
function drawVerticalCircles(x, y, count, size, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // Calculate sway

  for (let i = 0; i < count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let noiseY = map(noise(noiseOffsets[indexStart + i] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let circleSize = circleSizes[indexStart + i];
    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize);
    // Set the first circle as golden
    let isGolden = (i === 3); // Change this index to make a different circle golden

    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize, isGolden);

    if (i > 0) {
      drawLine(x + sway, y - (i - 1) * size * 1.2, x + sway, y - i * size * 1.2);
    }
  }
}

// Draw horizontal circles (branches) with sway effect
function drawHorizontalCircles(x, y, count, size, direction, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // Calculate sway

  for (let i = 1; i <= count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i - 1] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let noiseY = map(noise(noiseOffsets[indexStart + i - 1] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor);
    let xPos = x + i * size * 1.2 * direction + noiseX + sway;
    let circleSize = circleSizes[indexStart + i - 1];
    drawColoredCircle(xPos, y + noiseY, circleSize);
    

    drawLine(x + sway, y, xPos, y + noiseY);
  }
}

// Draw a circle with alternating red and green halves, and one with gold
function drawColoredCircle(x, y, size, isGolden = false) {
  noStroke();
  if (isGolden) {
    fill(255, 215, 0); // Gold color for the top half
    arc(x, y, size, size, PI, 0);
    fill(218, 165, 32); // Darker gold for the bottom half
    arc(x, y, size, size, 0, PI);
  } else {
    fill(200, 60, 60); // Red top half
    arc(x, y, size, size, PI, 0);
    fill(80, 160, 90); // Green bottom half
    arc(x, y, size, size, 0, PI);
  }
}


// Draw connecting line for branches
function drawLine(x1, y1, x2, y2) {
  stroke(100, 50, 50, 150);
  strokeWeight(5);
  line(x1, y1, x2, y2);
}

// Initialise Clouds
function initaliseClouds(){
  clouds = []; // This clears the excisiting clouds
  for (let i = 0; i < 5; i++){
    clouds.push(new Cloud(random(width), random(windowWidth/40,windowWidth/10)));
  }
}

// The circles get reset with this function.
function resetCircleSize(){
  for (let i = 0; i < circleSizes.length; i++) {
    circleSizes[i] = 0;
  }
}

 // This function plays or stops the sound.
function play_pause(){
  if (song.isPlaying()){
    song.stop();
  } else {
    song.loop();
  }
}

// Adjust canvas size on window resize
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initaliseClouds(); // The clouds get reset everytime the canvas gets adjusted.
  resizeButton();
}

// This function resizes the button in line with the size of the window.
function resizeButton(){
  let buttonWidth = windowWidth * 0.1; // the width of the button is directly related to the width of the window
  let buttonHeight = windowHeight * 0.05; // the hight of the button is directly related to the height of the window
  button.size(buttonWidth, buttonHeight);
  button.position((windowWidth - buttonWidth)/2, windowHeight - buttonHeight - 20); // this sets the location of the button in relation to the window
}
