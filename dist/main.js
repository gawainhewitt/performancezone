//why am i getting away without having tone.start?

// if I add a second buffer can i toggle between them, so that one is loading when the other is playing?

// also perhaps have it set so you hear all the recordings in a random order before it returns to the beginning

var radiusRatio = 1.5; // number that sets the radius relative to the screen
var radius; // variable to store the actual radius in
var backgroundColour = 'rgb(0, 255, 0)';
var onColour = 'rgb(255,255,0)';
var offColour = 'rgb(0, 0, 255)';
var buttonColour;
var buttonState = false;
var whichSound; // which of the samples?
var theSample; //current sample
var theVolume = -6;
const player = new Tone.Player().toDestination();
const toneWaveForm = new Tone.Waveform();
toneWaveForm.size = 128;
player.connect(toneWaveForm);
var buffer0;
var buffer1;
var interfaceState = 0; // 0 displays the text loading, 1 is a button, 2 is a visualisation of the sound, 3 is error loading sound to buffer
var usedSounds = new Array;
var cnvDimension;
var bufferToPlay = buffer1;
var lastBuffer;
var currentBuffer;
var numberOfSamples = 13;
let visualisationSize;


function preload(){
    chooseSample();
}

function setup() {  // setup p5

    let masterDiv = document.getElementById("container");
    let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
    let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
    let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
    cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed
    buttonColour = offColour;
    visualisationSize = height*2;

    console.log("canvas size = " + cnvDimension);

    noStroke(); // no stroke on the drawings

    let cnv = createCanvas(windowWidth, windowHeight); // create canvas - because i'm now using css size and !important this is really about the ratio between them, so the second number effects the shape. First number will be moved by CSS
    cnv.id('mycanvas'); // assign id to the canvas so i can style it - this is where the css dynamic sizing is applied
    cnv.parent('p5parent'); //put the canvas in a div with this id if needed - this also needs to be sized

    // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
    let el = document.getElementById("p5parent");
    el.addEventListener("click", handleClick);

    setRadius();

    player.set(
        {
          "mute": false,
          "volume": 0,
          "autostart": false,
          "fadeIn": 0,
          "fadeOut": 0,
          "loop": false,
          "playbackRate": 1,
          "reverse": false,
          "onstop": reload
        }
      );
}

var rectangleX, rectangleY, rectangleWidth, rectangleHeight;

function draw() {
    rectangleX = width/2 - radius/2;
    rectangleY = height/2 - radius/4;
    rectangleWidth = radius;
    rectangleHeight = radius/2;
    background(backgroundColour); // background
    //imageMode(CENTER);
    if(interfaceState === 0){
        noStroke();
        fill(buttonColour);
        rect(rectangleX, rectangleY, rectangleWidth, rectangleHeight);
        fill(150);
        textAlign(CENTER, CENTER);
        textSize(cnvDimension/20);
        text("Loading", width/2, height/2);
    }else if(interfaceState === 1){
        noStroke();
        fill(buttonColour);
        ellipse(width/2, height/2, radius);
    }else if(interfaceState === 2){
        stroke(255, 0, 255);
        strokeWeight(10);
        let x = rectangleX;
        let y = rectangleY + (rectangleHeight/2);
        let startX = x;
        let startY = y;
        let endX;
        let endY;
        let visualisation = toneWaveForm.getValue();
        for(let i = 0; i < visualisation.length-1; i++){
            // point(x, y + (visualisation[i]*visualisationSize));
            // x = x + rectangleWidth/visualisation.length;

            startY = y + (visualisation[i]*visualisationSize);
            endX = startX + rectangleWidth/visualisation.length;
            endY = y + (visualisation[i+1]*visualisationSize);

            line(startX, startY, endX, endY);

            startX = startX + rectangleWidth/visualisation.length;
        }
        //text("Audio Visualisation", width/2, height/2);
        //console.log(toneWaveForm.getValue());
    }else if(interfaceState === 3){
        noStroke();
        fill(buttonColour);
        rect(rectangleX, rectangleY, rectangleWidth, rectangleHeight);
        fill(150);
        textAlign(CENTER, CENTER);
        textSize(cnvDimension/30);
        text("Network Problems, click to try again", rectangleX, rectangleY, rectangleWidth, rectangleHeight);// same dimensions as the rectangle above
    }
}

function windowResized() {
    setRadius();
    resizeCanvas(windowWidth, windowHeight);
  }

function setRadius() {
    if(height > width){
        radius = width/radiusRatio;
    }else{
        radius = height/radiusRatio;
    }
}

function handleClick() {
    if(interfaceState === 1){
        let d = dist(mouseX, mouseY, width/2, height/2);
        if (d < radius/2) {
            buttonPressed();
            buttonState = true;
        }
    }else if(interfaceState === 3){
            console.log("network click");
            interfaceState = 0;
            assignSoundToPlayer();
    }
}

function buttonPressed() {
    player.start();
    lastBuffer = currentBuffer;
    console.log(`lastBuffer = ${lastBuffer}`);
    console.log("click");
    interfaceState = 2;
    chooseSample();
    }


function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min +1) ) + min;
  }

function chooseSample(){
    console.log(`usedSounds = ${usedSounds}`);
    if (usedSounds.length === numberOfSamples){
        console.log(`array full`);
        usedSounds = [];
    }

    do{
        whichSound = getRndInteger(1, numberOfSamples);
    }while(haveWeUsedSound(whichSound));

    usedSounds.push(whichSound);
    console.log(`whichSound = ${whichSound}`);
    theSample = `perf${whichSound}.flac`;
    console.log(`theSample = ${theSample}`);
    console.log(`usedSounds = ${usedSounds}`);

    assignSoundToPlayer();
}

function haveWeUsedSound(comparer) {
    for(var i=0; i < usedSounds.length; i++) {
        if(usedSounds[i] === comparer){
            return true;
        }
    }
    return false;
};

function assignSoundToPlayer() {
    if(bufferToPlay === buffer1){
        buffer0 = new Tone.ToneAudioBuffer(`/sounds/${theSample}`, () => {
            console.log("buffer 0 loaded");
            bufferToPlay = buffer0;
            currentBuffer = 0;
            console.log(`currentBuffer = ${currentBuffer}`);
            if (interfaceState === 0){
                reload();
            }
        },
        () => {
            interfaceState = 3;
            console.log(`interfaceState = ${interfaceState}`)
        });
    }else{
        buffer1 = new Tone.ToneAudioBuffer(`/sounds/${theSample}`, () => {
            console.log("buffer 1 loaded");
            bufferToPlay = buffer1;
            currentBuffer = 1;
            console.log(`currentBuffer = ${currentBuffer}`);
            if (interfaceState === 0){
                reload();
            }
        },
        () => {
            interfaceState = 3;
            console.log(`interfaceState = ${interfaceState}`)
        });
    }
}

function reload() {
    console.log(`in reload`);
    if(lastBuffer !== currentBuffer){
        player.buffer = bufferToPlay.get();
        interfaceState = 1;
    }else{
        interfaceState = 0;
    }
    // buffer0.dispose();
    // chooseSample();
}
