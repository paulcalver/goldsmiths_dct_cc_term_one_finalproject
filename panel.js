class Panel {
  constructor(x, y, size, color, cornerRadius) {
    // Store original grid position
    this.gridX = x;
    this.gridY = y;

    // Motion vectors
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);

    // Motion parameters
    this.maxSpeed = 8;
    this.maxForce = 2;
    this.slowRadius = 100;

    // Visual properties
    this.size = size;
    this.color = color;
    this.cornerRadius = cornerRadius;

    // Behavior mode
    this.behaviorMode = 'grid'; // 'grid', 'seek', 'arrive', 'flee', 'wander'
  }

  // Getter for x position (for backwards compatibility)
  get x() {
    return this.pos.x;
  }

  // Getter for y position (for backwards compatibility)
  get y() {
    return this.pos.y;
  }

  // Force-based behaviors
  seek(target, attractionRadius = 80) {
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

  arrive(target, attractionRadius = 800) {
    let force = p5.Vector.sub(target, this.pos);
    let distance = force.mag();

    // If too far away, return zero force (no attraction)
    if (distance > attractionRadius) {
      return createVector(0, 0);
    }

    let desiredSpeed = this.maxSpeed;

    // Slow down when arriving
    if (distance < this.slowRadius) {
      desiredSpeed = map(distance, 0, this.slowRadius, 0, this.maxSpeed);
    }

    force.setMag(desiredSpeed);
    force.sub(this.vel);
    force.limit(this.maxForce);
    return force;
  }

  flee(target) {
    return this.seek(target).mult(-1);
  }

  // Apply a force to the panel
  applyForce(force) {
    this.acc.add(force);
  }

  // Update position based on velocity and acceleration
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
  }

  // Wrap around edges
  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  // Return to grid position
  returnToGrid() {
    let target = createVector(this.gridX, this.gridY);
    let force = this.arrive(target, 1000);
    this.applyForce(force);
  }

  // Set behavior mode
  setBehavior(mode) {
    this.behaviorMode = mode;
  }

  // Execute current behavior
  executeBehavior(target = null) {
    switch (this.behaviorMode) {
      case 'grid':
        this.returnToGrid();
        break;
      case 'seek':
        if (target) {
          let force = this.seek(target);
          this.applyForce(force);
        }
        break;
      case 'arrive':
        if (target) {
          let force = this.arrive(target);
          this.applyForce(force);
        }
        break;
      case 'flee':
        if (target) {
          let force = this.flee(target);
          this.applyForce(force);
        }
        break;
      case 'wander':
        // Random wandering force
        let wanderForce = createVector(random(-1, 1), random(-1, 1));
        wanderForce.setMag(this.maxForce * 0.3);
        this.applyForce(wanderForce);
        break;
    }
  }

  show() {
    fill(this.color);
    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, this.cornerRadius);
    //circle(this.x, this.y, this.size); 

  }
}