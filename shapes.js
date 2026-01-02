class Shape {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.speed = 0;
    colorMode(HSB, 360, 100, 100, 255);
    this.color = color(random(360), 100, 100);
    // this.lifespan = 255; // Start fully opaque
    // this.fadeRate = 255 / (100 * 60); // Fade over 10 seconds (assuming 60fps)
  }

  setSpeed(speed) {
    this.speed = speed;
    if (speed > 0) {
      this.velocity = p5.Vector.random2D().mult(speed);
    } else {
      this.velocity.mult(0);
    }
  }

  addSpeed(speedIncrease) {
    if (this.speed === 0) {
      // If not moving, start with random direction
      this.velocity = p5.Vector.random2D().mult(speedIncrease);
      this.speed = speedIncrease;
    } else {
      // If already moving, increase speed in current direction
      this.speed += speedIncrease;
      this.velocity.setMag(this.speed);
    }
  }

  update() {
    this.position.add(this.velocity);
    this.edges();
    // this.lifespan -= this.fadeRate;
    // To be implemented by subclasses
  }

  isAlive() {
    // return this.lifespan > 0;
    return true;
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }

    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  display() {
    // To be implemented by subclasses
  }

  // Check if shape needs to wrap and draw at wrapped positions
  displayWithWrap() {
    let size = this.getSize ? this.getSize() : 100; // Get shape size for wrapping

    // Draw main shape
    this.display();

    // Draw wrapped versions when near edges
    if (this.position.x - size < 0) {
      // Near left edge, draw on right
      push();
      translate(width, 0);
      this.display();
      pop();
    } else if (this.position.x + size > width) {
      // Near right edge, draw on left
      push();
      translate(-width, 0);
      this.display();
      pop();
    }

    if (this.position.y - size < 0) {
      // Near top edge, draw on bottom
      push();
      translate(0, height);
      this.display();
      pop();
    } else if (this.position.y + size > height) {
      // Near bottom edge, draw on top
      push();
      translate(0, -height);
      this.display();
      pop();
    }

    // Handle corners (shape wrapping both horizontally and vertically)
    if ((this.position.x - size < 0 || this.position.x + size > width) &&
        (this.position.y - size < 0 || this.position.y + size > height)) {
      let xOffset = this.position.x - size < 0 ? width : -width;
      let yOffset = this.position.y - size < 0 ? height : -height;
      push();
      translate(xOffset, yOffset);
      this.display();
      pop();
    }
  }
}

class Circle extends Shape {
  constructor(x, y, radius, customColor, targetRadius = null, growthSpeed = 20, autoRemove = false) {
    super(x, y);
    this.radius = radius;
    this.targetRadius = targetRadius;
    this.growthSpeed = growthSpeed;
    this.isGrowing = targetRadius !== null;
    this.autoRemove = autoRemove;
    if (customColor) {
      this.color = customColor;
    }
  }

  getSize() {
    return this.radius;
  }

  update() {
    if (this.isGrowing && this.radius < this.targetRadius) {
      this.radius += this.growthSpeed;
      if (this.radius >= this.targetRadius) {
        this.radius = this.targetRadius;
        this.isGrowing = false;
      }
    }
    // Call parent update for movement
    super.update();
  }

  isAlive() {
    // If autoRemove is true, remove after growth is complete
    if (this.autoRemove && !this.isGrowing) {
      return false;
    }
    return super.isAlive();
  }

  display() {
    // let c = color(hue(this.color), saturation(this.color), brightness(this.color), this.lifespan);
    // fill(c);
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }
}

class Line {
  constructor(amplitude = 20, frequency = 0.05, isHorizontal = true) {
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.timeOffset = random(1000);
    this.isHorizontal = isHorizontal;
    this.position = random(isHorizontal ? height : width);
    this.points = 200;
    this.strokeWeight = 80;
    this.oscillationSpeed = random(0.01, 0.02);
    this.baseOscillationSpeed = this.oscillationSpeed;
    colorMode(HSB, 360, 100, 100, 255);
    this.color = color(random(360), 100, 100);
    // this.lifespan = 255;
    // this.fadeRate = 255 / (100 * 60);
  }

  setSpeed(speed) {
    // For lines, speed affects oscillation
    this.oscillationSpeed = speed * 0.01;
  }

  addSpeed(speedIncrease) {
    // Increase oscillation speed
    this.oscillationSpeed += speedIncrease * 0.01;
  }

  update() {
    this.timeOffset += this.oscillationSpeed;
    // this.lifespan -= this.fadeRate;
  }

  isAlive() {
    // return this.lifespan > 0;
    return true;
  }

  display() {
    push();

    // let c = color(hue(this.color), saturation(this.color), brightness(this.color), this.lifespan);
    // stroke(c);
    stroke(this.color);
    strokeWeight(this.strokeWeight);
    noFill();

    let extension = 100; // Extend lines beyond canvas

    beginShape();
    if (this.isHorizontal) {
      // Horizontal line across the width (extended)
      for (let i = 0; i < this.points; i++) {
        let x = map(i, 0, this.points - 1, -extension, width + extension);
        let phase = (x / width) * this.frequency * TWO_PI;
        let offset = sin(this.timeOffset + phase) * this.amplitude;
        let y = this.position + offset;
        curveVertex(x, y);
      }
    } else {
      // Vertical line across the height (extended)
      for (let i = 0; i < this.points; i++) {
        let y = map(i, 0, this.points - 1, -extension, height + extension);
        let phase = (y / height) * this.frequency * TWO_PI;
        let offset = sin(this.timeOffset + phase) * this.amplitude;
        let x = this.position + offset;
        curveVertex(x, y);
      }
    }
    endShape();

    pop();
  }

  displayWithWrap() {
    this.display();
  }
}

