let video;
let faceMesh;
let isLooking = false;
let faces = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();

  faceMesh = ml5.faceMesh(video, modelReady);
}

function modelReady() {
  console.log('facemesh ready');
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faces = results;
  
  if (results.length === 0) {
    isLooking = false;
    return;
  }
  
  const face = results[0];
  const keypoints = face.keypoints;

  // Check if we have enough keypoints
  if (!keypoints || keypoints.length < 300) {
    console.log("Not enough keypoints available");
    isLooking = false;
    return;
  }

  // Use eye corner keypoints to estimate gaze
  // Left eye: 33 (outer), 133 (inner)
  // Right eye: 362 (inner), 263 (outer)
  // Nose tip: 1
  
  const leftEyeOuter = keypoints[33];
  const leftEyeInner = keypoints[133];
  const rightEyeInner = keypoints[362];
  const rightEyeOuter = keypoints[263];
  const nose = keypoints[1];
  
  if (!leftEyeOuter || !leftEyeInner || !rightEyeInner || !rightEyeOuter || !nose) {
    isLooking = false;
    return;
  }
  
  // Calculate eye centers
  const leftEyeCenterX = (leftEyeOuter.x + leftEyeInner.x) / 2;
  const rightEyeCenterX = (rightEyeOuter.x + rightEyeInner.x) / 2;
  
  // Calculate face center (midpoint between eyes)
  const faceCenterX = (leftEyeCenterX + rightEyeCenterX) / 2;
  
  // Calculate nose offset from face center
  const noseOffset = Math.abs(nose.x - faceCenterX);
  
  // Calculate eye distance for normalization
  const eyeDistance = Math.abs(leftEyeCenterX - rightEyeCenterX);
  
  // Normalized offset (ratio of nose offset to eye distance)
  const normalizedOffset = noseOffset / eyeDistance;
  
  // If nose is relatively centered between eyes, user is looking at camera
  // Threshold of 0.2 means nose can be 20% of eye-distance away from center
  const threshold = 0.2;
  isLooking = (normalizedOffset < threshold);
}

function draw() {
  background(0);

  // Display message based on attention
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  noStroke();
  
  if (faces.length === 0) {
    text("No face detected", width / 2, height / 2);
  } else if (isLooking) {
    fill(0, 255, 0);
    text("Hello!", width / 2, height / 2);
  } else {
    fill(255, 0, 0);
    text("Please concentrate", width / 2, height / 2);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}