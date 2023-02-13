//jshint maxerr: 10000

//CONSTRUCT DOCUMENT
document.body.innerHTML = "<canvas id=\"canvas\" style=\"border: 1px solid black\"></canvas>" + document.body.innerHTML;
document.head.innerHTML += "<meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><style>canvas{margin:0;border:0;padding:0;}body{margin:0;overflow:hidden;}</style>";

class Vector2 {
  constructor(x, y) {
	  this.type = "vector2";
    this.x = x;
    this.y = y;
  }
}

class Vector3 {
  constructor(x, y, z) {
	  this.type = "vector3";
    this.x = x;
    this.y = y;
    this.z = z;
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

class Circle {
  constructor(radius, cameraStatic, useCulling) {
    this.type = "circle";
    this.radius = radius;
    this.cameraStatic = cameraStatic;
    this.useCulling = useCulling;
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

const e = {
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
	roundvector: null,
	clearCanvas: null,
	w: window.innerWidth,
	h: window.innerHeight,
	element: document.getElementById("canvas"),
	cx: document.getElementById("canvas").getContext("2d"),
	mouse: {
		absolute: new Vector3(0, 0, 0),
		dynamic: new Vector3(0, 0, 0),
		clicking: false
	},
	pressedKeys: [
	],
	camera: {
		x: 0,
		y: 0,
		zoom: 1
	}
};

//FUNCTIONS
e.setDimensions = (w, h) => {
	if(w === "full") {
		e.element.width = window.innerWidth;
		e.w = window.innerWidth;
		e.element.height = window.innerHeight;
		e.h = window.innerHeight;
	} else {
		e.w = w;
		e.h = h;
		e.element.width = w;
		e.element.height = h;
	}
};
e.renderImage = (vector, imageRenderer) => {
  if(imageRenderer.cameraStatic) {
    if(!imageRenderer.useCulling || (vector.x + (imageRenderer.w / 2) >= 0 && vector.x - (imageRenderer.w / 2) <= e.w && vector.y - (imageRenderer.h / 2) <= 0 && vector.y + (imageRenderer.h / 2) >= e.h * -1)) {
      let fc = {
      	x: 1,
      	y: -1
      };
      e.cx.save();
      if(imageRenderer.hf) {
      	e.cx.scale(-1, 1);
      	fc.x = -1;
      } else {
      	e.cx.scale(1, 1);
      }
      if(imageRenderer.vf) {
      	e.cx.scale(1, 1);
      	fc.y = 1;
      } else {
      	e.cx.scale(1, -1);
      }
      e.cx.globalAlpha = imageRenderer.alpha;
      e.cx.translate(vector.x * fc.x, vector.y * fc.y);
      e.cx.rotate(vector.z * fc.x * fc.y * (Math.PI / 180));
      e.cx.drawImage(imageRenderer.image, (imageRenderer.x * fc.x) - (imageRenderer.w / 2), (imageRenderer.y * fc.y) - (imageRenderer.h / 2), imageRenderer.w, imageRenderer.h);
      e.cx.restore();
    }
  } else {
    if(!imageRenderer.useCulling || (vector.x + (imageRenderer.w / 2) >= e.camera.x && e.camera.x + (e.w * e.camera.zoom) >= vector.x - (imageRenderer.w / 2) && vector.y - (imageRenderer.h / 2) <= e.camera.y && e.camera.y - (e.h * e.camera.zoom) <= vector.y + (imageRenderer.h / 2))) {
      let fc = {
      	x: 1,
      	y: -1
      };
      e.cx.save();
      if(imageRenderer.hf) {
      	e.cx.scale(-1, 1);
      	fc.x = -1;
      } else {
      	e.cx.scale(1, 1);
      }
      if(imageRenderer.vf) {
      	e.cx.scale(1, 1);
      	fc.y = 1;
      } else {
      	e.cx.scale(1, -1);
      }
      e.cx.globalAlpha = imageRenderer.alpha;
      e.cx.translate(((vector.x - e.camera.x) / e.camera.zoom) * fc.x, ((vector.y - e.camera.y) / e.camera.zoom) * fc.y);
      e.cx.rotate(vector.z * fc.x * fc.y * (Math.PI / 180));
      e.cx.drawImage(imageRenderer.image, ((imageRenderer.x / e.camera.zoom) * fc.x) - ((imageRenderer.w / e.camera.zoom) / 2), ((imageRenderer.y / e.camera.zoom) * fc.y) - ((imageRenderer.h / e.camera.zoom) / 2), imageRenderer.w / e.camera.zoom, imageRenderer.h / e.camera.zoom);
      e.cx.restore();
    }
  }
};
e.renderText = (vector, text, fillRenderer) => {
  if(text.cameraStatic) {
    if(!text.useCulling || (vector.x + (text.text.length * text.size) >= 0 && e.w >= vector.x && vector.y <= 0 && e.h * -1 <= vector.y + (text.size * 2))) {
      e.cx.save();
      e.cx.scale(1, -1);
      e.cx.translate(vector.x, vector.y * -1);
      e.cx.rotate(vector.z * (Math.PI / 180));
      e.cx.globalAlpha = fillRenderer.alpha;
      e.cx.font = text.size + "px " + text.font;
      e.cx.fillStyle = fillRenderer.color1;
      e.cx.fillText(text.text, text.x, text.y);
      e.cx.restore();
    }
  } else {
    if(!text.useCulling || (vector.x + (text.text.length * text.size) >= e.camera.x && e.camera.x + (e.w * e.camera.zoom) >= vector.x && vector.y <= e.camera.y && e.camera.y - (e.h * e.camera.zoom) <= vector.y - (text.size * 2))) {
      e.cx.save();
      e.cx.scale(1, -1);
      e.cx.translate((vector.x - e.camera.x) / e.camera.zoom, ((vector.y - e.camera.y) / e.camera.zoom) * -1);
      e.cx.rotate(vector.z * (Math.PI / 180));
      e.cx.globalAlpha = fillRenderer.alpha;
      e.cx.font = (text.size / e.camera.zoom) + "px " + text.font;
      e.cx.fillStyle = fillRenderer.color1;
      e.cx.fillText(text.text, text.x / e.camera.zoom, text.y / e.camera.zoom);
      e.cx.restore();
    }
  }
};
e.renderCircle = (vector, circle, fillRenderer, borderRenderer) => {
  if(circle.cameraStatic) {
    e.cx.globalAlpha = fillRenderer.alpha;
    e.cx.beginPath();
    e.cx.arc(vector.x, vector.y, circle.radius, 0, 2 * Math.PI, false);
    e.cx.fillStyle = fillRenderer.color1;
    e.cx.fill();
    e.cx.globalAlpha = fillRenderer.alpha;
    e.cx.lineWidth = borderRenderer.lw;
    e.cx.strokeStyle = borderRenderer.color;
    e.cx.stroke();
  } else {
    e.cx.globalAlpha = fillRenderer.alpha;
    e.cx.beginPath();
    e.cx.arc((vector.x - e.camera.x) / e.camera.zoom, (vector.y - e.camera.y) / e.camera.zoom, circle.radius / e.camera.zoom, 0, 2 * Math.PI, false);
    e.cx.fillStyle = fillRenderer.color1;
    e.cx.fill();
    e.cx.globalAlpha = fillRenderer.alpha;
    e.cx.lineWidth = borderRenderer.lw / e.camera.zoom;
    e.cx.strokeStyle = borderRenderer.color;
    e.cx.stroke();
  }
};
e.renderPolygon = (vector, polygon, fillRenderer, borderRenderer) => {
  if(polygon.cameraStatic) {
    e.cx.save();
    e.cx.translate(vector.x, vector.y);
    e.cx.rotate(vector.z * (Math.PI / 180));
    let tri = 0;
    for(tri = 0; tri < polygon.tris.length; tri++) {
      e.cx.beginPath();
      e.cx.moveTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
      let point = 0;
      for(point = 0; point < polygon.tris[tri].borders; point++) {
        if(point === 2) {
          e.cx.lineTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
        } else {
          e.cx.lineTo(polygon.tris[tri].points[point + 1].x, polygon.tris[tri].points[point + 1].y);
        }
        if(borderRenderer !== null) {
          e.cx.globalAlpha = borderRenderer.alpha;
          e.cx.lineWidth = borderRenderer.lw;
          e.cx.strokeStyle = borderRenderer.color;
          e.cx.stroke();
        } else {
          e.cx.globalAlpha = 0;
          e.cx.lineWidth = 0;
          e.cx.stroke();
        }
      }
      e.cx.beginPath();
      for(point = 0; point < 3; point++) {
        if(point === 2) {
          e.cx.lineTo(polygon.tris[tri].points[0].x, polygon.tris[tri].points[0].y);
        } else {
          e.cx.lineTo(polygon.tris[tri].points[point + 1].x, polygon.tris[tri].points[point + 1].y);
        }
        e.cx.globalAlpha = 0;
        e.cx.lineWidth = 0;
        e.cx.stroke();
      }
      if(fillRenderer !== null) {
        e.cx.globalAlpha = fillRenderer.alpha;
        e.cx.fillStyle = fillRenderer.color1;
        e.cx.fill();
      }
    }
    e.cx.restore();
  } else {
    e.cx.save();
    e.cx.translate((vector.x - e.camera.x) / e.camera.zoom, (vector.y - e.camera.y) / e.camera.zoom);
    e.cx.rotate(vector.z * (Math.PI / 180));
    let tri = 0;
    for(tri = 0; tri < polygon.tris.length; tri++) {
      e.cx.beginPath();
      e.cx.moveTo(polygon.tris[tri].points[0].x / e.camera.zoom, polygon.tris[tri].points[0].y / e.camera.zoom);
      let point = 0;
      for(point = 0; point < polygon.tris[tri].borders; point++) {
        if(point === 2) {
          e.cx.lineTo(polygon.tris[tri].points[0].x / e.camera.zoom, polygon.tris[tri].points[0].y / e.camera.zoom);
        } else {
          e.cx.lineTo(polygon.tris[tri].points[point + 1].x / e.camera.zoom, polygon.tris[tri].points[point + 1].y / e.camera.zoom);
        }
        if(borderRenderer !== null) {
          e.cx.globalAlpha = borderRenderer.alpha;
          e.cx.lineWidth = borderRenderer.lw / e.camera.zoom;
          e.cx.strokeStyle = borderRenderer.color;
          e.cx.stroke();
        } else {
          e.cx.globalAlpha = 0;
          e.cx.lineWidth = 0;
          e.cx.stroke();
        }
      }
      e.cx.beginPath();
      for(point = 0; point < 3; point++) {
        if(point === 2) {
          e.cx.lineTo(polygon.tris[tri].points[0].x / e.camera.zoom, polygon.tris[tri].points[0].y / e.camera.zoom);
        } else {
          e.cx.lineTo(polygon.tris[tri].points[point + 1].x / e.camera.zoom, polygon.tris[tri].points[point + 1].y / e.camera.zoom);
        }
        e.cx.globalAlpha = 0;
        e.cx.lineWidth = 0;
        e.cx.stroke();
      }
      if(fillRenderer !== null) {
        e.cx.globalAlpha = fillRenderer.alpha;
        e.cx.fillStyle = fillRenderer.color1;
        e.cx.fill();
      }
    }
    e.cx.restore();
  }
};
e.calcDistance = (vector1, vector2) => {
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
};
e.randomNum = (limit1, limit2) => {
  if(limit1 < limit2) {
	  return Math.floor((Math.random() * (Math.abs(limit1 - limit2) + 1)) + limit1);
  } else {
	  return Math.floor((Math.random() * (Math.abs(limit2 - limit1) + 1)) + limit2);
  }
};
e.randomExp = (min, max, exp) => {
  return Math.round(Math.pow(e.randomNum(min, Math.pow(max, exp)), 1 / exp));
};
e.calcAngle = (vector1, vector2) => {
  return Math.round(Math.atan2(vector1.y - vector2.y, vector1.x - vector2.x) * 57.2958) + 180;
};
e.calcRotationalVector2 = (angle, magnitude) => {
	return new Vector2(Math.cos((angle) / 57.2958) * magnitude, Math.sin((angle) / 57.2958) * magnitude);
};
e.addVector = (vector1, vector2) => {
  if(vector1.type === "vector3") {
    if(vector2.type === "vector3") {
      return new Vector3(vector1.x + vector2.x, vector1.y + vector2.y, vector1.r + vector2.r);
    } else {
      return new Vector3(vector1.x + vector2.x, vector1.y + vector2.y, vector1.r);
    }
  } else {
    return new Vector2(vector1.x + vector2.x, vector1.y + vector2.y);
  }
};
e.roundVector = (vector, decimalPlaces) => {
  if(vector.type === "vector3") {
    return new Vector3(Math.round(vector.x * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.y * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.z * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces));
  } else {
    return new Vector3(Math.round(vector.x * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.y * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces));
  }
};
e.detectCollision = (vector1, polygon1, vector2, polygon2) => {
	if(polygon1 === null) {
		let tri = 0;
		for(tri = 0; tri < polygon2.tris.length; tri++) {
		  let angleTotal = 0;
			let point = 0;
			for(point = 0; point < 3; point++) {
				if(point < 2) {
          if(Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
            if(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) < 180) {
              angleTotal += Math.abs((e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) + 360) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
            } else {
              angleTotal += Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - (e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
          }
				} else {
          if(Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y))) > 180) {
            if(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) < 180) {
              angleTotal += Math.abs((e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) + 360) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
            } else {
              angleTotal += Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - (e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
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
              if(Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
                if(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) + 360) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - (e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y))) > 180) {
                if(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) + 360) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - (e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
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
              if(Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y))) > 180) {
                if(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) + 360) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - (e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y))) > 180) {
                if(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) + 360) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - (e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - e.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)));
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
e.clearCanvas = (fillRenderer) => {
  e.cx.fillStyle = fillRenderer.color1;
  e.cx.globalAlpha = 1;
  e.cx.fillRect(0, 0, e.w, e.h * -1);
};

//ADD EVENT LISTENERS
document.addEventListener("keydown", (eObj) => {
	if(!e.pressedKeys.includes(eObj.key)) {
		e.pressedKeys.push(eObj.key);
	}
});
document.addEventListener("keyup", (eObj) => {
	e.pressedKeys.splice(e.pressedKeys.indexOf(eObj.key), 1);
});
document.addEventListener("mousemove", (eObj) => {
	e.mouse.absolute.x = eObj.clientX;
	e.mouse.absolute.y = eObj.clientY * -1;
	e.mouse.dynamic.x = (eObj.clientX * e.camera.zoom) + e.camera.x;
	e.mouse.dynamic.y = e.camera.y - (eObj.clientY * e.camera.zoom);
});
document.addEventListener("mousedown", () => {
	e.mouse.clicking = true;
});
document.addEventListener("mouseup", () => {
	e.mouse.clicking = false;
});

//SET FULL CANVAS DIMENSIONS
e.element.width = window.innerWidth;
e.element.height = window.innerHeight;

//RESCALE CANVAS TO PROPER Y
e.cx.scale(1, -1);
