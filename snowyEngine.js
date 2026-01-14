//SNOWY GAME ENGINE

//canvas class holds engine data related to a canvas on the html document
class Canvas {
  constructor(element) {
    this.type = "canvas";
    this.element = element;
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
//2d coordinate pair used in many calculations
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
  //returns a duplicate of the active instance
  duplicate() {
    return new Pair(this.x, this.y);
  }
  //returns a boolean if two pairs are equal
  isEqualTo(pair) {
    return this.x === pair.x && this.y === pair.y;
  }
  distToOrigin() {
    return ((this.x ** 2) + (this.y ** 2)) ** 0.5;
  }
}
//event tracker contains keypress, mouse and tap data, and can block context keys.
class EventTracker {
  constructor(cs) {
    this.type = "eventTracker";
    //access values
    this.pressedKeys = [];
    this.pressedButtons = [];
    this.cursor = new Pair(0, 0);
    this.cRect = cs.element.getBoundingClientRect();
    //prevention listeners
    this.tabEnabled = true;
    this.rightClickEnabled = true;
    //listeners
    document.addEventListener("contextmenu", (e) => {
      if(!this.rightClickEnabled) {
        e.preventDefault();
      }
    });
    document.addEventListener("keydown", (e) => {
      if(!this.pressedKeys.includes(e.key)) {
        this.pressedKeys.push(e.key);
      }
      if(e.key === "Tab" && !this.tabEnabled) {
        e.preventDefault();
      }
    });
    document.addEventListener("keyup", (e) => {
      this.pressedKeys.splice(this.pressedKeys.indexOf(e.key), 1);
    });
    document.addEventListener("pointermove", (e) => {
      [this.cursor.x, this.cursor.y] = [(e.clientX - this.cRect.left) * (cs.element.width / this.cRect.width), (e.clientY - this.cRect.top) * (cs.element.height / this.cRect.height) * -1];
    });
    document.addEventListener("mousedown", (e) => {
      this.pressedButtons.push(e.button);
    });
    document.addEventListener("mouseup", (e) => {
      this.pressedButtons.splice(this.pressedButtons.indexOf(e.button), 1);
    });
    document.addEventListener("touchstart", (e) => {
      [this.cursor.x, this.cursor.y] = [(e.touches[0].clientX - this.cRect.left) * (cs.element.width / this.cRect.width), (e.touches[0].clientY - this.cRect.top) * (cs.element.height / this.cRect.height) * -1];
      this.pressedButtons.push(0);
    });
    document.addEventListener("touchend", () => {
      this.pressedButtons.splice(this.pressedButtons.indexOf(0), 1);
    });
  }
  //query dynamic cursor position
  dCursor(renderTool) {
    return new Pair(this.cursor.x + renderTool.camera.x, this.cursor.y + renderTool.camera.y);
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
//colliders are used in toolkit collision detection
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
          this.pairs.push(tools.pairMath(pair, tools.calcRotationalTranslate(tools.pairMath(zeroedPair, arrayPair, "angle") + this.module.r, tools.pairMath(zeroedPair, arrayPair, "distance")), "add"));
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
          this.pairs.push(tools.pairMath(pair, tools.calcRotationalTranslate(tools.pairMath(zeroedPair, arrayPair, "angle") + this.module.r, tools.pairMath(zeroedPair, arrayPair, "distance")), "add"));
        });
        break;
      case "circle":
        let vertices = tools.roundNum((this.module.d / 5) + 5, 0);
        for(let vertexIndex = 0; vertexIndex < vertices; vertexIndex++) {
          this.pairs.push(tools.pairMath(pair, tools.calcRotationalTranslate((360 / vertices) * vertexIndex, this.module.d / 2), "add"));
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
  duplicate() {
    return new Img(this.img, this.alpha, this.r, this.x, this.y, this.w, this.h, this.hf, this.vf);
  }
}
//spritesheet image data for renderers
class Sprite {
  constructor(img, alpha, r, x, y, w, h, hf, vf, tw, th) {
    this.type = "sprite";
    this.img = img;
    this.activeTile = new Pair(0, 0);
    [this.alpha, this.x, this.y, this.w, this.h, this.r, this.tw, this.th] = [alpha, x, y, w, h, r, tw, th];
    [this.hf, this.vf] = [hf, vf];
  }
  //sets active cell on the spritesheet that will be rendered
  setActive(indexPair) {
    this.activeTile = indexPair.duplicate();
  }
  //duplicates this instance
  duplicate() {
    return new Sprite(this.img, this.alpha, this.r, this.x, this.y, this.w, this.h, this.hf, this.vf, this.tw, this.th);
  }
}
//text data for renderers
class TextNode {
  constructor(font, text, r, size, alignment) {
    this.type = "text";
    [this.font, this.text] = [font, text];
    [this.r, this.size] = [r, size];
    //fixes mysterious reversal of alignment
    switch(alignment) {
      case "right":
        this.alignment = "right";
        break;
      case "left":
        this.alignment = "left";
        break;
      default:
        this.alignment = "center";
    }
  }
  //returns the width of a text given the context of a render tool
  measure(rt) {
    rt.canvas.cx.font = `${this.size / rt.zoom}px ${this.font}`;
    return rt.canvas.cx.measureText(this.text).width;
  }
}
//circle data for renderers and colliders
class Circle {
  constructor(d) {
    this.type = "circle";
    this.d = d;
  }
}
//rectangle data for renderers and colliders
class Rectangle {
  constructor(r, w, h) {
    this.type = "rectangle";
    [this.r, this.w, this.h] = [r, w, h];
  }
}
//shape data for renderers and colliders
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
//renderTool class renders a variety of classes onto the given canvas.
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
    if(img.type === "img") {
      this.canvas.cx.drawImage(img.img, ((img.x / this.zoom) * fc.x) - ((img.w / this.zoom) / 2), ((img.y / this.zoom) * fc.y) - ((img.h / this.zoom) / 2), img.w / this.zoom, img.h / this.zoom);
    } else {
      this.canvas.cx.drawImage(img.img, (img.activeTile.x * img.tw) + 0.1, (img.activeTile.y * img.th) + 0.1, img.tw - 0.2, img.th - 0.2, ((img.x / this.zoom) * fc.x) - ((img.w / this.zoom) / 2), ((img.y / this.zoom) * fc.y) - ((img.h / this.zoom) / 2), img.w / this.zoom, img.h / this.zoom);
    }
    //restore canvas
    this.canvas.cx.restore();
  }
  //render text
  renderText(pair, text, fill) {
    this.canvas.cx.textAlign = text.alignment;
    this.canvas.cx.textBaseline = "middle";
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
//toolkit class handles a variety of functions, including trigonometry, collisions, and general pair math
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
  //performs non mutative math on two pairs
  pairMath(pair1, pair2, operation) {
    switch(operation) {
      case "add":
        return new Pair(pair1.x + pair2.x, pair1.y + pair2.y);
      case "subtract":
        return new Pair(pair1.x - pair2.x, pair1.y - pair2.y);
      case "multiply":
        return new Pair(pair1.x * pair2.x, pair1.y * pair2.y);
      case "divide":
        return new Pair(pair1.x / pair2.x, pair1.y / pair2.y);
      case "modulus":
        return new Pair(pair1.x % pair2.x, pair1.y % pair2.y);
      case "distance":
        return Math.sqrt(Math.pow(pair1.x - pair2.x, 2) + Math.pow(pair1.y - pair2.y, 2));
      case "angle":
        return Math.round(Math.atan2(pair1.y - pair2.y, pair1.x - pair2.x) * 57.2958) + 180;
    }
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
//tile based pathfinding class, takes in a grid matrix of tile objects
class PathfindingController {
  constructor(grid, allowDiagonals) {
    //the matrix of tiles to pathfind across
    this.grid = grid;
    this.allowDiagonals = allowDiagonals;
  }
  heuristic(a, b) {
    if(this.allowDiagonals) {
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return (dx < dy) ? 0.4 * dx + dy : 0.4 * dy + dx;
    } else {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
  }
  getNeighborIndices(index, closed, nonwalkableIndices) {
    let neighbors = [];
    for(let x = -1; x <= 1; x++) {
      if(index.x + x >= this.grid.length || index.x + x < 0) {
        continue;
      }
      for(let y = -1; y <= 1; y++) {
        if(index.y + y >= this.grid[0].length || index.y + y < 0) {
          continue;
        }
        if(x !== 0 && y !== 0 && !this.allowDiagonals) {
          continue;
        }
        let selectedTile = this.grid[index.x + x][index.y + y];
        nonwalkableIndices.forEach((nwIndex) => {
          if(nwIndex.isEqualTo({x: index.x + x, y: index.y + y})) {
            selectedTile = undefined;
          }
        });
        if(selectedTile !== undefined && (!selectedTile.index.isEqualTo(index)) && !closed.has(this.toKey(selectedTile.index))) {
          neighbors.push(selectedTile.index);
        }
      }
    }
    return neighbors;
  }
  pathfind(originIndex, targetIndex, nonwalkableIndices, loopCap) {
    //nodes to be evaluated list
    const open = [new PathNode(this, null, originIndex, targetIndex)];
    //nodes already evaluated list initialised with start node
    const closed = new Set();
    //current set to start node
    let current;
    //loop limiter
    let loopCount = 0;
    //return null if at target
    if(originIndex.isEqualTo(targetIndex)) {
      return null;
    }
    nonwalkableIndices.forEach((nwIndex) => {
      if(nwIndex.isEqualTo(targetIndex)) {
        return null;
      }
    });
    //while there are nodes to be evaluated
    while(open.length > 0) {
      //checks loop count
      loopCount++;
      if(loopCount > loopCap) {
        return null;
      }
      //sort list by transform, then by f, then by h
      open.sort((a, b) => {
        if (a.index.isEqualTo(b.index)) {
          if (a.f !== b.f) {
            return a.f - b.f;
          } else {
            return a.h - b.h;
          }
        } else {
          if (a.index.x !== b.index.x) {
            return a.index.x - b.index.x;
          } else {
            return a.index.y - b.index.y;
          }
        }
      });
      //delete alike transforms
      let currentOpenI = open[0].index;
      for(let oi = 1; oi < open.length; oi++) {
        if(open[oi].index.isEqualTo(currentOpenI)) {
          open.splice(oi, 1);
          oi--;
        } else {
          currentOpenI = open[oi].index;
        }
      }
      //best node option tracker
      let bestNode = null;
      //check each open node
      open.forEach((pathNode) => {
        //if the current path node is better than the best yet
        if(bestNode === null || pathNode.f < bestNode.f || (pathNode.f === bestNode.f && pathNode.h < bestNode.h)) {
          //reassign best to the new best
          bestNode = pathNode;
        }
      });
      //assign current to best node
      current = bestNode;
      //add current to closed
      closed.add(this.toKey(current.index));
      //remove current from open
      for(let node = 0; node < open.length; node++) {
        if(open[node] === current) {
          open.splice(node, 1);
          break;
        }
      }
      //if target reached
      if(current.index.isEqualTo(targetIndex)) {
        let path = [];
        let pathObj = current;
        while(pathObj.parentNode !== null) {
          path.push(pathObj.index);
          pathObj = pathObj.parentNode;
        }
        return path.reverse();
      }
      //add valid neighbors to open
      this.getNeighborIndices(current.index, closed, nonwalkableIndices).forEach((neighborIndex) => {
        open.push(new PathNode(this, current, neighborIndex, targetIndex));
      });
    }
    return null;
  }
  toKey(index) {
    return index.x + "," + index.y;
  }
}
//pathfinding node class to track pathfind progress
class PathNode {
  constructor(controller, parentNode, index, targetIndex) {
    //PathingController object this node is attached to
    this.controller = controller;
    //parent node object, or null if this is the first node
    this.parentNode = parentNode;
    //target index
    this.targetIndex = targetIndex;
    //this node's index
    this.index = index;
    //path distance from start to this node
    this.g = (parentNode === null) ? 0 : (parentNode.g + controller.heuristic(parentNode.index, this.index));
    //heuristic distance from this node's index to target index
    this.h = controller.heuristic(this.index, targetIndex);
    //attractiveness score composed of above values
    this.f = this.g + this.h;
  }
}
//advanced timer class
class GameTimer {
  constructor(func, interval) {
    this.timer = null;
    this.interval = interval;
    this.lastTime = new Date();
    this.func = func;
    this.deltaTime = 0;
  }
  update() {
    let currentTime = new Date()
    this.deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.func()
  }
  stop() {
    window.clearInterval(this.timer);
    this.timer = null;
  }
  start() {
    this.timer = window.setInterval(this.update.bind(this), this.interval);
  }
}
//scheme for all tiles
class TileScheme {
  constructor(renderTool, primaryFill, innerBorder, outerBorder, textFill) {
    this.renderTool = renderTool;
    this.primaryFill = primaryFill;
    this.innerBorder = innerBorder;
    this.outerBorder = outerBorder;
    this.textFill = textFill;
  }
}
//blank tile
class BlankTile extends TileScheme {
  constructor(tileScheme, transform, dimensions) {
    super(tileScheme.renderTool, tileScheme.primaryFill, tileScheme.innerBorder, tileScheme.outerBorder, tileScheme.textFill);
    this.transform = transform;
    this.dimensions = dimensions;
  }
  render() {
    this.renderTool.renderRectangle(this.transform, new Rectangle(0, this.dimensions.x, this.dimensions.y), this.primaryFill, this.innerBorder);
    this.renderTool.renderRectangle(this.transform, new Rectangle(0, this.dimensions.x + ((this.innerBorder.w + this.outerBorder.w) / 2), this.dimensions.y + ((this.innerBorder.w + this.outerBorder.w) / 2)), null, this.outerBorder);
  }
}
//textbox tile takes in a textnode with the entirety of the text inside
class Textbox extends TileScheme {
  constructor(tileScheme, transform, dimensions, sourceText) {
    super(tileScheme.renderTool, tileScheme.primaryFill, tileScheme.innerBorder, tileScheme.outerBorder, tileScheme.textFill);
    this.transform = transform;
    this.dimensions = dimensions;
    this.textLines = [];
    this.textTransform;
    //get line position
    switch(sourceText.alignment) {
      case "left":
        this.textTransform = this.transform.duplicate().add({x: (this.dimensions.x * 0.95) / -2, y: (this.dimensions.y * 0.85) / 2});
        break;
      case "right":
        break;
      default:
    }
    //set accumulators
    let nextLine;
    const splitText = sourceText.text.split(" ");
    //split text into lines
    while(splitText.length > 0) {
      nextLine = new TextNode(sourceText.font, "", sourceText.r, sourceText.size, sourceText.alignment);
      while(nextLine.measure(this.renderTool) + new TextNode(sourceText.font, splitText[0], sourceText.r, sourceText.size, sourceText.alignment).measure(this.renderTool) < this.dimensions.x * 0.95) {
        nextLine.text += splitText.shift() + " ";
      }
      this.textLines.push(nextLine);
    }
  }
  render() {
    this.renderTool.renderRectangle(this.transform, new Rectangle(0, this.dimensions.x, this.dimensions.y), this.primaryFill, this.innerBorder);
    this.renderTool.renderRectangle(this.transform, new Rectangle(0, this.dimensions.x + ((this.innerBorder.w + this.outerBorder.w) / 2), this.dimensions.y + ((this.innerBorder.w + this.outerBorder.w) / 2)), null, this.outerBorder);
    for(let line = 0; line < this.textLines.length; line++) {
      this.renderTool.renderText(this.textTransform.duplicate().add(new Pair(0, line * -this.textLines[line].size)), this.textLines[line], this.textFill);
    }
  }
}