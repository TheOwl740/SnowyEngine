# Snowy Game Engine
A JavaScript Game Development Engine using the HTML canvas. Welcome to the documentation.

## How to Apply to Your Code
Applying the modules to your code is very simple. First, run the script on your HTML document. This will only initialise the classes and will not affect your code. Every module primarily is a library of methods stored in a class. In order to start using the module, simply construct an object from the class, apply it to a reference variable and call functions from it.

## Modules
The engine is based on 5 core modules with different utilities. These are the Canvas, Timer, Sound, Input and Math modules. Each has it's own category and documentation below.

## Canvas
The core module of JS game development, this class is used to draw images and shapes on an HTML canvas it creates.

### Initialisation
When the canvas element is initialised, it wipes the HTML document and replaces it with a full size canvas.

#### Constructor
This module does not take any parameter values in the constructor.

#### Data
This module applies several initial object properties when a new object is constructed. These are as follows: The **element** property is a reference to the HTML canvas element that the module is based on. The **cx** property is the context for the canvas for raw drawing functions and reference by the class's methods. The **w** and **h** properties are the width and height values, in pixels, for the canvas, respectively.

### Methods
This class contains a large variety of methods.

#### setDimensions(w, h)
This method sets the width and height of the canvas in pixels. Use an int value, or the string **"full"** which covers the screen width.

#### rect(color, alpha, x, y, w, h, r, xOffset, yOffset, lw, filled)
This method draws a rectangle of the specfied **color**, with an opacity float from 0 - 1 defined by **alpha**, at (**x**, **y**) with a width (**w**) and height (**h**) in pixels. The **r** value is the rotation in degrees, the **xOffset** and **yOffset** change the axis of rotation, in relation to the center of the rectangle. The **lw** value defines the line width of the rectangle's border, and the **filled** boolean specifies if the rectangle should be filled with the **color**.

#### createImage(source)
This method returns a new **Image()** object with an srd defined by the **source** parameter. This object is used to draw single images, but not sprites.

#### image(source, alpha, x, y, w, h, r, xOffset, yOffset, hFlip, vFlip)
This method draws an image from an object, specified by **source**, which was created prior to loading with the **createImage()** method. This image has an opacity float from 0 - 1 defined by **alpha**, is located at (**x**, **y**) with a width of (**w**) and height of (**h**). The **r** value is the rotation in degrees and the **xOffset** and **yOffset** change the axis of rotation, in relation to the center of the rectangle. The **hFlip** and **vFlip** parameters are booleans which when true mirror the image horizontally and vertically, respectively.

#### arc(color, alpha, x, y, radius, start, end, lw, filled)
This method draws an arc of the specified **color**, with an opacity float of 0 - 1, at (**x**, **y**), with a **radius** defined by that parameter. The arc starts at the right point of the circle, and goes from that + the **start** value to the **end** value in degrees. The border width is defined by **lw** and the arc will be **filled** if that parameter is set to true.

## Timer
This modules is used in combination with the canvas module to create animated drawings, or on its own for other purposes. It is used to fire a function at select intervals. If multiple instances of this class are created, each can have their own timer.

### Initialisation

#### Constructor
This module also takes no values in the constructor.

#### Data
Child objects of this module only contain one property: **timerObject**, which is a reference to the interval.

### Methods
This class has two methods.

#### start(speed, updateFunction)
This method creates a new interval which fires at an interval in milliseconds defined by the **speed** parameter.

#### stop()
This method stops the interval from firing and clears it.
