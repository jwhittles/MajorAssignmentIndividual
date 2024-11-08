/////////// INITIALISE ALL VARIABLES ///////////////

// Dynamic background color variables
let dayLength = 1000; // Duration of a day (in frames).
let sunriseColor, noonColor, sunsetColor, nightColor; // The four different colours of the background is initlaised here.

// Tree animation variables
let growthSpeed = 0.4; // The growth of the fruit is controlled by this variable.
let maxSize = 40; // The maximum size of the fuit is controlled by this variable.
let circleSizes = []; // An array of circles.
let noiseOffsets = []; // The offset of the perlin noise.
let swayNoiseOffset; // Noise offset for sway effect.

// Intialise varibles which will be used for sound
let song; //Song variable is initialised here.
let fft; // fft is initalised.
let numBins = 128; // The number of frequency bins is initalised here, having more bins will give a higher level of resolution to the fft.
let smoothing = 0.5; // Smoothing between each of the fft bins.
let button; // button variable is initalised here.
let clouds = []; // An array of clouds is initlised here.

//////////// MAIN PART OF THE CODE BEGINS HERE //////////

//Class for the clouds
class Cloud {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(windowWidth/40, windowWidth/20); //The size of the clouds changes with the size of window
  }

  // Movement of the clouds across the window is created.
  move() {
    this.x += 1;
    if (this.x > width + this.size) { // When the clouds reach the end of the window it is deleted.
      this.x = -this.size;
    }
  }

  show() {
    noStroke();
    
    // The following code takes the background colours and uses it as a base to influence the colours of the clouds.
    let timeOfDay = frameCount % dayLength;
    let currentBgColor;
    
    if (timeOfDay < dayLength / 4) { // Sunrise
      let sunriseProgress = sin(map(timeOfDay, 0, dayLength / 2, -HALF_PI, HALF_PI)); // The sunriseProgress is calcualted by mapping the value of timeOfDay to a quater sin wave (because -HALF_P1 and HALF_PI has been used) which has a maximum value of 0.25 and a minimum value of -0.25.
      currentBgColor = color(
        lerp(red(nightColor), red(sunriseColor), sunriseProgress), // lerp is used to move between nightColor and sunriseColor background colours for red.
        lerp(green(nightColor), green(sunriseColor), sunriseProgress), // lerp is used to move between nightColor and sunriseColor background colours for green.
        lerp(blue(nightColor), blue(sunriseColor), sunriseProgress) // lerp is used to move between nightColor and sunriseColor background colours for blue.
      );
    } else if (timeOfDay < dayLength / 2) { // Daytime
      let dayProgress = sin(map(timeOfDay, dayLength / 4, dayLength / 2, -HALF_PI, HALF_PI)); // The dayProgress is calcualted by mapping the value of timeOfDay to a quater sin wave (because -HALF_P1 and HALF_PI has been used) which has a maximum value of 0.25 and a minimum value of -0.25.
      currentBgColor = color(
        lerp(red(sunriseColor), red(noonColor), dayProgress), // lerp is used to move between sunriseColor and noonColor background colours for red.
        lerp(green(sunriseColor), green(noonColor), dayProgress), // lerp is used to move between sunriseColor and noonColor background colours for green.
        lerp(blue(sunriseColor), blue(noonColor), dayProgress) // lerp is used to move between sunriseColor and noonColor background colours for blue.
      );
    } else if (timeOfDay < (3 * dayLength) / 4) { // Sunset
      let sunsetProgress = sin(map(timeOfDay, dayLength / 2, (3 * dayLength) / 4, -HALF_PI, HALF_PI)); // The sunsetProgress is calcualted by mapping the value of timeOfDay to a quater sin wave (because -HALF_P1 and HALF_PI has been used) which has a maximum value of 0.25 and a minimum value of -0.25.
      currentBgColor = color(
        lerp(red(noonColor), red(sunsetColor), sunsetProgress), // lerp is used to move between noonColor and sunsetColor background colours for red.
        lerp(green(noonColor), green(sunsetColor), sunsetProgress), // lerp is used to move between noonColor and sunsetColor background colours for green.
        lerp(blue(noonColor), blue(sunsetColor), sunsetProgress) // lerp is used to move between noonColor and sunsetColor background colours for blue.
      );
    } else { // Night
      let nightProgress = sin(map(timeOfDay, (3 * dayLength) / 4, dayLength, -HALF_PI, HALF_PI)); // The nightProgress is calcualted by mapping the value of timeOfDay to a quater sin wave (because -HALF_P1 and HALF_PI has been used) which has a maximum value of 0.25 and a minimum value of -0.25.
      currentBgColor = color(
        lerp(red(sunsetColor), red(nightColor), nightProgress), // lerp is used to move between sunsetColor and nightColor background colours for red. 
        lerp(green(sunsetColor), green(nightColor), nightProgress), // lerp is used to move between sunsetColor and nightColor background colours for green. 
        lerp(blue(sunsetColor), blue(nightColor), nightProgress) // lerp is used to move between sunsetColor and nightColor background colours for blue. 
      );
    }
    
    // Create gradient effect for each cloud element
    for (let i = 0; i <= this.size; i += 2) {
      // Make cloud color lighter than background
      let cloudColor = color(
        min(red(currentBgColor) + 40, 255), // The red gradient is adjusted and the adjustement is grabbed from currenntBgColor. This is used the colour the clouds.
        min(green(currentBgColor) + 40, 255), // The green gradient is adjusted and the adjustement is grabbed from currenntBgColor. This is used to colour the clouds.
        min(blue(currentBgColor) + 40, 255) // the blue graidient is adjusted and the adjustment is grabbed from currentBgColor. This is used to coloir the clouds.
      );
      
      // Create gradient from top to bottom
      let alpha = map(i, 0, this.size, 255, 180);
      cloudColor.setAlpha(alpha);
      fill(cloudColor); // The colours of the clouds is then filled

      // Draw cloud shapes with gradient
      let yOffset = map(i, 0, this.size, 0, this.size * 0.2);
      // Three different sized circles create a cloud.
      ellipse(this.x, this.y + yOffset, this.size - i);
      ellipse(this.x + this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
      ellipse(this.x - this.size * 0.5, this.y + this.size * 0.2 + yOffset, (this.size - i) * 0.8);
    }
  }

  // Display the cloud with the effect of the fft.
  display(spectrumValue){
    noStroke();
    fill(150, - spectrumValue);// The cloud colour is adjusted by the fft value.
    this.size = map(spectrumValue, 0, 1, windowWidth/40, windowWidth/10);// the size of the cloud is adjusted by the amplitude of the fft.
    ellipse(this.x, this.y, this.size); // the cloud is redrawn with this variables taken into account.
  }
}

// Initalises the sound
function preload(){
  song = loadSound('Music/587894__seth_makes_sounds__heavenly-synth.wav'); //Directory of the song which is used.
  fft = new p5.FFT(smoothing, numBins); // Create a new instance of p5.FFT() object.
  song.connect(fft);
}

function setup() {
  createCanvas(windowWidth, windowHeight); // The size of the canvas is based of the size of the window.

  // Initialize dynamic background colors
  nightColor = color(20, 24, 82); // Night color (deep blue)
  sunriseColor = color(255, 160, 80); // Sunrise color (orange)
  noonColor = color(135, 206, 250); // Daytime color (light blue)
  sunsetColor = color(255, 99, 71); // Sunset color (orange-red)

  // Initialize tree parameters
  let totalCircles = 6 + 4 * 2 + 3 * 2 + 2 * 2;
  swayNoiseOffset = random(1000); // Initialize noise offset for sway effect
  for (let i = 0; i < totalCircles; i++) {
    circleSizes.push(0); // Initial size of all circles is 0
    noiseOffsets.push(random(1000)); // Random noise offset for each circle
  }

  initaliseClouds(); // The clouds are innitalised here.


  // This part of the code creates a button at the bottom of the canvas which allows the user to start or pause the sound file.
  button = createButton('Play/Pause'); // The text which is located in the button.
  button.position((width - button.width) / 2, height - button.height - 2); // The size of the button.
  button.mousePressed(play_pause); // The pressinng of the mouse controls whether the sound is played or not.

}

function draw() {
  let scaleFactor = min(windowWidth, windowHeight) / 700; //scaleFactor is used to reshape the sizes of the fruit and the tree as the window grows and shrinks.

  // Calculate current background color (transitioning from night to sunrise, daytime, and then sunset)
  // The following is the same code which has been used in the Cloud class. This can be seen between lines 44-73.
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
    if (circleSizes[i] < maxSize*scaleFactor) { // The maximum size of the circles is controlled by scaleFactor.
      circleSizes[i] += growthSpeed*scaleFactor;
    }
  }

  //Get the frequency spectrum data from the source sound
  let spectrum = fft.analyze(); // analyse returns an array of amplitude across the frequency spectrum with a maximum value of 255.
  for (let i = 0; i < clouds.length; i++){ // Loops through the spectrum array with a maximum possible value given by clouds.length.
    let spectrumValue = spectrum[i]/255; // a singular amplitude value is then calculated from the spectrum array.
    clouds[i].display(spectrumValue); // The clouds are then displayed with the size dictated on the spectrumValue.
  }
}

// Draw the base structure (flowerpot)
function drawBaseStructure(scaleFactor) {
  fill(150, 180, 100); // Pot color
  noStroke();
  rectMode(CENTER);
  rect(width / 2, height - 150*scaleFactor, 350*scaleFactor, 80*scaleFactor); // The location of the base is adjusted base of the window size, this is controlled by the scaleFactor variable.

  fill(80, 160, 90); // Green semi-circles
  for (let i = 0; i < 5; i++) { // Amount of green semi-cirles in the base structure.
    arc(width / 2 - 120 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, PI, 0); // The size of these semi-circles is adjusted based on the scaleFactor variable.
  }

  fill(200, 60, 60); // Red semi-circles
  for (let i = 0; i < 4; i++) { // Amount of red semi-circles in the base structure.
    arc(width / 2 - 90 + i * 60, height - 150*scaleFactor, 60*scaleFactor, 60*scaleFactor, 0, PI); // The size of these semi-circles is adjusted based on the scaleFactor variable.
  }

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 300 === maxSize){
    resetCircleSize(); // The circles get reset after 300 frames.
  }
}


// Draw circles for tree trunk and branches with noise-based sway
function drawCircles(scaleFactor) {
  let currentIndex = 0;
  let circleSize = 50*scaleFactor; // The size of the circles is adjusted based on the scaleFactor variable.

  drawVerticalCircles(width / 2, height - 200*scaleFactor, 6, circleSize, currentIndex, scaleFactor); // The distance between each of the circles, the size of the circles, the number of circles and the window size are taken into consideration for the final size of the circles.
  currentIndex += 6; // The number of circles on the virtical branch.

  // The circles drawn below are located on the middle branch and are on the left hand side.
  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, -1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 4; // The number of circles.

  // The curcles drawn below are located on the middle branch and are on the right hand side.
  drawHorizontalCircles(width / 2, height - 450*scaleFactor, 4, circleSize, 1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 4; // The number of circles.

  // The circles drawn below are located on the bottom branch and are on the left hand side.
  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, -1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 3; // The number of circles.

  // The circles drawn below are located on the bottom branch and are on the right hand side.
  drawHorizontalCircles(width / 2, height - 350*scaleFactor, 3, circleSize, 1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 3; // The number of circles.

  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, -1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 2; // The number of cirles.

  drawHorizontalCircles(width / 2, height - 550*scaleFactor, 2, circleSize, 1, currentIndex, scaleFactor); // The distance between each of the circles, the relative location on the canvas, the number of circles and the size of the window are taken into consideration for the final size of the circles.
  currentIndex += 2;

  // The circle refreshes, to change the speed of this the number after framecount needs to be changed.
  if (frameCount % 300 === maxSize){
    resetCircleSize();
  }
}

// Draw vertical circles (trunk) with sway effect
function drawVerticalCircles(x, y, count, size, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // The sway of the vertical lines is calcualted with perlin noise.

  for (let i = 0; i < count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor); // The X-axis swaying is calcualted here due to perlin noise.
    let noiseY = map(noise(noiseOffsets[indexStart + i] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor); // The Y-axis swaying is calculated here due to perlin noise.
    let circleSize = circleSizes[indexStart + i]; // The size of the circles are calculated with the index value.
    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize);
    // Set the first circle as golden
    let isGolden = (i === 3); // Change this index to make a different circle golden

    drawColoredCircle(x + noiseX + sway, y - i * size * 1.2 + noiseY, circleSize, isGolden); // The golden circle is now swaing with perlin noise being used to calculate the sway.

    if (i > 0) {
      drawLine(x + sway, y - (i - 1) * size * 1.2, x + sway, y - i * size * 1.2); // The vertical line is now swaying with perlin noise being used to calcualte the sway.
    }
  }
}

// Draw horizontal circles (branches) with sway effect
function drawHorizontalCircles(x, y, count, size, direction, indexStart, scaleFactor) {
  let sway = map(noise(swayNoiseOffset + frameCount * 0.01), 0, 1, -5*scaleFactor, 5*scaleFactor); // Calculate the sway of the line with perline noise being used to sway the line.
  for (let i = 1; i <= count; i++) {
    let noiseX = map(noise(noiseOffsets[indexStart + i - 1] + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor); // The X-axis swaying is calculated here due to perlin noise.
    let noiseY = map(noise(noiseOffsets[indexStart + i - 1] + 1000 + frameCount * 0.01), 0, 1, -10*scaleFactor, 10*scaleFactor); // The Y-axis swaying is calculated here due to perlin noise.
    let xPos = x + i * size * 1.2 * direction + noiseX + sway; // The position of the circles is written here.
    let circleSize = circleSizes[indexStart + i - 1]; // The size of the circles are caculated with the index value.
    drawColoredCircle(xPos, y + noiseY, circleSize); // The circles with the sway implemented is drawn on the canvas.
    drawLine(x + sway, y, xPos, y + noiseY); // The lines with the sway implemented is drawn on the canvas.
  }
}

// Draw a circle with alternating red and green halves, and one with gold.
function drawColoredCircle(x, y, size, isGolden = false) {
  noStroke();
  if (isGolden) {
    fill(255, 215, 0); // Gold color for the top half.
    arc(x, y, size, size, PI, 0); // The size of the top half of the semi-cirlce.
    fill(218, 165, 32); // Darker gold for the bottom half.
    arc(x, y, size, size, 0, PI); // The size of the bottom hald of the semi-circle.
  } else {
    fill(200, 60, 60); // Red top half.
    arc(x, y, size, size, PI, 0); // The size of the top half of the semi-circle.
    fill(80, 160, 90); // Green bottom half.
    arc(x, y, size, size, 0, PI); // The size of the bottom half of the semi-circle.
  }
}


// Draw connecting line for branches
function drawLine(x1, y1, x2, y2) {
  stroke(100, 50, 50, 150); // The colour of the lines.
  strokeWeight(5); // The width of the lines.
  line(x1, y1, x2, y2);
}

// Initialise Clouds
function initaliseClouds(){
  clouds = []; // This clears the excisiting clouds.
  for (let i = 0; i < 5; i++){ // A maximum of 5 clodus can be on the screen at any one time.
    clouds.push(new Cloud(random(width), random(windowWidth/40,windowWidth/10))); // Random clouds get genenrated everytime, through using windowWidth and windowHeight the clouds stay on the top of the screen.
  }
}

// The circles get reset with this function.
function resetCircleSize(){
  for (let i = 0; i < circleSizes.length; i++) { // Loops each of the circles which are on the canvas.
    circleSizes[i] = 0; // Restets the size of each of the circles to 0.
  }
}

 // This function plays or stops the sound.
function play_pause(){
  if (song.isPlaying()){
    song.stop();
  } else {
    song.loop(); // When the song stops playing it gets automatically looped.
  }
}

// Adjust canvas size on window resize.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initaliseClouds(); // The clouds get reset everytime the size of the canvas gets adjusted.
  resizeButton(); // The button size gets adjusted everytime the size of the canvas gets adjusted.
}

// This function resizes the button in line with the size of the window.
function resizeButton(){
  let buttonWidth = windowWidth * 0.1; // The width of the button is directly related to the width of the window.
  let buttonHeight = windowHeight * 0.05; // The height of the button is directly related to the height of the window.
  button.size(buttonWidth, buttonHeight); // The final button size.
  button.position((windowWidth - buttonWidth)/2, windowHeight - buttonHeight - 20); // This sets the location of the button in relation to the window.
}
