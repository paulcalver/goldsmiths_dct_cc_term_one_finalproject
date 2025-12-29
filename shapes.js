class Shape {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.velocity = createVector(random(-1, 1), random(-1, 1));

    // Maximum speed
    this.maxSpeed = 8;

    // Maximum steering force
    this.maxForce = 0.5;

    colorMode(HSB, 360, 100, 100);
    this.color = color(random(360), 100, 100);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  flock(shapes) {
    // Separate into same type and different type
    let sameType = [];
    let differentType = [];

    for (let shape of shapes) {
      if (shape !== this) {
        if (this.isOdd() === shape.isOdd()) {
          sameType.push(shape);
        } else {
          differentType.push(shape);
        }
      }
    }

    // Flock with same type
    let separation = this.separate(sameType);
    let alignment = this.align(sameType);
    let cohesion = this.cohesion(sameType);

    // Avoid different type
    let avoidance = this.avoid(differentType);

    // Weight the forces
    separation.mult(1.5);
    alignment.mult(1.0);
    cohesion.mult(1.0);
    avoidance.mult(2.0);

    // Apply forces
    this.applyForce(separation);
    this.applyForce(alignment);
    this.applyForce(cohesion);
    this.applyForce(avoidance);
  }

  separate(shapes) {
    let desiredSeparation = 25.0;
    let steer = createVector(0, 0);
    let count = 0;

    for (let shape of shapes) {
      let d = p5.Vector.dist(this.position, shape.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, shape.position);
        diff.normalize();
        diff.div(d);
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  align(shapes) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;

    for (let shape of shapes) {
      let d = p5.Vector.dist(this.position, shape.position);
      if (d > 0 && d < neighborDistance) {
        sum.add(shape.velocity);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxSpeed);
      let steer = p5.Vector.sub(sum, this.velocity);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  cohesion(shapes) {
    let neighborDistance = 50;
    let sum = createVector(0, 0);
    let count = 0;

    for (let shape of shapes) {
      let d = p5.Vector.dist(this.position, shape.position);
      if (d > 0 && d < neighborDistance) {
        sum.add(shape.position);
        count++;
      }
    }

    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }
    return createVector(0, 0);
  }

  avoid(shapes) {
    let avoidDistance = 50.0;
    let steer = createVector(0, 0);
    let count = 0;

    for (let shape of shapes) {
      let d = p5.Vector.dist(this.position, shape.position);
      if (d > 0 && d < avoidDistance) {
        let diff = p5.Vector.sub(this.position, shape.position);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
    }

    if (steer.mag() > 0) {
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
    }
    return steer;
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position);
    desired.normalize();
    desired.mult(this.maxSpeed);
    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    return steer;
  }

  update() {
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    // Reset acceleration
    this.acceleration.mult(0);
  }

  display() {
    // To be implemented by subclasses
  }

  isOdd() {
    // To be implemented by subclasses
    return false;
  }

  borders() {
    if (this.position.x < width / 2 - this.size) {
      this.position.x = width + this.size;
    }

    if (this.position.y < -this.size) {
      this.position.y = height + this.size;
    }

    if (this.position.x > width + this.size) {
      this.position.x = width / 2 - this.size;
    }

    if (this.position.y > height + this.size) {
      this.position.y = -this.size;
    }
  }
}

class Circle extends Shape {
  constructor(x, y, radius, customColor) {
    super(x, y);
    this.radius = radius;
    this.size = radius; // For border detection
    // Use custom color if provided, otherwise use parent's random color
    if (customColor) {
      this.color = customColor;
    }
  }

  isOdd() {
    return true; // Circles are created from odd ASCII values
  }

  display() {
    fill(this.color);
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }
}

class Rectangle extends Shape {
  constructor(x, y, width, height, customColor) {
    super(x, y);
    this.width = width;
    this.height = height;
    this.size = max(width, height); // For border detection, use larger dimension
    // Use custom color if provided, otherwise use parent's random color
    if (customColor) {
      this.color = customColor;
    }
  }

  isOdd() {
    return false; // Rectangles are created from even ASCII values
  }

  display() {
    fill(this.color);
    rect(this.position.x, this.position.y, this.width, this.height);
  }
}