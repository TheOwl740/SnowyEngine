//jshint maxerr: 10000

//CONSTRUCT DOCUMENT
document.body.innerHTML = "<canvas id=\"canvas\"></canvas>" + document.body.innerHTML;
document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";

//CLASSES
class Transform {
	constructor(x, y, r) {
		this.x = x;
		this.y = y;
		this.r = r;
	}
}

class FillRenderer {
	constructor(color1, color2, alpha, dir) {
		this.type = "fillRenderer";
		this.color1 = color1;
		this.color2 = color2;
		this.dir = dir;
		this.alpha = alpha;
	}
}

class ImageRenderer {
	constructor(image, alpha, x, y, w, h, hf, vf) {
		this.type = "imageRenderer";
		this.image = image;
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.hf = hf;
		this.vf = vf;
		this.alpha = alpha;
	}
}

class BorderRenderer {
	constructor(color, alpha, lw) {
		this.type = "borderRenderer";
		this.color = color;
		this.lw = lw;
		this.alpha = alpha;
	}
}

class Text {
	constructor(font, text, size) {
		this.type = "text";
		this.text = text;
		this.font = font;
		this.x = x;
		this.y = y;
		this.size = size;
	}
}

class Polygon {
	constructor(tris) {
		this.type = "polygon";
		this.tris = tris;
	}
}

class Tri {
	constructor(points, borders) {
		this.type = "tri";
		this.borders = borders;
		this.points = points;
	}
}

var e = {
	methods: {
		setDimensions: null,
		renderImage: null,
		renderText: null,
		renderPolygon: null,
		calcDistance: null,
		randomNum: null,
		calcAngle: null,
		calcRotationalX: null,
		calcRotationalY: null,
		detectCollision: null,
		clearCanvas: null
	},
	data: {
		w: window.innerWidth,
		h: window.innerHeight,
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
		],
		camera: {
			x: 0,
			y: 0,
			zoom: 1
		}
	}
};

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
e.methods.renderImage = (transform, imageRenderer) => {
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
	e.data.cx.translate(((transform.x - camera.x) / e.data.camera.zoom) * fc.x, ((transform.y - camera.y) / e.data.camera.zoom) * fc.y);
	e.data.cx.rotate(transform.r * fc.x * fc.y * (Math.PI / 180));
	e.data.cx.drawImage(imageRenderer.image, ((imageRenderer.x / e.data.camera.zoom) * fc.x) - ((imageRenderer.w / e.data.camera.zoom) / 2), ((imageRenderer.y / e.data.camera.zoom) * fc.y) - ((imageRenderer.h / e.data.camera.zoom) / 2), imageRenderer.w / e.data.camera.zoom, imageRenderer.h / e.data.camera.zoom);
	e.data.cx.restore();
},
e.methods.renderText = (transform, text, fillRenderer) => {
	e.data.cx.save();
	e.data.cx.translate((transform.x - camera.x) / e.data.camera.zoom, (transform.y - camera.y) / e.data.camera.zoom);
	e.data.cx.rotate(transform.r * (Math.PI / 180));
	e.data.cx.globalAlpha = fillRenderer.alpha;
	e.data.cx.font = (text.size / e.data.camera.zoom) + "px " + text.font;
	e.data.cx.fillStyle = fillRenderer.color1;
	e.data.cx.fillText(text.text, text.x / e.data.camera.zoom, text.y / e.data.camera.zoom);
	e.data.cx.restore();
},
e.methods.renderPolygon = (transform, polygon, fillRenderer, borderRenderer) => {
	e.data.cx.save();
	e.data.cx.translate((transform.x - e.data.camera.x) / e.data.camera.zoom, (transform.y - e.data.camera.y) / e.data.camera.zoom);
	e.data.cx.rotate(transform.r * (Math.PI / 180));
	e.data.cx.beginPath();
	let tri = 0;
	for(tri = 0; tri < polygon.tris.length; tri++) {
		e.data.cx.moveTo(polygon.tris[tri].points[0].x / e.data.camera.zoom, polygon.tris[tri].points[0].y / e.data.camera.zoom);
		let point = 0;
		for(point = 0; point < polygon.tris[tri].borders; point++) {
			if(point === 2) {
				e.data.cx.lineTo(polygon.tris[tri].points[0].x / e.data.camera.zoom, polygon.tris[tri].points[0].y / e.data.camera.zoom);
			} else {
				e.data.cx.lineTo(polygon.tris[tri].points[point + 1].x / e.data.camera.zoom, polygon.tris[tri].points[point + 1].y / e.data.camera.zoom);
			}
		}
	}
	if(fillRenderer !== null) {
		e.data.cx.globalAlpha = fillRenderer.alpha;
		e.data.cx.fillStyle = fillRenderer.color1;
		e.data.cx.fill();
	}
	if(borderRenderer !== null) {
		e.data.cx.globalAlpha = borderRenderer.alpha;
		e.data.cx.lineWidth = borderRenderer.lw / e.data.camera.zoom;
		e.data.cx.strokeStyle = borderRenderer.color;
		e.data.cx.stroke();
	}
	e.data.cx.restore();
};
e.methods.calcDistance = (transform1, transform2) => {
	return Math.sqrt(Math.pow(transform1.x - transform2.x, 2) + Math.pow(transform1.y - transform2.y, 2));
},
e.methods.randomNum = (min, max) => {
	return Math.floor((Math.random() * (Math.abs(min - max) + 1)) + min);
},
e.methods.calcAngle = (transform1, transform2) => {
  if(Math.round(Math.atan2((transform1.y - transform2.y) * -1,  transform1.x - transform2.x) * -57.2958) - 90 < 0) {
    return Math.round(Math.atan2((transform1.y - transform2.y) * -1,  transform1.x - transform2.x) * -57.2958) + 270;
  } else {
  	return Math.round(Math.atan2((transform1.y - transform2.y) * -1,  transform1.x - transform2.x) * -57.2958) - 90;
  }
},
e.methods.calcRotationalX = (angle) => {
	return Math.cos((angle) / 57.2958);
},
e.methods.calcRotationalY = (angle) => {
	return Math.sin((angle) / 57.2958);
},
e.methods.detectCollision = (transform1, polygon1, transform2, polygon2) => {
	if(polygon1 === null) {
		let tri = 0;
		for(tri = 0; tri < polygon2.tris.length; tri++) {
		  let angleTotal = 0;
			let point = 0;
			for(point = 0; point < 3; point++) {
				if(point < 2) {
          if(Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
            if(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) < 180) {
              angleTotal += Math.abs((e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)));
            } else {
              angleTotal += Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - (e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)));
          }
				} else {
          if(Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y))) > 180) {
            if(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) < 180) {
              angleTotal += Math.abs((e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)));
            } else {
              angleTotal += Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - (e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(transform1, new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)));
          }
        }
			}
			if(angleTotal === 360) {
        return true;
		  }
		}
		return false;
	} else {
    let testTri = 0;
    for(testTri = 0; testTri < polygon1.tris.length; testTri++) {
      let testPoint = 0;
      for(testPoint = 0; testPoint < polygon1.tris[testTri].points.length; testPoint++) {
        let tri = 0;
        for(tri = 0; tri < polygon2.tris.length; tri++) {
          let angleTotal = 0;
          let point = 0;
          for(point = 0; point < 3; point++) {
            if(point < 2) {
              if(Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
                if(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - (e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point].x, transform2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[point + 1].x, transform2.y + polygon2.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y))) > 180) {
                if(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - (e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[2].x, transform2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(new Transform(transform1.x + polygon1.tris[testTri].points[testPoint].x, transform1.y + polygon1.tris[testTri].points[testPoint].y), new Transform(transform2.x + polygon2.tris[tri].points[0].x, transform2.y + polygon2.tris[tri].points[0].y)));
              }
            }
          }
          if(angleTotal === 360) {
            return true;
          }
        }
      }
    }
    for(testTri = 0; testTri < polygon2.tris.length; testTri++) {
      let testPoint = 0;
      for(testPoint = 0; testPoint < polygon2.tris[testTri].points.length; testPoint++) {
        let tri = 0;
        for(tri = 0; tri < polygon1.tris.length; tri++) {
          let angleTotal = 0;
          let point = 0;
          for(point = 0; point < 3; point++) {
            if(point < 2) {
              if(Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point].x, transform1.y + polygon1.tris[tri].points[point].y)) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point + 1].x, transform1.y + polygon1.tris[tri].points[point + 1].y))) > 180) {
                if(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point].x, transform1.y + polygon1.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point].x, transform1.y + polygon1.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point + 1].x, transform1.y + polygon1.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point].x, transform1.y + polygon1.tris[tri].points[point].y)) - (e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point + 1].x, transform1.y + polygon1.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point].x, transform1.y + polygon1.tris[tri].points[point].y)) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[point + 1].x, transform1.y + polygon1.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[2].x, transform1.y + polygon1.tris[tri].points[2].y)) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[0].x, transform1.y + polygon1.tris[tri].points[0].y))) > 180) {
                if(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[2].x, transform1.y + polygon1.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[2].x, transform1.y + polygon1.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[0].x, transform1.y + polygon1.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[2].x, transform1.y + polygon1.tris[tri].points[2].y)) - (e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[0].x, transform1.y + polygon1.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[2].x, transform1.y + polygon1.tris[tri].points[2].y)) - e.methods.calcAngle(new Transform(transform2.x + polygon2.tris[testTri].points[testPoint].x, transform2.y + polygon2.tris[testTri].points[testPoint].y), new Transform(transform1.x + polygon1.tris[tri].points[0].x, transform1.y + polygon1.tris[tri].points[0].y)));
              }
            }
          }
          if(angleTotal === 360) {
            return true;
          }
        }
      }
    }
    return false;
	}
};
e.methods.clearCanvas = (fillRenderer) => {
  e.data.cx.fillStyle = fillRenderer.color1;
  e.data.cx.globalAlpha = 1;
  e.data.cx.fillRect(0, 0, e.data.w, e.data.h);
};

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
