//jshint maxerr: 10000

//SNOWY GAME ENGINE

//PASSIVE CLASSES

//canvas class
class Canvas {
  constructor(id) {
    this.type = "canvas";
    this.element = document.getElementById(id);
    this.cx = this.element.getContext("2d");
    [this.w, this.h] = [this.element.width, this.element.height];
    this.cx.scale(1, -1);
  }
  //clears canvas with fill values
  fillAll(fill) {
    this.cx.fillStyle = fill.color;
    this.cx.globalAlpha = fill.alpha;
    this.cx.fillRect(0, 0, this.w, this.h * -1);
  }
  //sets canvas dimensions
  setDimensions(w, h) {
    [this.w, this.element.width, this.h, this.element.height] = [w, w, h, h];
    this.cx.scale(1, -1);
  }
}

//2d pair coordinate
class Pair {
  constructor(x, y) {
	  this.type = "pair";
    [this.x, this.y] = [x, y];
  }
  //add another pair
  add(pair) {
    this.x += pair.x;
    this.y += pair.y;
    return this;
  }
  //subtract another pair
  subtract(pair) {
    this.x -= pair.x;
    this.y -= pair.y;
    return this;
  }
  //multiply values by a number
  multiply(value) {
    this.x *= value;
    this.y *= value;
    return this;
  }
  //round values
  round(precision) {
    [this.x, this.y] = [Math.round(this.x * Math.pow(10, precision)) / Math.pow(10, precision), Math.round(this.y * Math.pow(10, precision)) / Math.pow(10, precision)];
    return this;
  }
  //move coordinate in an angular direction
  rotationalIncrease(angle, magnitude) {
    this.x += Math.cos(angle / 57.2958) * magnitude;
    this.y += Math.sin(angle / 57.2958) * magnitude;
    return this;
  }
  //returns a duplicate of this class
  duplicate() {
    return new Pair(this.x, this.y);
  }
}

//event tracker
class EventTracker {
  constructor() {
    this.type = "eventTracker";
    //access values
    this.pressedKeys = [];
    this.pressedButtons = [];
    this.cursor = new Pair(0, 0);
    //listeners
    document.addEventListener("keydown", (eObj) => {
      if(!this.pressedKeys.includes(eObj.key)) {
        this.pressedKeys.push(eObj.key);
      }
    });
    document.addEventListener("keyup", (eObj) => {
      this.pressedKeys.splice(this.pressedKeys.indexOf(eObj.key), 1);
    });
    document.addEventListener("mousemove", (eObj) => {
      [this.cursor.x, this.cursor.y] = [eObj.clientX, eObj.clientY * -1];
    });
    document.addEventListener("mousedown", (e) => {
      this.pressedButtons.push(e.button);
    });
    document.addEventListener("mouseup", (e) => {
      this.pressedButtons.splice(this.pressedButtons.indexOf(e.key), 1);
    });
  }
  //query dynamic cursor position
  dCursor(renderTool) {
    return new Pair(this.cursor.x + renderTool.camera.x, this.cursor.y + renderTool.camera.y);
  }
  //disable context menu
  disableRightClick() {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }
  disableTab() {
    document.addEventListener("keydown", (e) => {
      e.preventDefault();
    });
  }
  //get key presses
  getKey(name) {
    return this.pressedKeys.includes(name);
  }
  //get mouse presses
  getClick(button) {
    switch(button) {
      case "left":
        return this.pressedButtons.includes(0);
      case "center":
        return this.pressedButtons.includes(1);
      case "right":
        return this.pressedButtons.includes(2);
      case "aux1":
        return this.pressedButtons.includes(3);
      case "aux2":
        return this.pressedButtons.includes(4);
    }
  }
}

class Collider {
  constructor(pair, module) {
    //data
    this.type = "collider";
    this.pairs = [];
    this.module = module;
    //regenerate collider
    const zeroedPair = new Pair(0, 0);
    const tools = new Toolkit();
    switch(this.module.type) {
      case "shape":
        this.module.pairs.forEach((arrayPair) => {
          this.pairs.push(tools.addPairs(pair, tools.calcRotationalTranslate(tools.calcAngle(zeroedPair, arrayPair) + this.module.r, tools.calcDistance(zeroedPair, arrayPair))));
          this.pairs[this.pairs.length - 1].round(2);
        });
        break;
      case "rectangle":
        const initialPairs = [
          new Pair(this.module.w / -2, this.module.h / 2),
          new Pair(this.module.w / 2, this.module.h / 2),
          new Pair(this.module.w / 2, this.module.h / -2),
          new Pair(this.module.w / -2, this.module.h / -2),
        ];
        initialPairs.forEach((arrayPair) => {
          this.pairs.push(tools.addPairs(pair, tools.calcRotationalTranslate(tools.calcAngle(zeroedPair, arrayPair) + this.module.r, tools.calcDistance(zeroedPair, arrayPair))));
        });
        break;
      case "circle":
        let vertices = tools.roundNum((this.module.d / 5) + 5, 0);
        for(let vertexIndex = 0; vertexIndex < vertices; vertexIndex++) {
          this.pairs.push(tools.addPairs(pair, tools.calcRotationalTranslate((360 / vertices) * vertexIndex, this.module.d / 2)));
        }
        break;
    }
  }
}

//fill data for rendering methods
class Fill {
	constructor(color, alpha) {
		this.type = "fill";
		this.color = color;
		this.alpha = alpha;
	}
}

//border data for renderers
class Border {
	constructor(color, alpha, w, corner) {
		this.type = "border";
		[this.color, this.corner] = [color, corner];
		[this.alpha, this.w] = [alpha, w];
	}
}

//image data for renderers
class Img {
	constructor(img, alpha, r, x, y, w, h, hf, vf) {
		this.type = "img";
		this.img = img;
		[this.alpha, this.x, this.y, this.w, this.h, this.r] = [alpha, x, y, w, h, r];
		[this.hf, this.vf] = [hf, vf];
	}
}

//text data for renderers
class Text {
	constructor(font, text, r, size) {
		this.type = "text";
		[this.font, this.text] = [font, text];
		[this.r, this.size] = [r, size];
	}
}

//circle data for renderers
class Circle {
  constructor(d) {
    this.type = "circle";
    this.d = d;
  }
}

//rectangle data for renderers
class Rectangle {
  constructor(r, w, h) {
    this.type = "rectangle";
    [this.r, this.w, this.h] = [r, w, h];
  }
}

//shape data for renderers
class Shape {
	constructor(pairs, r) {
		this.type = "shape";
		this.pairs = pairs;
		this.r = r;
	}
	//allows for whole shape scaling
	scale(factor) {
    this.pairs.forEach((pair) => {
      pair.multiply(factor);
    });
	}
}

//line data for renderers
class Line {
  constructor(pairs, r) {
    this.type = "line";
    this.pairs = pairs;
    this.r = r;
  }
}

//ACTIVE CLASSES

//renderTool class
class RenderTool {
  constructor(canvas) {
    this.type = "renderTool";
    this.canvas = canvas;
    this.camera = new Pair(0, 0);
    this.zoom = 1;
  }
  //renders a circle
  renderCircle(pair, circle, fill, border) {
    //draw
    this.canvas.cx.beginPath();
    this.canvas.cx.arc((pair.x - this.camera.x) / this.zoom, (pair.y - this.camera.y) / this.zoom, (circle.d / 2) / this.zoom, 0, 2 * Math.PI, false);
    //fill
    if(fill !== null) {
      this.canvas.cx.globalAlpha = fill.alpha;
      this.canvas.cx.fillStyle = fill.color;
      this.canvas.cx.fill();
    }
    //border
    if(border !== null) {
      [this.canvas.cx.globalAlpha, this.canvas.cx.lineWidth] = [border.alpha, border.w / this.zoom];
      [this.canvas.cx.strokeStyle, this.canvas.cx.lineCap, this.canvas.cx.lineJoin] = [border.color, border.corner, border.corner];
      this.canvas.cx.stroke();
    }
  }
  //renders a rectangle
  renderRectangle(pair, rectangle, fill, border) {
    //save canvas position
    this.canvas.cx.save();
    //translate canvas to rectangle and rotate
    this.canvas.cx.translate(pair.x - this.camera.x, pair.y - this.camera.y);
    this.canvas.cx.rotate(rectangle.r * (Math.PI / 180));
    //draw
    this.canvas.cx.beginPath();
    this.canvas.cx.rect((rectangle.w / -2) / this.zoom, (rectangle.h / -2) / this.zoom, rectangle.w / this.zoom, rectangle.h / this.zoom);
    //fill
    if(fill !== null) {
      this.canvas.cx.globalAlpha = fill.alpha;
      this.canvas.cx.fillStyle = fill.color;
      this.canvas.cx.fill();
    }
    //border
    if(border !== null) {
      [this.canvas.cx.globalAlpha, this.canvas.cx.lineWidth] = [border.alpha, border.w / this.zoom];
      [this.canvas.cx.strokeStyle, this.canvas.cx.lineCap, this.canvas.cx.lineJoin] = [border.color, border.corner, border.corner];
      this.canvas.cx.stroke();
    }
    //restore canvas to default position
    this.canvas.cx.restore();
  }
  //renders a line
  renderLine(pair, line, border) {
    //save canvas position
    this.canvas.cx.save();
    //translate canvas to rectangle and rotate
    this.canvas.cx.translate(pair.x - this.camera.x, pair.y - this.camera.y);
    this.canvas.cx.rotate(line.r * (Math.PI / 180));
    //draw line
    this.canvas.cx.beginPath();
    this.canvas.cx.moveTo(line.pairs[0].x / this.zoom, line.pairs[0].y / this.zoom);
    line.pairs.forEach((linePair) => {
      this.canvas.cx.lineTo(linePair.x / this.zoom, linePair.y / this.zoom);
    });
    //color
    [this.canvas.cx.globalAlpha, this.canvas.cx.lineWidth] = [border.alpha, border.w / this.zoom];
    [this.canvas.cx.strokeStyle, this.canvas.cx.lineCap, this.canvas.cx.lineJoin] = [border.color, border.corner, border.corner];
    this.canvas.cx.stroke();
    //restore canvas to default position
    this.canvas.cx.restore();
  }
  //renders a shape
  renderShape(pair, shape, fill, border) {
    //save canvas position
    this.canvas.cx.save();
    //translate canvas to rectangle and rotate
    this.canvas.cx.translate(pair.x - this.camera.x, pair.y - this.camera.y);
    this.canvas.cx.rotate(shape.r * (Math.PI / 180));
    //draw line
    this.canvas.cx.beginPath();
    this.canvas.cx.moveTo(shape.pairs[0].x / this.zoom, shape.pairs[0].y / this.zoom);
    shape.pairs.forEach((shapePair) => {
      this.canvas.cx.lineTo(shapePair.x / this.zoom, shapePair.y / this.zoom);
    });
    this.canvas.cx.closePath();
    //fill
    if(fill !== null) {
      this.canvas.cx.globalAlpha = fill.alpha;
      this.canvas.cx.fillStyle = fill.color;
      this.canvas.cx.fill();
    }
    //border
    if(border !== null) {
      [this.canvas.cx.globalAlpha, this.canvas.cx.lineWidth] = [border.alpha, border.w / this.zoom];
      [this.canvas.cx.strokeStyle, this.canvas.cx.lineCap, this.canvas.cx.lineJoin] = [border.color, border.corner, border.corner];
      this.canvas.cx.stroke();
    }
    //restore canvas to default position
    this.canvas.cx.restore();
  }
  //renders an image
  renderImage(pair, img) {
    //prepare canvas scaling and flipping
    const fc = {
    	x: 1,
    	y: -1
    };
    this.canvas.cx.save();
    if(img.hf) {
      this.canvas.cx.scale(-1, 1);
      fc.x = -1;
    } else {
      this.canvas.cx.scale(1, 1);
    }
    if(img.vf) {
      this.canvas.cx.scale(1, 1);
      fc.y = 1;
    } else {
      this.canvas.cx.scale(1, -1);
    }
    this.canvas.cx.globalAlpha = img.alpha;
    this.canvas.cx.translate(((pair.x - this.camera.x) / this.zoom) * fc.x, ((pair.y - this.camera.y) / this.zoom) * fc.y);
    this.canvas.cx.rotate(img.r * fc.x * fc.y * (Math.PI / 180));
    //draw
    this.canvas.cx.drawImage(img.img, ((img.x / this.zoom) * fc.x) - ((img.w / this.zoom) / 2), ((img.y / this.zoom) * fc.y) - ((img.h / this.zoom) / 2), img.w / this.zoom, img.h / this.zoom);
    //restore canvas
    this.canvas.cx.restore();
  }
  //render text
  renderText(pair, text, fill) {
    this.canvas.cx.save();
    this.canvas.cx.scale(1, -1);
    this.canvas.cx.translate(pair.x, pair.y * -1);
    this.canvas.cx.rotate(text.r * (Math.PI / 180));
    this.canvas.cx.globalAlpha = fill.alpha;
    [this.canvas.cx.font, this.canvas.cx.fillStyle] = [`${text.size / this.zoom}px ${text.font}`, fill.color];
    this.canvas.cx.fillText(text.text, (-1 * this.camera.x / this.zoom), (this.camera.y / this.zoom));
    this.canvas.cx.restore();
  }
}

//toolkit class
class Toolkit {
  constructor() {
    this.type = "toolkit";
  }
  //generates an image object
  generateImage(src) {
    const holdingObject = new Image();
    holdingObject.src = src;
    return holdingObject;
  }
  //calculates distance between pairs
  calcDistance(pair1, pair2) {
    return Math.sqrt(Math.pow(pair1.x - pair2.x, 2) + Math.pow(pair1.y - pair2.y, 2));
  }
  //generates random ints
  randomNum(limit1, limit2) {
    if(limit1 < limit2) {
      return Math.floor((Math.random() * (Math.abs(limit1 - limit2) + 1)) + limit1);
    } else {
      return Math.floor((Math.random() * (Math.abs(limit2 - limit1) + 1)) + limit2);
    }
  }
  //calculates the average value of an array of numbers
  calcAverage(values) {
    let currentMutation = 0;
    values.forEach((value) => {
      currentMutation += value;
    });
    return currentMutation / values.length;
  }
  //rounds values
  roundNum(value, precision) {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
  }
  //calculates the direction from pairs 1 to 2
  calcAngle(pair1, pair2) {
    return Math.round(Math.atan2(pair1.y - pair2.y, pair1.x - pair2.x) * 57.2958) + 180;
  }
  //adds pairs and returns product without mutating them
  addPairs(pair1, pair2) {
    return new Pair(pair1.x + pair2.x, pair1.y + pair2.y);
  }
  //generates a midpoint between multiple pairs
  calcAveragePair(pairs) {
    let retPair = new Pair(0, 0);
    pairs.forEach((pair) => {
      retPair.add(pair);
    });
    return retPair.multiply(1 / pairs.length);
  }
  //generates a pair which can be added to another to translate it in a direction
  calcRotationalTranslate(angle, magnitude) {
    return new Pair(Math.cos(angle / 57.2958) * magnitude, Math.sin(angle / 57.2958) * magnitude);
  }
  //detect collisions
  detectCollision(collider1, collider2) {
    //data
    let lastPoint;
    let passthroughs;
    let collided = false;
    const testPoints = [];
    
    //point collisons
    if(collider1.type === "pair") {
      //set last to end
      lastPoint = collider2.pairs[collider2.pairs.length - 1];
      //cycle to find sets of pairs on either side of point
      collider2.pairs.forEach((pair) => {
        if(lastPoint.x < collider1.x && collider1.x < pair.x) {
          testPoints.push([
            lastPoint,
            pair
          ]);
        }
        if(pair.x < collider1.x && collider1.x < lastPoint.x) {
          testPoints.push([
            pair,
            lastPoint
          ]);
        }
        lastPoint = pair;
      });
      //test for passthroughs
      passthroughs = 0;
      testPoints.forEach((pairSet) => {
        //calculate passthroughs
        if(((collider1.x - pairSet[0].x) * (pairSet[1].y - pairSet[0].y) / (pairSet[1].x - pairSet[0].x)) + pairSet[0].y > collider1.y) {
          passthroughs++;
        }
      });
      //return answer
      if(passthroughs % 2 === 0) {
        return false;
      } else {
        return true;
      }
    //shape collisions
    } else {
      //cycle each point in collider1 through detector
      collider1.pairs.forEach((testPair) => {
        //set last to end
        lastPoint = collider2.pairs[collider2.pairs.length - 1];
        //cycle to find sets of pairs on either side of point
        testPoints.splice(0, testPoints.length);
        collider2.pairs.forEach((pair) => {
          if(lastPoint.x < testPair.x && testPair.x < pair.x) {
            testPoints.push([
              lastPoint,
              pair
            ]);
          }
          if(pair.x < testPair.x && testPair.x < lastPoint.x) {
            testPoints.push([
              pair,
              lastPoint
            ]);
          }
          lastPoint = pair;
        });
        //test for passthroughs
        passthroughs = 0;
        testPoints.forEach((pairSet) => {
          //calculate passthroughs
          if(((testPair.x - pairSet[0].x) * (pairSet[1].y - pairSet[0].y) / (pairSet[1].x - pairSet[0].x)) + pairSet[0].y > testPair.y) {
            passthroughs++;
          }
        });
        //return answer
        if(passthroughs % 2 !== 0) {
          collided = true;
        }
      });
      if(collided) {
        return collided;
      }
      //cycle each point in collider2 through detector
      collider2.pairs.forEach((testPair) => {
        //set last to end
        lastPoint = collider1.pairs[collider1.pairs.length - 1];
        //cycle to find sets of pairs on either side of point
        testPoints.splice(0, testPoints.length);
        collider1.pairs.forEach((pair) => {
          if(lastPoint.x < testPair.x && testPair.x < pair.x) {
            testPoints.push([
              lastPoint,
              pair
            ]);
          }
          if(pair.x < testPair.x && testPair.x < lastPoint.x) {
            testPoints.push([
              pair,
              lastPoint
            ]);
          }
          lastPoint = pair;
        });
        //test for passthroughs
        passthroughs = 0;
        testPoints.forEach((pairSet) => {
          //calculate passthroughs
          if(((testPair.x - pairSet[0].x) * (pairSet[1].y - pairSet[0].y) / (pairSet[1].x - pairSet[0].x)) + pairSet[0].y > testPair.y) {
            passthroughs++;
          }
        });
        //return answer
        if(passthroughs % 2 !== 0) {
          collided = true;
        }
      });
      return collided;
    }
  }
}
