let video;
let activeTimer = null; // Current active timer
let fadingTimers = []; // Array of timers that are fading away

let groups = [];

let seekForce = 0.05;
let evadeForceClose = 5.0;
let evadeForceFar = 3.0;

let inversion = true;
let concentrationTime = 0;
let attractionRadius = 200;

// User input words
let WORDS = [];
let inputStarted = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(220);
  textAlign(CENTER, CENTER);
  
  let textStartY = 100;
  let textX = 100;
  let textSpacing = 50;


  // Create input interface
  let intro = createP('What\'s on your mind today?<br>Let\'s make a list and get things organised!');
  intro.class('input-intro');
  intro.position(textX, textStartY);


  let instruction = createP('Enter 2-8 words (press Enter after each):');
  instruction.class('input-instruction');
  instruction.position(textX, textStartY + textSpacing *3);
  
  let wordInput = createInput('');
  wordInput.class('word-input');
  wordInput.position(textX, textStartY + textSpacing * 4);

  let startBtn = createButton('Start');
  startBtn.class('start-button');
  startBtn.position(textX, textStartY + textSpacing * 5);
  startBtn.hide(); // Hide until minimum words entered

  let wordList = createP('Words entered: 0');
  wordList.class('word-list');
  wordList.position(textX, textStartY + textSpacing * 7);
  
  
  
  let userWords = [];
  
  // Handle Enter key to add word
  wordInput.changed(() => {
    let val = wordInput.value().trim();
    if (val !== '' && userWords.length < 8) {
      userWords.push({ text: val, count: 20 });
      wordInput.value('');
      
      // Create vertical list with checkboxes
      let listHTML = `Items on your list: ${userWords.length}<br>`;
      listHTML += userWords.map(w => `☐ ${w.text}`).join('<br>');
      wordList.html(listHTML);
      
      if (userWords.length >= 2) {
        startBtn.show();
      }
    }
  });
  
  // Handle start button
  startBtn.mousePressed(() => {
    if (userWords.length >= 2) {
      WORDS = userWords;
      intro.remove();
      instruction.remove();
      wordInput.remove();
      wordList.remove();
      startBtn.remove();
      inputStarted = true;
      initializeSketch();
    }
  });
}

function initializeSketch() {
  video = createCapture(VIDEO);
  video.hide();

  fill(255);
  textFont('Space Mono');

  // Initialize face detection from faceDetection.js
  initFaceDetection(video);

  let intialGrouping = 0.0;

  // Create groups from WORDS array
  for (let wordConfig of WORDS) {
    let group = {
      name: wordConfig.text.toLowerCase(),
      members: [],
      count: wordConfig.count
    };

    // Populate this group
    for (let i = 0; i < group.count; i++) {
      group.members.push(new Word(
        random(width * (0 + intialGrouping), width * (1 - intialGrouping)),
        random(height * (0 + intialGrouping), height * (1 - intialGrouping)),
        wordConfig.text  // Pass the text to the Word constructor
      ));
    }

    groups.push(group);
  }
}

function draw() {

  if (!inputStarted) {
    background(220);
    return;
  }

  if (inversion) {
    background(0);
    fill(255);
  } else {
    background(255);
    fill(0);
  }

  // Get current looking state from face detection module
  const isLooking = getIsLooking();
  
  if (isLooking) {
    concentrationTime += 0.1;
    attractionRadius += 0.5; // Slowly increase attraction radius
   
    // Flicker faster as concentration increases
    // Start flickering slowly, get faster over time
    let flickerSpeed = max(2, 240 - concentrationTime); // Divide by smaller number = faster acceleration
    if (frameCount % flickerSpeed < flickerSpeed / 2) {
      inversion = false;
    } else {
      inversion = true;
    }
    


  } else {
    concentrationTime = 0;
    attractionRadius = 200; // Reset to default
    inversion = true;

  }


  // Update each group
  for (let currentGroup of groups) {
    for (let i = 0; i < currentGroup.members.length; i++) {
      let agent = currentGroup.members[i];

      // Apply forces from all groups
      for (let otherGroup of groups) {
        for (let j = 0; j < otherGroup.members.length; j++) {
          let other = otherGroup.members[j];

          // Skip self
          if (agent === other) continue;

          if (currentGroup === otherGroup) {
            // Same group
            if (isLooking) {
              // When looking - attract to own kind
              let attractForce = agent.seek(other.pos, attractionRadius);
              attractForce.mult(seekForce);
              agent.applyForce(attractForce);
            } else {
              // When not looking - repel own kind
              let repelForce = agent.flee(other.pos);
              let d = p5.Vector.dist(agent.pos, other.pos);
              if (d < 150) {
                repelForce.mult(evadeForceClose);
              } else {
                repelForce.mult(evadeForceFar);
              }
              agent.applyForce(repelForce);
            }
          } else {
            // Different group - always flee
            let evadeForce = agent.flee(other.pos);
            let d = p5.Vector.dist(agent.pos, other.pos);
            if (d < 150) {
              evadeForce.mult(evadeForceClose);
            } else {
              evadeForce.mult(evadeForceFar);
            }
            agent.applyForce(evadeForce);
          }
        }
      }

      agent.edges();
      agent.update();
      agent.show();
    }
  }

}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
	// FULLSCREEN!!!
	if (key === 'f' || key === 'F') {
		let fs = fullscreen();
		fullscreen(!fs);
	}
}
	
function windowResized() {
	if (fullscreen()) {
	resizeCanvas (windowWidth, windowHeight);
	}
}