let input;
let asciiTotal = 0;
let wordAsciiTotals = [];
let words = [];
let shapes = [];
let bgColor;
let colorCache = {}; // Store colors we've already looked up

async function getColorFromWord(word) {
  // Check cache first
  if (colorCache[word]) {
    console.log('Color from cache:', word);
    return colorCache[word];
  }

  try {
    // Add minimum 3 character check
    if (word.length < 3) {
      return null;
    }
    
    const response = await fetch(`https://api.color.pizza/v1/names/?name=${encodeURIComponent(word)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    console.log('Full API response:', data);

    // Try different possible response structures
    let colors = data;
    if (data.colors) colors = data.colors;
    
    if (Array.isArray(colors) && colors.length > 0) {
      const colorData = colors[0];
      console.log('Color data:', colorData);
      
      // Try to get hex value and convert
      if (colorData.hex) {
        let hexValue = colorData.hex;
        if (hexValue.startsWith('#')) hexValue = hexValue.slice(1);
        
        const r = parseInt(hexValue.substr(0, 2), 16) / 255 * 360;
        const g = parseInt(hexValue.substr(2, 2), 16) / 255 * 100;
        const b = parseInt(hexValue.substr(4, 2), 16) / 255 * 100;
        
        // Just use the hex directly with p5
        const col = color('#' + hexValue);
        colorCache[word] = col;
        console.log('Created color:', colorData.name, hexValue);
        return col;
      }
    }
    
    return null;
    
  } catch (e) {
    console.error('API error:', e);
    return null;
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 255);
  bgColor = color(0, 0, 100); // FIXED: Initialize as color object
  
  // Create text input area on the left with no border
  input = createElement('textarea');
  input.position(20, 20);
  input.size(width * 0.4, height - 40);
  input.style('border', 'none');
  input.style('background-color', 'transparent');
  input.style('color', '#000');
  input.style('font-size', '26px');
  input.style('resize', 'none');
  input.style('outline', 'none');
  input.attribute('placeholder', 'Type here...');
  input.input(calculateAsciiTotal);
}

let lastTextLength = 0;

async function handleVisualEffects(text, spaceTyped) {
  let previousLength = shapes.length;

  // Handle word completion effects
  if (spaceTyped && words.length > 0) {
    let lastWord = words[words.length - 1].toLowerCase();
    // FIXED: Remove punctuation from word before checking
    lastWord = lastWord.replace(/[.,!?;:]/g, '');
    let lastWordTotal = wordAsciiTotals[wordAsciiTotals.length - 1];
    console.log('Word completed:', lastWord, 'ASCII:', lastWordTotal);

    // Special word conditions
    if (lastWord === 'circle') {
      let x = width / 2;
      let y = height / 2;
      let circleColor = color(random(360), 100, 100);
      let startRadius = 10;
      let targetRadius = width * 0.05;
      let growthSpeed = 50;
      let circle = new Circle(x, y, startRadius, circleColor, targetRadius, growthSpeed);
      circle.setSpeed(random(2, 5));
      shapes.push(circle);
      console.log('Circle created!');
    }
    else if (lastWord === 'line') {
      let amplitude = random(15, 400);
      let frequency = random(0.3, 0.8);
      let newLine = new Line(amplitude, frequency, false);
      shapes.push(newLine);
      console.log('Line created!');
    }
    else if (lastWord === 'fast' || lastWord === 'faster') {
      for (let shape of shapes) {
        shape.addSpeed(3);
      }
    }
    else if (lastWord === 'slow' || lastWord === 'go') {
      for (let shape of shapes) {
        shape.setSpeed(2);
      }
    }
    else if (lastWord === 'stop') {
      for (let shape of shapes) {
        shape.setSpeed(0);
      }
    }
    else if (lastWord === 'clean') {
      // Clear all existing shapes
      shapes = [];
      // Create a large white circle that grows very fast
      let x = width / 2;
      let y = height / 2;
      let cleanColor = color(0, 0, 100); // White in HSB
      let startRadius = 10;
      let targetRadius = max(width, height) * 2; // Large enough to cover entire canvas
      let growthSpeed = max(width, height) * 0.1; // Very fast growth
      let cleanCircle = new Circle(x, y, startRadius, cleanColor, targetRadius, growthSpeed, true);
      shapes.push(cleanCircle);
      console.log('Clean circle created!');
    }
    else {
      // Try to get color from API
      const apiColor = await getColorFromWord(lastWord);
      if (apiColor) {
        bgColor = apiColor;
        console.log('BG Color from API:', lastWord);
      } else {
        // Default: change background color based on ASCII
        bgColor = color((lastWordTotal % 360), 100, 100);
        console.log('BG Color from ASCII:', lastWordTotal);
      }
    }
  }
}

function draw() {
  // Use the background color set when a word is completed
  background(bgColor);

  // Update and draw all shapes
  noStroke();
  for (let i = shapes.length - 1; i >= 0; i--) {
    shapes[i].update();
    shapes[i].displayWithWrap();

    // Remove dead shapes
    if (!shapes[i].isAlive()) {
      shapes.splice(i, 1);
    }
  }
}

function calculateAsciiTotal() {
  let text = input.value();

  // Calculate total ASCII for entire text
  asciiTotal = 0;
  for (let i = 0; i < text.length; i++) {
    asciiTotal += text.charCodeAt(i);
  }

  // Check if space or return was just typed
  let spaceTyped = false;
  if (text.length > lastTextLength) {
    let lastChar = text.charAt(text.length - 1);
    if (lastChar === ' ' || lastChar === '\n') {
      spaceTyped = true;
    }
  }

  // Calculate ASCII total for each word
  wordAsciiTotals = [];
  let wordsTemp = text.split(/\s+/);
  words = [];

  for (let word of wordsTemp) {
    if (word.length > 0) {
      words.push(word);
      let wordTotal = 0;
      for (let i = 0; i < word.length; i++) {
        wordTotal += word.charCodeAt(i);
      }
      wordAsciiTotals.push(wordTotal);
    }
  }

  lastTextLength = text.length;

  console.log('Total ASCII:', asciiTotal);

  // Trigger visual effects
  handleVisualEffects(text, spaceTyped);
}

function windowResized() {
  let oldWidth = width;
  let oldHeight = height;

  resizeCanvas(windowWidth, windowHeight);
  input.size(width * 0.4, height - 40);

  for (let shape of shapes) {
    shape.position.x = (shape.position.x / oldWidth) * width;
    shape.position.y = (shape.position.y / oldHeight) * height;
  }
}