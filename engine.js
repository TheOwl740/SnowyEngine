//jshint maxerr: 10000

//CONSTRUCT DOCUMENT
document.body.innerHTML = "<canvas id=\"canvas\"></canvas>" + document.body.innerHTML;
document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";

var e = {
	c: {
		element: document.getElementById("canvas"),
		cx: document.getElementById("canvas").getContext("2d"),
		w: window.innerWidth,
		h: window.innerHeight,
		setDimensions: null,
		rect: null,
		createImage: null,
		image: null,
		arc: null,
		text: null,
		line: null,
		createSprite: null,
		drawSprite: null
	},
	i: {
		mouse: {
			x: 0,
			y: 0,
			clicking: false
		},
		pressedKeys: [
		]
	},
	m: {
		distance: (x1, y1, x2, y2) => {
			return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
		},
		random: (min, max) => {
			return Math.floor((Math.random() * (Math.abs(min - max) + 1)) + min);
		},
		angle: (x1, y1, x2, y2) => {
			return Math.atan2(y1 - y2,  x1 - x2) * 57.2958;
		},
		rotationalX: (angle) => {
			return Math.cos((angle) / 57.2958);
		},
		rotationalY: (angle) => {
			return Math.sin((angle) / 57.2958);
		},
		colliding: (x1, y1, w1, h1, x2, y2, w2, h2) => {
			return (x1 + (w1 / 2) >= x2 - (w2 / 2) && x2 + (w2 / 2) >= x1 - (w1 / 2) && y1 + (h1 / 2) >= y2 - (h2 / 2) && y2 + (h2 / 2) >= y1 - (h1 / 2));
		}
	},
	s: {
		create: (source) => {
			return new Audio(source);
		},
		play: (soundObject) => {
			soundObject.play();
		},
		pause: (soundObject) => {
			soundObject.pause();
		},
		resetTime: (soundObject, time) => {
			soundObject.currentTime = time;
		},
		setVolume: (soundObject, volume) => {
			soundObject.volume = volume / 100;
		}
	},
	t: {
		timerObject: null,
		start: (speed, updateFunction) => {
			timerObject = setInterval(updateFunction, speed);
		},
		stop: () => {
			clearInterval(this.timerObject);
		}
	}
}

//CANVAS FUNCTIONS
e.c.setDimensions = (w, h) => {
	if(w === "full") {
		e.c.element.width = window.innerWidth;
		e.c.w = window.innerWidth;
		e.c.element.height = window.innerHeight;
		e.c.h = window.innerHeight;
	} else {
		e.c.w = w;
		e.c.h = h;
		e.c.element.width = w;
		e.c.element.height = h;
	}
},
e.c.rect = (color, alpha, x, y, w, h, r, xOffset, yOffset, lw, filled) => {
	e.c.cx.beginPath();
	e.c.cx.globalAlpha = alpha;
	e.c.cx.save();
	e.c.cx.translate(x, y);
	e.c.cx.rotate(r * (Math.PI/180));
	e.c.cx.lineWidth = lw;
	if(filled) {
		e.c.cx.fillStyle = color;
		e.c.cx.fillRect(xOffset - (w / 2), yOffset - (h / 2), w, h);
	} else {
		e.c.cx.strokeStyle = color;
		e.c.cx.rect(xOffset - (w / 2), yOffset - (h / 2), w, h)
		e.c.cx.stroke();
	}
	e.c.cx.restore();
},
e.c.createImage = (source) => {
	var rv = new Image();
	rv.src = source;
	return rv;
},
e.c.image = (source, alpha, x, y, w, h, r, xOffset, yOffset, hFlip, vFlip) => {
	e.c.cx.globalAlpha = alpha;
	var fc = {
		x: 1,
		y: 1
	};
	e.c.cx.save();
	if(hFlip) {
		e.c.cx.scale(-1, 1);
		fc.x = -1;
	} else {
		e.c.cx.scale(1, 1);
	}
	if(vFlip) {
		e.c.cx.scale(1, -1);
	fc.y = -1;
	} else {
		e.c.cx.scale(1, 1);
	}
	e.c.cx.translate(x * fc.x, y * fc.y);
	e.c.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
	e.c.cx.drawImage(source, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
	e.c.cx.restore();
},
e.c.arc = (color, alpha, x, y, radius, start, end, lw, filled) => {
	e.c.cx.globalAlpha = alpha;
	e.c.cx.beginPath();
	e.c.cx.lineWidth = lw;
	e.c.cx.arc(x, y, radius, (start / 180) * Math.PI, (end / 180) * Math.PI, false);
	if(filled) {
		e.c.cx.fillStyle = color;
		e.c.cx.fill();
	}	
	e.c.cx.strokeStyle = color;
	e.c.cx.stroke();
},
e.c.text = (color, font, text, alpha, x, y, size, r, xOffset, yOffset) => {
	e.c.cx.save();
	e.c.cx.translate(x, y);
	e.c.cx.rotate(r * (Math.PI/180));
	e.c.cx.globalAlpha = alpha;
	e.c.cx.font = size + "px " + font;
	e.c.cx.fillStyle = color;
	e.c.cx.fillText(text, xOffset, yOffset);
	e.c.cx.restore();	
},
e.c.line = (color, alpha, x1, y1, x2, y2, w) => {
	e.c.cx.globalAlpha = alpha;
	e.c.cx.strokeStyle = color;
	e.c.cx.lineWidth = w;
	e.c.cx.beginPath();
	e.c.cx.moveTo(x1, y1);
	e.c.cx.lineTo(x2, y2);
	e.c.cx.stroke();
},
e.c.createSprite = (source, columns, rows, w, h) => {
	return {
		source: source,
		columns: columns,
		rows: rows,
		w: w,
		h: h
	};
},
e.c.drawSprite = (sprite, alpha, column, row, x, y, w, h, r, xOffset, yOffset, hFlip, vFlip) => {
	e.c.cx.globalAlpha = alpha;
	var image = sprite.source
	e.c.cx.save();
	if(hFlip) {
		e.c.cx.scale(-1, 1);
		fc.x = -1;
	} else {
		e.c.cx.scale(1, 1);
	}
	if(vFlip) {
		e.c.cx.scale(1, -1);
		fc.y = -1;
	} else {
		e.c.cx.scale(1, 1);
	}
	e.c.cx.translate(x * fc.x, y * fc.y);
	e.c.cx.rotate(r * fc.x * fc.y * (Math.PI/180));
	e.c.cx.drawImage(image, column * (sprite.w / sprite.columns), row * (sprite.h / sprite.rows), sprite.w / sprite.columns, sprite.h / sprite.rows, (xOffset * fc.x) - (w / 2), (yOffset * fc.y) - (h / 2), w, h);
	e.c.cx.restore();
}

//ADD EVENT LISTENERS
document.addEventListener("keydown", (eObj) => {
	if(!e.i.pressedKeys.includes(eObj.key)) {
		e.i.pressedKeys.push(eObj.key);
	}
});
document.addEventListener("keyup", (eObj) => {
	e.i.pressedKeys.splice(e.i.pressedKeys.indexOf(eObj.key), 1);
});
document.addEventListener("mousemove", (eObj) => {
	e.i.mouse.x = eObj.clientX;
	e.i.mouse.y = eObj.clientY;
});
document.addEventListener("mousedown", mDown = () => {
	e.i.mouse.clicking = true;
});
document.addEventListener("mouseup", () => {
	e.i.mouse.clicking = false;
});

//SET FULL CANVAS DIMENSIONS
e.c.element.width = window.innerWidth;
e.c.element.height = window.innerHeight;
