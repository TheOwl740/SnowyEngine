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
		roundvector: null,
		clearCanvas: null
	},
	data: {
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
e.methods.renderImage = (vector, imageRenderer) => {
  if(imageRenderer.cameraStatic) {
    if(!imageRenderer.useCulling || (vector.x + (imageRenderer.w / 2) >= 0 && vector.x - (imageRenderer.w / 2) <= e.data.w && vector.y - (imageRenderer.h / 2) <= 0 && vector.y + (imageRenderer.h / 2) >= e.data.h * -1)) {
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
      e.data.cx.translate(vector.x * fc.x, vector.y * fc.y);
      e.data.cx.rotate(vector.z * fc.x * fc.y * (Math.PI / 180));
      e.data.cx.drawImage(imageRenderer.image, (imageRenderer.x * fc.x) - (imageRenderer.w / 2), (imageRenderer.y * fc.y) - (imageRenderer.h / 2), imageRenderer.w, imageRenderer.h);
      e.data.cx.restore();
    }
  } else {
    if(!imageRenderer.useCulling || (vector.x + (imageRenderer.w / 2) >= e.data.camera.x && e.data.camera.x + (e.data.w * e.data.camera.zoom) >= vector.x - (imageRenderer.w / 2) && vector.y - (imageRenderer.h / 2) <= e.data.camera.y && e.data.camera.y - (e.data.h * e.data.camera.zoom) <= vector.y + (imageRenderer.h / 2))) {
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
      e.data.cx.translate(((vector.x - e.data.camera.x) / e.data.camera.zoom) * fc.x, ((vector.y - e.data.camera.y) / e.data.camera.zoom) * fc.y);
      e.data.cx.rotate(vector.z * fc.x * fc.y * (Math.PI / 180));
      e.data.cx.drawImage(imageRenderer.image, ((imageRenderer.x / e.data.camera.zoom) * fc.x) - ((imageRenderer.w / e.data.camera.zoom) / 2), ((imageRenderer.y / e.data.camera.zoom) * fc.y) - ((imageRenderer.h / e.data.camera.zoom) / 2), imageRenderer.w / e.data.camera.zoom, imageRenderer.h / e.data.camera.zoom);
      e.data.cx.restore();
    }
  }
},
e.methods.renderText = (vector, text, fillRenderer) => {
  if(text.cameraStatic) {
    if(!text.useCulling || (vector.x + (text.text.length * text.size) >= 0 && e.data.w >= vector.x && vector.y <= 0 && e.data.h * -1 <= vector.y + (text.size * 2))) {
      e.data.cx.save();
      e.data.cx.scale(1, -1);
      e.data.cx.translate(vector.x, vector.y * -1);
      e.data.cx.rotate(vector.z * (Math.PI / 180));
      e.data.cx.globalAlpha = fillRenderer.alpha;
      e.data.cx.font = text.size + "px " + text.font;
      e.data.cx.fillStyle = fillRenderer.color1;
      e.data.cx.fillText(text.text, text.x, text.y);
      e.data.cx.restore();
    }
  } else {
    if(!text.useCulling || (vector.x + (text.text.length * text.size) >= e.data.camera.x && e.data.camera.x + (e.data.w * e.data.camera.zoom) >= vector.x && vector.y <= e.data.camera.y && e.data.camera.y - (e.data.h * e.data.camera.zoom) <= vector.y - (text.size * 2))) {
      e.data.cx.save();
      e.data.cx.scale(1, -1);
      e.data.cx.translate((vector.x - e.data.camera.x) / e.data.camera.zoom, ((vector.y - e.data.camera.y) / e.data.camera.zoom) * -1);
      e.data.cx.rotate(vector.z * (Math.PI / 180));
      e.data.cx.globalAlpha = fillRenderer.alpha;
      e.data.cx.font = (text.size / e.data.camera.zoom) + "px " + text.font;
      e.data.cx.fillStyle = fillRenderer.color1;
      e.data.cx.fillText(text.text, text.x / e.data.camera.zoom, text.y / e.data.camera.zoom);
      e.data.cx.restore();
    }
  }
},
e.methods.renderCircle = function(vector, fillRenderer, borderRenderer) {
  e.data.cx.globalAlpha = fillRenderer.alpha;
  e.data.cx.beginPath();
  e.data.cx.arc(vector.x, vector.y, vector.z, 0, 2 * Math.PI, false);
  e.data.cx.fillStyle = fillRenderer.color1;
  e.data.cx.fill();
  e.data.cx.globalAlpha = fillRenderer.alpha;
  e.data.cx.lineWidth = borderRenderer.lw;
  e.data.cx.strokeStyle = borderRenderer.color;
  e.data.cx.stroke();
};
e.methods.renderPolygon = (vector, polygon, fillRenderer, borderRenderer) => {
  if(polygon.cameraStatic) {
    e.data.cx.save();
    e.data.cx.translate(vector.x, vector.y);
    e.data.cx.rotate(vector.z * (Math.PI / 180));
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
    e.data.cx.translate((vector.x - e.data.camera.x) / e.data.camera.zoom, (vector.y - e.data.camera.y) / e.data.camera.zoom);
    e.data.cx.rotate(vector.z * (Math.PI / 180));
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
e.methods.calcDistance = (vector1, vector2) => {
	return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
},
e.methods.randomNum = (limit1, limit2) => {
  if(limit1 < limit2) {
	  return Math.floor((Math.random() * (Math.abs(limit1 - limit2) + 1)) + limit1);
  } else {
	  return Math.floor((Math.random() * (Math.abs(limit2 - limit1) + 1)) + limit2);
  }
},
e.methods.randomExp = (min, max, exp) => {
  return Math.round(Math.pow(e.methods.randomNum(min, Math.pow(max, exp)), 1 / exp));
};
e.methods.calcAngle = (vector1, vector2) => {
  return Math.round(Math.atan2(vector1.y - vector2.y,  vector1.x - vector2.x) * 57.2958) + 180;
},
e.methods.calcRotationalVector2 = (angle, magnitude) => {
	return new Vector2(Math.cos((angle) / 57.2958) * magnitude, Math.sin((angle) / 57.2958) * magnitude);
},
e.methods.addVector = (vector1, vector2) => {
  if(vector1.type === "vector3") {
    if(vector2.type === "vector3") {
      return new Vector33(vector1.x + vector2.x, vector1.y + vector2.y, vector1.r + vector2.r);
    } else {
      return new Vector33(vector1.x + vector2.x, vector1.y + vector2.y, vector1.r);
    }
  } else {
    return new Vector32(vector1.x + vector2.x, vector1.y + vector2.y);
  }
  
};
e.methods.roundvector = (vector, decimalPlaces) => {
  if(vector.type === "vector3") {
    return new Vector3(Math.round(vector.x * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.y * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.z * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces));
  } else {
    return new Vector3(Math.round(vector.x * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces), Math.round(vector.y * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces));
  }
  
};

e.methods.detectCollision = (vector1, polygon1, vector2, polygon2) => {
	if(polygon1 === null) {
		let tri = 0;
		for(tri = 0; tri < polygon2.tris.length; tri++) {
		  let angleTotal = 0;
			let point = 0;
			for(point = 0; point < 3; point++) {
				if(point < 2) {
          if(Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
            if(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) < 180) {
              angleTotal += Math.abs((e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
            } else {
              angleTotal += Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - (e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
          }
				} else {
          if(Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y))) > 180) {
            if(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) < 180) {
              angleTotal += Math.abs((e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
            } else {
              angleTotal += Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - (e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)) + 360));
            }
          } else {
            angleTotal += Math.abs(e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(vector1, new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
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
              if(Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y))) > 180) {
                if(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - (e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point].x, vector2.y + polygon2.tris[tri].points[point].y)) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[point + 1].x, vector2.y + polygon2.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y))) > 180) {
                if(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - (e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[2].x, vector2.y + polygon2.tris[tri].points[2].y)) - e.methods.calcAngle(new Vector2(vector1.x + polygon1.tris[testTri].points[testPoint].x, vector1.y + polygon1.tris[testTri].points[testPoint].y), new Vector2(vector2.x + polygon2.tris[tri].points[0].x, vector2.y + polygon2.tris[tri].points[0].y)));
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
              if(Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y))) > 180) {
                if(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) + 360) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - (e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point].x, vector1.y + polygon1.tris[tri].points[point].y)) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[point + 1].x, vector1.y + polygon1.tris[tri].points[point + 1].y)));
              }
    				} else {
              if(Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y))) > 180) {
                if(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) < 180) {
                  angleTotal += Math.abs((e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) + 360) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)));
                } else {
                  angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - (e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)) + 360));
                }
              } else {
                angleTotal += Math.abs(e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[2].x, vector1.y + polygon1.tris[tri].points[2].y)) - e.methods.calcAngle(new Vector2(vector2.x + polygon2.tris[testTri].points[testPoint].x, vector2.y + polygon2.tris[testTri].points[testPoint].y), new Vector2(vector1.x + polygon1.tris[tri].points[0].x, vector1.y + polygon1.tris[tri].points[0].y)));
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
