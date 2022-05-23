//jshint maxerr: 10000

//CONSTRUCT DOCUMENT
document.body.innerHTML = "<canvas id=\"canvas\"></canvas>" + document.body.innerHTML;
document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";

//CLASSES
class Transform {
	constructor(x, y, w, h, r, xo, yo) {
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.r = r;
		this.xo = xo;
		this.yo = yo;
	}
}

class FillRenderer {
	constructor(color1, color2, alpha, dir, style) {
		this.color1 = color1;
		this.color2 = color2;
		this.style = style;
		this.dir = dir;
		this.alpha = alpha;
	}
}

class ArcRenderer {
	constructor(radius, start, end) {
		this.radius = radius;
		this.start = start;
		this.end = end;
	}
}

class BorderRenderer {
	constructor(color, alpha, lw) {
		this.color = color;
		this.lw = lw;
		this.alpha = alpha;
	}
}

class ImageRenderer {
	constructor(image, alpha, hf, vf) {
		this.image = image;
		this.hf = hf;
		this.vf = vf;
		this.alpha = alpha;
	}
}

class Text {
	constructor(font, text, size) {
		this.font = font;
		this.content = content;
		this.size = size;
	}
}

class PolygonRenderer {
	constructor(points) {
		this.points = points;
	}
}

var e = {
	methods: {
		setDimensions: null,
		rect: null,
		image: null,
		arc: null,
		text: null,
		polygon: null,
		distance: null,
		random: null,
		angle: null,
		rotationalX: null,
		rotationalY: null,
		colliding: null
	},
	data: {
		w: 0,
		h: 0,
		element: document.getElementById("canvas"),
		cx: document.getElementById("canvas").getContext("2d"),
		cw: window.innerWidth,
		ch: window.innerHeight,
		mouse: {
			x: 0,
			y: 0,
			clicking: false
		},
		pressedKeys: [
		]
	}
}

//FUNCTIONS
e.methods.setDimensions = (w, h) => {
	if(w === "full") {
		e.data.element.width = window.innerWidth;
		e.data.w = window.innerWidth;
		e.data.element.height = window.innerHeight;
		e.data.h = window.innerHeight;
	} else {
		e.data.w = w;
		e.data.h = h;
		e.data.element.width = w;
		e.data.element.height = h;
	}
},
e.methods.rect = (transform, fillRenderer, borderRenderer) => {
	e.data.cx.beginPath();
	e.data.cx.save();
	e.data.cx.translate(transform.x, transform.y);
	e.data.cx.rotate(transform.r * (Math.PI / 180));
	if(fillRenderer !== null) {
		e.data.cx.globalAlpha = fillRenderer.alpha;
		e.data.cx.fillStyle = fillRenderer.color1;
		e.data.cx.fillRect(transform.xo - (transform.w / 2), transform.yo - (transform.h / 2), transform.w, transform.h);
	}
	if(borderRenderer !== null) {
		e.data.cx.lineWidth = borderRenderer.lw;
		e.data.cx.globalAlpha = borderRenderer.alpha;
		e.data.cx.strokeStyle = borderRenderer.color;
		e.data.cx.beginPath();
		e.data.cx.rect(transform.xo - (transform.w / 2), transform.yo - (transform.h / 2), transform.w, transform.h)
		e.data.cx.stroke();
	}
	e.data.cx.restore();
},
e.methods.image = (transform, imageRenderer, borderRenderer) => {
	var fc = {
		x: 1,
		y: 1
	};
	e.data.cx.save();
	if(imageRenderer.hf) {
		e.data.cx.scale(-1, 1);
		fc.x = -1;
	} else {
		e.data.cx.scale(1, 1);
	}
	if(imageRenderer.vf) {
		e.data.cx.scale(1, -1);
		fc.y = -1;
	} else {
		e.data.cx.scale(1, 1);
	}
	e.data.cx.globalAlpha = imageRenderer.alpha;
	e.data.cx.translate(transform.x * fc.x, transform.y * fc.y);
	e.data.cx.rotate(transform.r * fc.x * fc.y * (Math.PI / 180));
	e.data.cx.drawImage(imageRenderer.image, (transform.xo * fc.x) - (transform.w / 2), (transform.yo * fc.y) - (transform.h / 2), transform.w, transform.h);
	if(borderRenderer !== null) {
		e.data.cx.globalAlpha = borderRenderer.alpha;
		e.data.cx.strokeStyle = borderRenderer.color;
		e.data.cx.beginPath();
		e.data.cx.rect(transform.xo - (transform.w / 2), transform.yo - (transform.h / 2), transform.w, transform.h)
		e.data.cx.stroke();
	}
	e.data.cx.restore();
},
e.methods.arc = (transform, arcRenderer, fillRenderer, borderRenderer) => {
	e.data.cx.beginPath();
	e.data.cx.arc(transform.x, transform.y, arcRenderer.radius, (arcRenderer.start / 180) * Math.PI, (arcRenderer.end / 180) * Math.PI, false);
	if(fillRenderer !== null) {
		e.data.cx.globalAlpha = alpha;
		e.data.cx.fillStyle = color;
		e.data.cx.fill();
	}
	if(borderRenderer !== null) {
		e.data.cx.lineWidth = borderRenderer.lw;
		e.data.cx.strokeStyle = borderRenderer.color;
		e.data.cx.stroke();
	}
},
e.methods.text = (transform, text, fillRenderer) => {
	e.data.cx.save();
	e.data.cx.translate(transform.x, transform.y);
	e.data.cx.rotate(transform.r * (Math.PI / 180));
	e.data.cx.globalAlpha = fillRenderer.alpha;
	e.data.cx.font = text.size + "px " + text.font;
	e.data.cx.fillStyle = fillRenderer.color1;
	e.data.cx.fillText(text.content, transform.xo, transform.yo);
	e.data.cx.restore();
},
e.methods.polygon = (transform, polygonRenderer, fillRenderer, borderRenderer) => {
	e.data.cx.save();
	e.data.cx.translate(transform.x, transform.y);
	e.data.cx.rotate(transform.r * (Math.PI / 180));
	e.data.cx.beginPath();
	e.data.cx.moveTo(polygonRenderer.points[0].x, polygonRenderer.points[0].y)
	var point = 0;
	for(point = 1; point < polygonRenderer.points.length; point++) {
		e.data.cx.lineTo(polygonRenderer.points[point].x, polygonRenderer.points[point].y)
	}
	if(fillRenderer !== null) {
		e.data.cx.globalAlpha = fillRenderer.alpha;
		e.data.cx.fillStyle = fillRenderer.color1;
		e.data.cx.fill()
	}
	if(borderRenderer !== null) {
		e.data.cx.globalAlpha = borderRenderer.alpha;
		e.data.cx.lineWidth = borderRenderer.lw;
		e.data.cx.strokeStyle = borderRenderer.color;
		e.data.cx.stroke();
	}
	e.data.cx.restore();
}
e.methods.distance = (transform1, transform2) => {
	return Math.sqrt(Math.pow(transform1.x - transform2.x, 2) + Math.pow(transform1.y - transform2.y, 2));
},
e.methods.random = (min, max) => {
	return Math.floor((Math.random() * (Math.abs(min - max) + 1)) + min);
},
e.methods.angle = (x1, y1, x2, y2) => {
	return Math.atan2(y1 - y2,  x1 - x2) * 57.2958;
},
e.methods.rotationalX = (angle) => {
	return Math.cos((angle) / 57.2958);
},
e.methods.rotationalY = (angle) => {
	return Math.sin((angle) / 57.2958);
},
e.methods.colliding = (transform1, transform2) => {
	return (transform1.x + (transform1.w / 2) >= transform2.x - (transform2.w / 2) && transform2.x + (transform2.w / 2) >= transform1.x - (transform1.w / 2) && transform1.y + (transform1.h / 2) >= transform1.y - (transform2.h / 2) && transform2.y + (transform2.h / 2) >= transform1.y - (transform1.h / 2));
}

//ADD EVENT LISTENERS
document.addEventListener("keydown", (eObj) => {
	if(!e.data.pressedKeys.includes(eObj.key)) {
		e.data.pressedKeys.push(eObj.key);
	}
});
document.addEventListener("keyup", (eObj) => {
	e.data.pressedKeys.splice(e.data.pressedKeys.indexOf(eObj.key), 1);
});
document.addEventListener("mousemove", (eObj) => {
	e.data.mouse.x = eObj.clientX;
	e.data.mouse.y = eObj.clientY;
});
document.addEventListener("mousedown", () => {
	e.data.mouse.clicking = true;
});
document.addEventListener("mouseup", () => {
	e.data.mouse.clicking = false;
});

//SET FULL CANVAS DIMENSIONS
e.data.element.width = window.innerWidth;
e.data.element.height = window.innerHeight;
