//jshint maxerr: 10000
class canvasModule {
	constructor() {
		document.body.innerHTML = "<canvas id=\"canvas\"></canvas>" + document.body.innerHTML;
		document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";
		this.element = document.getElementById("canvas");
		this.cx = this.element.getContext("2d");
		this.element.width = JSON.parse(JSON.stringify(window.innerWidth));
		this.w = window.innerWidth;
		this.element.height = JSON.parse(JSON.stringify(window.innerHeight));
		this.h = window.innerHeight;
	}
  setDimensions(w, h) {
  	if(w === "full") {
   	  this.element.width = window.innerWidth;
      this.w = window.innerWidth;
      this.element.height = window.innerHeight;
      this.h = window.innerHeight;
    } else {
      this.w = w;
      this.h = h;
      this.element.width = w;
      this.element.height = h;
    }
  }
  rect(color, alpha, x, y, w, h, r, xOffset, yOffset, lw, filled) {
    this.cx.beginPath();
    this.cx.globalAlpha = alpha;
    this.cx.save();
    this.cx.translate(x, y);
    this.cx.rotate(r * (Math.PI/180));
    this.cx.lineWidth = lw;
    if(filled) {
      this.cx.fillStyle = color;
      this.cx.fillRect(xOffset - (w / 2), yOffset - (h / 2), w, h);
    } else {
      this.cx.strokeStyle = color;
      this.cx.rect(xOffset - (w / 2), yOffset - (h / 2), w, h)
      this.cx.stroke();
    }
    this.cx.restore();
  }
  createImage(source) {
    var rv = new Image();
    rv.src = source;
    return rv;
  }
  image(source, alpha, x, y, w, h, r, xOffset, yOffset, hFlip, vFlip) {
    this.cx.globalAlpha = alpha;
    var fc = {
      x: 1,
      y: 1
    };
    this.cx.save();
    if(hFlip) {
      this.cx.scale(-1, 1);
      fc.x = -1;
    } else {
      this.cx.scale(1, 1);
    }
    if(vFlip) {
      this.cx.scale(1, -1);
      fc.y = -1;
    } else {
      this.cx.scale(1, 1);
    }
    this.cx.translate(x * fc.x, y * fc.y);
    this.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
    this.cx.drawImage(source, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
    this.cx.restore();
  }
  arc(color, alpha, x, y, radius, start, end, lw, filled) {
  	this.cx.globalAlpha = alpha;
  	this.cx.beginPath();
  	this.cx.lineWidth = lw;
  	this.cx.arc(x, y, radius, (start / 50) * Math.PI, (end / 50) * Math.PI, false);
  	if(filled) {
  		this.cx.fillStyle = color;
  		this.cx.fill();
  	}
  	this.cx.strokeStyle = color;
  	this.cx.stroke();
	}
  text(color, font, text, alpha, x, y, size, r, xOffset, yOffset) {
    this.cx.save();
    this.cx.translate(x, y);
    this.cx.rotate(r * (Math.PI/180));
    this.cx.globalAlpha = alpha;
    this.cx.font = size + "px " + font;
    this.cx.fillStyle = color;
    this.cx.fillText(text, xOffset, yOffset);
    this.cx.restore();
  }
  line(color, alpha, x1, y1, x2, y2, w) {
    this.cx.globalAlpha = alpha;
    this.cx.strokeStyle = color;
    this.cx.lineWidth = w;
    this.cx.beginPath();
    this.cx.moveTo(x1, y1);
    this.cx.lineTo(x2, y2);
    this.cx.stroke();
  }
  createSprite (source, columns, rows, w, h) {
    return {
      source: source,
      columns: columns,
      rows: rows,
      w: w,
      h: h
    };
  }
  drawSprite(sprite, alpha, column, row, x, y, w, h, r, xOffset, yOffset) {
    this.cx.globalAlpha = alpha;
    var image = sprite.source
    this.cx.save();
    if(hFlip) {
      this.cx.scale(-1, 1);
      fc.x = -1;
    } else {
      this.cx.scale(1, 1);
    }
    if(vFlip) {
      this.cx.scale(1, -1);
      fc.y = -1;
    } else {
      this.cx.scale(1, 1);
    }
    this.cx.translate(x * fc.x, y * fc.y);
    this.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
    this.cx.drawImage(image, column * (sprite.w / sprite.columns), row * (sprite.h / sprite.rows), sprite.w / sprite.columns, sprite.h / sprite.rows, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
    this.cx.restore();
  }
}
