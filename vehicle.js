

class Word {
  constructor(x, y, text) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxSpeed = random(1, 5);  // Random speed between 1 and 5
    this.maxForce = 0.4;
    this.r = 20;
    this.textSize = 18;    this.lineHeight = 1; // Line height multiplier (1.3 = 130% of text size)    this.text = text;  // Store the word to display
    this.maxTextWidth = 150; // Maximum width before wrapping
    this.wrappedLines = this.wrapText(text);

  }
  
  // Split long text into multiple lines
  wrapText(txt) {
    let words = txt.split(' ');
    let lines = [];
    let currentLine = '';
    
    textSize(this.textSize);
    
    for (let word of words) {
      let testLine = currentLine + (currentLine ? ' ' : '') + word;
      let testWidth = textWidth(testLine);
      
      if (testWidth > this.maxTextWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.length > 0 ? lines : [txt];
  }


  flee(target) {
    return this.seek(target).mult(-1);
  }

  arrive(target, attractionRadius = 200) {
    let force = p5.Vector.sub(target, this.pos);
    let distance = force.mag();
    
    // If too far away, return zero force (no attraction)
    if (distance > attractionRadius) {
      return createVector(0, 0);
    }
    
    let desiredSpeed = this.maxSpeed;
    
    // Slow down when arriving (within 100 pixels)
    let slowRadius = 100;
    if (distance < slowRadius) {
      desiredSpeed = map(distance, 0, slowRadius, 0, this.maxSpeed);
    }
    
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  seek(target, attractionRadius = 200) {
    let force = p5.Vector.sub(target, this.pos);
    let distance = force.mag();
    
    // If too far away, return zero force (no attraction)
    if (distance > attractionRadius) {
      return createVector(0, 0);
    }
    
    let desiredSpeed = this.maxSpeed;
    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

    edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    textAlign(CENTER, CENTER);
    textSize(this.textSize);
    push();
    translate(this.pos.x, this.pos.y);
    
    // Only rotate if moving fast enough
    // When words cluster and slow down, they straighten out
    let speed = this.vel.mag();
    if (speed > 1) {
      rotate(this.vel.heading());
    }
    
    // Draw multi-line text
    let lineSpacing = this.textSize * this.lineHeight;
    let startY = -(this.wrappedLines.length - 1) * lineSpacing / 2;
    
    for (let i = 0; i < this.wrappedLines.length; i++) {
      text(this.wrappedLines[i], 0, startY + i * lineSpacing);
    }
    
    pop();
  }

}