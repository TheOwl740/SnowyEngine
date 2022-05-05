# Snowy Game Engine
A JavaScript Game Development Engine using the HTML canvas. Welcome to the documentation.

## How to Apply to Your Code
Applying the modules to your code is very simple. First, run the script on your HTML document. This will only initialise the classes and will not affect your code. Every module primarily is a library of methods stored in a class. In order to start using the module, simply construct an object from the class, apply it to a reference variable and call functions from it.

## Modules
The engine is based on 5 core modules with different utilities. These are the Canvas, Timer, Sound, Input and Math modules. Each has it's own category and documentation below.

### Canvas
The core module of JS game development, this class is used to draw images and shapes on an HTML canvas it creates.

#### Initialisation
When the canvas element is initialised, it wipes the HTML document and replaces it with a full size canvas.

##### Constructor
This module does not take any parameter values in the constructor.

##### Data
This module applies several initial object properties when a new object is constructed. These are as follows: The **element** property is a reference to the HTML canvas element that the module is based on. The **cx** property is the context for the canvas for raw drawing functions and reference by the class's methods. The **w** and **h** properties are the width and height values, in pixels, for the canvas, respectively.

#### Methods
This class contains a large variety of methods.

### Timer
This modules is used in combination with the canvas module to create animated drawings, or on its own for other purposes. It is used to fire a function at select intervals. If multiple instances of this class are created, each can have their own timer.

#### Initialisation

##### Constructor
This module also takes no values in the constructor.

##### Data
Child objects of this module only contain one property: **timerObject**, which is a reference to the interval.

#### Methods
This class has two methods.

##### start(speed, updateFunction)
This method creates a new interval which fires at an interval in milliseconds defined by the **speed** parameter.

##### stop()
This method stops the interval from firing and clears it.
