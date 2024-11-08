# Individual Submission

I achknoweldge the use of AI which aided me in implementing the class structure of the Cloud, specifically the use of fft.

## Interacting with the code
To interact with this code it is very simple. There is a button at the bottom of the screen which will play and pause a sound file which is hard coded into the code.

## Details of your individual approach to animating the group code
I chose to animate the group code through audio, and specifically fft analysis and implementation. The average amplitude of the sound file has been analysed which has resulted in the clouds which move across the screen to grow or shrink depending on the amplitude.

This is unique from the other members of the group as one member chose to do further implementation of perlin noise. Specifically, more circles were added to the original code and perlin noise was used to make them float and move around the screen in a random pattern. The other member of the group used time to influence the original artwork. Specially the background colour and the size of the circles on the canvas would change over time.

## Inspiration
A strong inspiration for this implementation was images which already have movement involved. I believe that using music to influence the size of the artwork would make an artwork more interesting. Furthermore, being able to insert any piece of music which an individual chose would therefore make the artwork more personal to that person. This would allow for the individual to make a greater connection with the artwork. Some examples are shown [here](https://giphy.com/gifs/opening-grayscale-grow-l3q2RlV4Nb4NPdfHO).

Another specific inspiration is Vincent Van Gogh's painting 'Starry Night' which has always been a piece of art which has interested me. If the clouds and the circles could be influenced by sound and specifically music, I believe it would create another interesting element to this amazing piece of art.

<img src="Images/Starry Night.png">

## Technical Explanation
The sound elements of the code was initialised in the following lines of code. The clouds array allowed the the clouds to be modified in the Cloud class.

    let song;
    let fft;
    let numBins = 128;
    let smoothing = 0.5;
    let button;
    let clouds = [];

In the Cloud class a display variable was made which took the average of the fft's amplitude. This allowed the clouds to grow and shrink in line with the amplitude of the song.


    display(spectrumValue){
        noStroke();
        fill(150, - spectrumValue);// The cloud colour is adjusted by the fft value.
        this.size = map(spectrumValue, 0, 1, windowWidth/40, windowWidth/10);// the size of the cloud is adjusted by the amplitude of the fft.
        ellipse(this.x, this.y, this.size); // the cloud is redrawn with this variables taken into account.
  }

The sound was then initalised before the setup function.

    function preload(){
        song = loadSound('Music/755199__danjfilms__biblically-accurate-angel-dying-death-of-a-god.wav'); //Directory of the song which is used.
        fft = new p5.FFT(smoothing, numBins); // Create a new instance of p5.FFT() object.
        song.connect(fft);
    }

The button which allowed the sound to be played and paused was initialised here. This was resized depending on the size of the window.

    button = createButton('Play/Pause'); // The text which is located in the button.
    button.position((width - button.width) / 2, height - button.height - 2); // The size of the button.
    button.mousePressed(play_pause); // The pressinng of the mouse controls whether the sound is played or not.

The following code is where the fft analysis took place. As stated previously the fft was averaged for every sample of the sound. This would create an amplitude average of the fft which would allow for the clouds to change their shape depending on the amplitude of the piece.

    let spectrum = fft.analyze(); // analyse returns an array of amplitude across the frequency spectrum with a maximum value of 255.
    for (let i = 0; i < clouds.length; i++){ // Loops through the spectrum array with a maximum possible value given by clouds.length.
        let spectrumValue = spectrum[i]/255; // a singular amplitude value is then calculated from the spectrum array.
        clouds[i].display(spectrumValue); // The clouds are then displayed with the size dictated on the spectrumValue.
     }

Finally, below is the function which allowed for the sound to be played and paused. It also allowed for the sound to be looped once it had finished playing.

    function play_pause(){
        if (song.isPlaying()){
        song.stop();
        } else {
        song.loop(); // When the song stops playing it gets automatically looped.
        }
    }