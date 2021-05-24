//why am i getting away without having tone.start?

// need to get the images sorted properly

var radiusRatio = 2.5; // number that sets the radius relative to the screen
var radius; // variable to store the actual radius in
var backgroundColour = 'rgb(255,255,255)';
var playOnColour = '#6d6969';
var playOffColour = '#f2fa04';
var playButtonColour;
var buttonState = false;
var whichSound; // which of the samples?
var theSample; //current sample
var theImage; //current image
var theVolume = -6;
const player = new Tone.Player().toDestination();
const toneWaveForm = new Tone.Waveform();
toneWaveForm.size = 128;
player.connect(toneWaveForm);
var buffer0;
var buffer1;
let perfImage0;
let perfImage1;
let imageToUse;
var interfaceState = 0; // 0 displays the text loading, 1 is a button, 2 is a visualisation of the sound, 3 is error loading sound to buffer
var usedSounds = new Array;
var cnvDimension;
var bufferToPlay = buffer1;
var imageToShow = perfImage1;
var lastBuffer;
var currentBuffer;
var numberOfSamples = 13;
let visualisationSize;
let hallImage;
let imageLoaded = false;
let playbuttonPosition;


function preload(){
    chooseSample();
    hallImage = loadImage("/images/performanceZone7_small.png", () => {imageLoaded = true});
}

function setup() {  // setup p5

    let masterDiv = document.getElementById("container");
    let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
    let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
    let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
    cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed
    playButtonColour = playOffColour;
    visualisationSize = height;

    console.log("canvas size = " + cnvDimension);

    noStroke(); // no stroke on the drawings

    let cnv = createCanvas(cnvDimension, cnvDimension); // create canvas - because i'm now using css size and !important this is really about the ratio between them, so the second number effects the shape. First number will be moved by CSS
    cnv.id('mycanvas'); // assign id to the canvas so i can style it - this is where the css dynamic sizing is applied
    cnv.parent('p5parent'); //put the canvas in a div with this id if needed - this also needs to be sized

    // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
    let el = document.getElementById("p5parent");
    el.addEventListener("click", handleClick);

    setRadius();

    playbuttonPosition = {x: width/2, y: height/9};

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
    rectangleY = ((height/11)*7.5);
    rectangleWidth = width/10*8;
    rectangleHeight = height/7;
    playbuttonPosition.x = width/2;
    playbuttonPosition.y = height/9;
    let picWidth = width/2.5;
    let picHeight = picWidth/1.5;
    let picX = width/2;
    let picY = (height/6) * 4.73;
    let visWidth = width/2.26;
    let x = (width/2) - visWidth/2;
    let y = (height/12) * 7.68;
    background(backgroundColour); // background
    imageMode(CORNER);
    image(hallImage, (width/20), (height/5), (width/20)*18, (height/5)*4);
    textSize(cnvDimension/15);

    //imageMode(CENTER);
    if((interfaceState === 0)||(imageLoaded === false)){
        stroke(0); //colour
        strokeWeight(4);
        fill(playOffColour);
        //ellipse(playbuttonPosition.x, playbuttonPosition.y, radius/1.8);
        rectMode(CENTER);
        rect(playbuttonPosition.x, playbuttonPosition.y, rectangleWidth, rectangleHeight);
        fill(0);
        textAlign(CENTER, CENTER);
        noStroke();
        text("Loading", playbuttonPosition.x, playbuttonPosition.y);
        stroke('#f2fa04'); //colour
        strokeWeight(10);
        line(x, y, x + visWidth, y);
    }else if(interfaceState === 1){
        stroke(0); //colour
        strokeWeight(4);
        fill(playButtonColour);
        //ellipse(playbuttonPosition.x, playbuttonPosition.y, radius/1.8);
        rectMode(CENTER);
        rect(playbuttonPosition.x, playbuttonPosition.y, rectangleWidth, rectangleHeight);
        fill(0);
        textAlign(CENTER, CENTER);
        noStroke();
        text("Click To Play", playbuttonPosition.x, playbuttonPosition.y);
        imageMode(CENTER);
        image(imageToShow, picX, picY, picWidth, picHeight);
        stroke('#f2fa04'); //colour
        strokeWeight(10);
        line(x, y, x + visWidth, y);
    }else if(interfaceState === 2){
        stroke('#f2fa04'); //colour
        strokeWeight(10);
        imageMode(CENTER);
        image(imageToShow, picX, picY, picWidth, picHeight);
        let startX = x;
        let startY = y;
        let endX;
        let endY;
        let visualisation = toneWaveForm.getValue();
        for(let i = 0; i < visualisation.length-1; i++){
            startY = y + (visualisation[i]*visualisationSize);
            endX = startX + visWidth/visualisation.length;
            endY = y + (visualisation[i+1]*visualisationSize);
            line(startX, startY, endX, endY);
            startX = startX+(visWidth/visualisation.length);
        }
        stroke(0); //colour
        strokeWeight(4);
        fill(playButtonColour);
        rectMode(CENTER);
        rect(playbuttonPosition.x, playbuttonPosition.y, rectangleWidth, rectangleHeight);
        fill(0);
        textAlign(CENTER, CENTER);
        noStroke();
        text("Click To Load Next Song", playbuttonPosition.x, playbuttonPosition.y);
    }else if(interfaceState === 3){
        noStroke();
        fill('rgb(255,0,0)');
        //ellipse(playbuttonPosition.x, playbuttonPosition.y, radius/1.8);
        rectMode(CENTER);
        rect(playbuttonPosition.x, playbuttonPosition.y, rectangleWidth, rectangleHeight);
        fill(0);
        textAlign(CENTER, CENTER);
        text("Error. Click to reload", playbuttonPosition.x, playbuttonPosition.y);
    }
}

function windowResized() {
    setRadius();
    let masterDiv = document.getElementById("container");
    let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
    let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
    let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
    cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed
    visualisationSize = height;

    resizeCanvas(cnvDimension, cnvDimension);
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
        // let d = dist(mouseX, mouseY, playbuttonPosition.x, playbuttonPosition.y);
        // if (d < radius/2) {
        let clickX = playbuttonPosition.x - rectangleWidth/2;
        let clickY = playbuttonPosition.y - rectangleHeight/2;
        if((mouseX > clickX) && (mouseX < clickX + rectangleWidth) && (mouseY > clickY) && (mouseY < clickY + rectangleHeight)){
            buttonPressed();
            buttonState = true;
            playButtonColour = playOnColour;
        }
    }else if(interfaceState === 2){
        // let d = dist(mouseX, mouseY, playbuttonPosition.x, playbuttonPosition.y);
        // if (d < radius/2) {
        let clickX = playbuttonPosition.x - rectangleWidth/2;
        let clickY = playbuttonPosition.y - rectangleHeight/2;
        if((mouseX > clickX) && (mouseX < clickX + rectangleWidth) && (mouseY > clickY) && (mouseY < clickY + rectangleHeight)){
            buttonPressed();
            buttonState = true;
            playButtonColour = playOffColour;
        }
    }else if(interfaceState === 3){
            console.log("network click");
            interfaceState = 0;
            assignSoundToPlayer();
    }
}

function buttonPressed() {
    if(interfaceState === 1){
        player.start();
        lastBuffer = currentBuffer;
        console.log(`lastBuffer = ${lastBuffer}`);
        console.log("click");
        interfaceState = 2;
        chooseSample();
    }else{
        player.stop();
        interfaceState = 1;
    }
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
    theImage = `perf${whichSound}.png`;
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
        perfImage0 = loadImage(`/images/${theImage}`, () => {imageToUse = perfImage0});
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
        perfImage1 = loadImage(`/images/${theImage}`, () => {imageToUse = perfImage1});
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
        imageToShow = imageToUse;
        interfaceState = 1;
    }else{
        interfaceState = 0;
    }
    // buffer0.dispose();
    // chooseSample();
}


// if(lastBuffer === 0){
//     imageToUse = perfImage0;
// }else{
//     imageToUse = perfImage1;
// }
