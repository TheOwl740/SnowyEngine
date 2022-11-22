//jshint maxerr: 10000

//CONSTRUCT DOCUMENT
document.body.innerHTML = "<canvas id=\"canvas\" style=\"border: 1px solid black\"></canvas>" + document.body.innerHTML;
document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";

//CLASSES
class Transform {
	constructor(x, y, r) {
	  this.type = "transform";
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
	constructor(image, alpha, x, y, w, h, hf, vf, cameraStatic, useCulling) {
		this.type = "imageRenderer";
		this.useCulling = useCulling;
		this.cameraStatic = cameraStatic;
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
	constructor(font, text, size, x, y, cameraStatic, useCulling) {
		this.type = "text";
		this.useCulling = useCulling;
		this.cameraStatic = cameraStatic;
		this.text = text;
		this.font = font;
		this.x = x;
		this.y = y;
		this.size = size;
	}
}

class Polygon {
	constructor(tris, cameraStatic) {
		this.type = "polygon";
		this.cameraStatic = cameraStatic;
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
		addTransfom: null,
		roundTransform: null,
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
			absolute: new Transform(0, 0, 0),
			dynamic: new Transform(0, 0, 0),
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
  if(imageRenderer.cameraStatic) {
    if(!imageRenderer.useCulling || (transform.x + (imageRenderer.w / 2) >= 0 && transform.x - (imageRenderer.w / 2) <= e.data.w && transform.y - (imageRenderer.h / 2) <= 0 && transform.y + (imageRenderer.h / 2) >= e.data.h * -1)) {
      let fc = {
      	x: 1,
      	y: -1
      };
      e.data.cx.save();
      if(imageRenderer.hf) {
      	e.data.cx.scale(-1, 1);
      	fc.x = -1;
      } else {
      	e.data.cx.scale(1, 1);
      }
      if(imageRenderer.vf) {
      	e.data.cx.scale(1, 1);
      	fc.y = 1;
      } else {
      	e.data.cx.scale(1, -1);
      }
      e.data.cx.globalAlpha = imageRenderer.alpha;
      e.data.cx.translate(transform.x * fc.x, transform.y * fc.y);
      e.data.cx.rotate(transform.r * fc.x * fc.y * (Math.PI / 180));
      e.data.cx.drawImage(imageRenderer.image, (imageRenderer.x * fc.x) - (imageRenderer.w / 2), (imageRenderer.y * fc.y) - (imageRenderer.h / 2), imageRenderer.w, imageRenderer.h);
      e.data.cx.restore();
    }
  } else {
    if(!imageRenderer.useCulling || (transform.x + (imageRenderer.w / 2) >= e.data.camera.x && e.data.camera.x + (e.data.w * e.data.camera.zoom) >= transform.x - (imageRenderer.w / 2) && transform.y - (imageRenderer.h / 2) <= e.data.camera.y && e.data.camera.y - (e.data.h * e.data.camera.zoom) <= transform.y + (imageRenderer.h / 2))) {
      let fc = {
      	x: 1,
      	y: -1
      };
      e.data.cx.save();
      if(imageRenderer.hf) {
      	e.data.cx.scale(-1, 1);
      	fc.x = -1;
      } else {
      	e.data.cx.scale(1, 1);
      }
      if(imageRenderer.vf) {
      	e.data.cx.scale(1, 1);
      	fc.y = 1;
      } else {
      	e.data.cx.scale(1, -1);
      }
      e.data.cx.globalAlpha = imageRenderer.alpha;
      e.data.cx.translate(((transform.x - e.data.camera.x) / e.data.camera.zoom) * fc.x, ((transform.y - e.data.camera.y) / e.data.camera.zoom) * fc.y);
      e.data.cx.rotate(transform.r * fc.x * fc.y * (Math.PI / 180));
      e.data.cx.drawImage(imageRenderer.image, ((imageRenderer.x / e.data.camera.zoom) * fc.x) - ((imageRenderer.w / e.data.camera.zoom) / 2), ((imageRenderer.y / e.data.camera.zoom) * fc.y) - ((imageRenderer.h / e.data.camera.zoom) / 2), imageRenderer.w / e.data.camera.zoom, imageRenderer.h / e.data.camera.zoom);
      e.data.cx.restore();
    }
  }
},
e.methods.renderText = (transform, text, fillRenderer) => {
  if(text.cameraStatic) {
    if(!text.useCulling || (transform.x + (text.text.length * text.size) >= 0 && e.data.w >= transform.x && transform.y <= 0 && e.data.h * -1 <= transform.y + (text.size * 2))) {
      e.data.cx.save();
      e.data.cx.scale(1, -1);
      e.data.cx.translate(transform.x, transform.y * -1);
      e.data.cx.rotate(transform.r * (Math.PI / 180));
      e.data.cx.globalAlpha = fillRenderer.alpha;
      e.data.cx.font = text.size + "px " + text.font;
      e.data.cx.fillStyle = fillRenderer.color1;
      e.data.cx.fillText(text.text, text.x, text.y);
      e.data.cx.restore();
    }
  } else {
    if(!text.useCulling || (transform.x + (text.text.length * text.size) >= e.data.camera.x && e.data.camera.x + (e.data.w * e.data.camera.zoom) >= transform.x && transform.y <= e.data.camera.y && e.data.camera.y - (e.data.h * e.data.camera.zoom) <= transform.y - (text.size * 2))) {
      e.data.cx.save();
      e.data.cx.scale(1, -1);
      e.data.cx.translate((transform.x - e.data.camera.x) / e.data.camera.zoom, ((transform.y - e.data.camera.y) / e.data.camera.zoom) * -1);
      e.data.cx.rotate(transform.r * (Math.PI / 180));
      e.data.cx.globalAlpha = fillRenderer.alpha;
      e.data.cx.font = (text.size / e.data.camera.zoom) + "px " + text.font;
      e.data.cx.fillStyle = fillRenderer.color1;
      e.data.cx.fillText(text.text, text.x / e.data.camera.zoom, text.y / e.data.camera.zoom);
      e.data.cx.restore();
    }
  }
},
e.methods.renderPolygon = (transform, polygon, fillRenderer, borderRenderer) => {
  if(polygon.cameraStatic) {
    e.data.cx.save();
    e.data.cx.translate(transform.x, transform.y);
    e.data.cx.rotate(transform.r * (Math.PI / 180));
    let tri = 0;
    for(tri = 0; tri < polygon.tris.length; tri++) {
      e.data.cx.beginPath();
      e.data.cx.moveTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
      let point = 0;
      for(point = 0; point < polygon.tris[tri].borders; point++) {
        if(point === 2) {
          e.data.cx.lineTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
        } else {
          e.data.cx.lineTo(polygon.tris[tri].points[point + 1].x, polygon.tris[tri].points[point + 1].y);
        }
        if(borderRenderer !== null) {
          e.data.cx.globalAlpha = borderRenderer.alpha;
          e.data.cx.lineWidth = borderRenderer.lw;
          e.data.cx.strokeStyle = borderRenderer.color;
          e.data.cx.stroke();
        } else {
          e.data.cx.globalAlpha = 0;
          e.data.cx.lineWidth = 0;
          e.data.cx.stroke();
        }
      }
      e.data.cx.beginPath();
      for(point = 0; point < 3; point++) {
        if(point === 2) {
          e.data.cx.lineTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
        } else {
          e.data.cx.lineTo(polygon.tris[tri].points[point + 1].x, polygon.tris[tri].points[point + 1].y);
        }
        e.data.cx.globalAlpha = 0;
        e.data.cx.lineWidth = 0;
        e.data.cx.stroke();
      }
      if(fillRenderer !== null) {
        e.data.cx.globalAlpha = fillRenderer.alpha;
        e.data.cx.fillStyle = fillRenderer.color1;
        e.data.cx.fill();
      }
    }
    e.data.cx.restore();
  } else {
    e.data.cx.save();
    e.data.cx.translate((transform.x - e.data.camera.x) / e.data.camera.zoom, (transform.y - e.data.camera.y) / e.data.camera.zoom);
    e.data.cx.rotate(transform.r * (Math.PI / 180));
    let tri = 0;
    for(tri = 0; tri < polygon.tris.length; tri++) {
      e.data.cx.beginPath();
      e.data.cx.moveTo(polygon.tris[tri].points[0].x / e.data.camera.zoom, polygon.tris[tri].points[0].y / e.data.camera.zoom);
      let point = 0;
      for(point = 0; point < polygon.tris[tri].borders; point++) {
        if(point === 2) {
          e.data.cx.lineTo(polygon.tris[tri].points[0].x / e.data.camera.zoom, polygon.tris[tri].points[0].y / e.data.camera.zoom);
        } else {
          e.data.cx.lineTo(polygon.tris[tri].points[point + 1].x / e.data.camera.zoom, polygon.tris[tri].points[point + 1].y / e.data.camera.zoom);
        }
        if(borderRenderer !== null) {
          e.data.cx.globalAlpha = borderRenderer.alpha;
          e.data.cx.lineWidth = borderRenderer.lw / e.data.camera.zoom;
          e.data.cx.strokeStyle = borderRenderer.color;
          e.data.cx.stroke();
        } else {
          e.data.cx.globalAlpha = 0;
          e.data.cx.lineWidth = 0;
          e.data.cx.stroke();
        }
      }
      e.data.cx.beginPath();
      for(point = 0; point < 3; point++) {
        if(point === 2) {
          e.data.cx.lineTo(polygon.tris[tri].points[0].x / e.data.camera.zoom, polygon.tris[tri].points[0].y / e.data.camera.zoom);
        } else {
          e.data.cx.lineTo(polygon.tris[tri].points[point + 1].x / e.data.camera.zoom, polygon.tris[tri].points[point + 1].y / e.data.camera.zoom);
        }
        e.data.cx.globalAlpha = 0;
        e.data.cx.lineWidth = 0;
        e.data.cx.stroke();
      }
      if(fillRenderer !== null) {
        e.data.cx.globalAlpha = fillRenderer.alpha;
        e.data.cx.fillStyle = fillRenderer.color1;
        e.data.cx.fill();
      }
    }
    e.data.cx.restore();
  }
};
e.methods.calcDistance = (transform1, transform2) => {
	return Math.sqrt(Math.pow(transform1.x - transform2.x, 2) + Math.pow(transform1.y - transform2.y, 2));
},
e.methods.randomNum = (limit1, limit2) => {
  if(limit1 < limit2) {
	  return Math.floor((Math.random() * (Math.abs(limit1 - limit2) + 1)) + limit1);
  } else {
	  return Math.floor((Math.random() * (Math.abs(limit2 - limit1) + 1)) + limit2);
  }
},
e.methods.randomExp = (min, max, exp) => {
  return Math.round(Math.pow(e.methods.randomNum(limit1, Math.pow(limit2, exp)), 1 / exp));
};
e.methods.calcAngle = (transform1, transform2) => {
  return Math.round(Math.atan2(transform1.y - transform2.y,  transform1.x - transform2.x) * 57.2958) + 180;
},
e.methods.calcRotationalVector = (angle, magnitude) => {
	return new Transform(Math.cos((angle) / 57.2958) * magnitude, Math.sin((angle) / 57.2958) * magnitude);
},
e.methods.addTransform = (transform1, transform2) => {
  return new Transform(transform1.x + transform2.x, transform1.y + transform2.y, transform1.r + transform2.r);
};
e.methods.roundTransform = (transform, decimalPlaces) => {
  return new Transform(Math.round(transform.x * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(transform.y * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(transform.r * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces));
};

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
  e.data.cx.fillRect(0, 0, e.data.w, e.data.h * -1);
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
	e.data.mouse.absolute.x = eObj.clientX;
	e.data.mouse.absolute.y = eObj.clientY * -1;
	e.data.mouse.dynamic.x = (eObj.clientX * e.data.camera.zoom) + e.data.camera.x;
	e.data.mouse.dynamic.y = e.data.camera.y - (eObj.clientY * e.data.camera.zoom);
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

//RESCALE CANVAS TO PROPER Y
e.data.cx.scale(1, -1);
