===================================================
ineedmoretime.org - A HTML5 analog clock experiment
===================================================

The files in this repository represent the full source of the website
`http://ineedmoretime.org`__.

__ http://ineedmoretime.org

This page has been created to experiment in creating a nice looking analog
clock only using HTML5 features.

The `Raphael Javascript library`__ as well as jQuery__ is used to realize the
clock with all its nice animation effects.

__ http://raphaeljs.com 
__ http://jquery.com

Usage
=====

If you want to use this clock in your own environment you need to load jQuery
as well as Raphael js. Finally the file ``src/clock.js`` needs to be evaluated.
After it has been loaded a ``Clock`` object is ready for use. Simple instantiate
such an object providing a CSS selector to a container element to position the
clock in, followed by an optional options object. For possible objects look
into the source code of the clock itself. The names are pretty
self-explanatory.

The method ``moveBack`` can be used to *rewind* the clock ``x`` hours. This
method has mainly been implemented to play a little with the animation
capabilities of Raphael.

A simple usage example could look something like this::

    var clock = new Clock( "#clock-container" );


Reasons for publishing
======================

I published this source code hoping that somebody might find this stuff useful
in some way. I wrote this stuff just for fun and to experiment with some HTML5
features, as well as to play with Raphael js.
