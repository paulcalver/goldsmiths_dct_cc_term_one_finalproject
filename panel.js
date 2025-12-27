class Panel {
  constructor(x, y, size, color, cornerRadius) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.cornerRadius = cornerRadius;
  }

  show() {
    fill(this.color);
    rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size, this.cornerRadius);
  }
}