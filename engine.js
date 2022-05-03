//jshint maxerr: 10000
class canvasModule {
	initialise() {
		document.body.innerHTML = "<canvas id=\"canvas\"></canvas>" + document.body.innerHTML;
		document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";
		canvas.element = document.getElementById("canvas");
		canvas.cx = canvas.element.getContext("2d");
		canvas.element.width = window.innerWidth;
		canvas.w = window.innerWidth;
		canvas.element.height = JSON.parse(JSON.stringify(window.innerHeight));
		canvas.h = window.innerHeight;
  }
  setDimensions(w, h) {
  	if(w === "full") {
   	  canvas.element.width = window.innerWidth;
      canvas.w = window.innerWidth;
      canvas.element.height = window.innerHeight;
      canvas.h = window.innerHeight;
    } else {
      canvas.w = w;
      canvas.h = h;
      canvas.element.width = w;
      canvas.element.height = h;
    }
  }
  rect(color, alpha, x, y, w, h, r, xOffset, yOffset, lw, filled) {
    canvas.cx.beginPath();
    canvas.cx.globalAlpha = alpha;
    canvas.cx.save();
    canvas.cx.translate(x, y);
    canvas.cx.rotate(r * (Math.PI/180));
    canvas.cx.lineWidth = lw;
    if(filled) {
      canvas.cx.fillStyle = color;
      canvas.cx.fillRect(xOffset - (w / 2), yOffset - (h / 2), w, h);
    } else {
      canvas.cx.strokeStyle = color;
      canvas.cx.rect(xOffset - (w / 2), yOffset - (h / 2), w, h)
      canvas.cx.stroke();
    }
    canvas.cx.restore();
  }
  createImage(source) {
    var rv = new Image();
    rv.src = source;
    return rv;
  }
  image(source, alpha, x, y, w, h, r, xOffset, yOffset, hFlip, vFlip) {
    canvas.cx.globalAlpha = alpha;
    var fc = {
      x: 1,
      y: 1
    };
    canvas.cx.save();
    if(hFlip) {
      canvas.cx.scale(-1, 1);
      fc.x = -1;
    } else {
      canvas.cx.scale(1, 1);
    }
    if(vFlip) {
      canvas.cx.scale(1, -1);
      fc.y = -1;
    } else {
      canvas.cx.scale(1, 1);
    }
    canvas.cx.translate(x * fc.x, y * fc.y);
    canvas.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
    canvas.cx.drawImage(source, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
    canvas.cx.restore();
  }
  arc(color, alpha, x, y, radius, start, end, lw, filled) {
  	canvas.cx.globalAlpha = alpha;
  	canvas.cx.beginPath();
  	canvas.cx.lineWidth = lw;
  	canvas.cx.arc(x, y, radius, (start / 50) * Math.PI, (end / 50) * Math.PI, false);
  	if(filled) {
  		canvas.cx.fillStyle = color;
  		canvas.cx.fill();
  	}
  	canvas.cx.strokeStyle = color;
  	canvas.cx.stroke();
	}
  text(color, font, text, alpha, x, y, size, r, xOffset, yOffset) {
    canvas.cx.save();
    canvas.cx.translate(x, y);
    canvas.cx.rotate(r * (Math.PI/180));
    canvas.cx.globalAlpha = alpha;
    canvas.cx.font = size + "px " + font;
    canvas.cx.fillStyle = color;
    canvas.cx.fillText(text, xOffset, yOffset);
    canvas.cx.restore();
  }
  line(color, alpha, x1, y1, x2, y2, w) {
    canvas.cx.globalAlpha = alpha;
    canvas.cx.strokeStyle = color;
    canvas.cx.lineWidth = w;
    canvas.cx.beginPath();
    canvas.cx.moveTo(x1, y1);
    canvas.cx.lineTo(x2, y2);
    canvas.cx.stroke();
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
    canvas.cx.globalAlpha = alpha;
    var image = sprite.source
    canvas.cx.save();
    if(hFlip) {
      canvas.cx.scale(-1, 1);
      fc.x = -1;
    } else {
      canvas.cx.scale(1, 1);
    }
    if(vFlip) {
      canvas.cx.scale(1, -1);
      fc.y = -1;
    } else {
      canvas.cx.scale(1, 1);
    }
    canvas.cx.translate(x * fc.x, y * fc.y);
    canvas.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
    canvas.cx.drawImage(image, column * (sprite.w / sprite.columns), row * (sprite.h / sprite.rows), sprite.w / sprite.columns, sprite.h / sprite.rows, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
    canvas.cx.restore();
  }
}
