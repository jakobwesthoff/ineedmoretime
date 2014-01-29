/**
 * Copyright 2010 Jakob Westhoff. All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 *    1. Redistributions of source code must retain the above copyright notice,
 *       this list of conditions and the following disclaimer.
 * 
 *    2. Redistributions in binary form must reproduce the above copyright notice,
 *       this list of conditions and the following disclaimer in the documentation
 *       and/or other materials provided with the distribution.
 * 
 * THIS SOFTWARE IS PROVIDED BY JAKOB WESTHOFF ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
 * EVENT SHALL JAKOB WESTHOFF OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * The views and conclusions contained in the software and documentation are those
 * of the authors and should not be interpreted as representing official policies,
 * either expressed or implied, of Jakob Westhoff
**/
(function($) {
    var Clock = window.Clock = function( target, options ) {
        this.options = $.extend({
            background: 'images/clock-background.png',
            width: 265,
            height: 265,
            minuteArmColors: {
                light: "#555753",
                dark: "#000000"
            },
            hourArmColors: {
                light: "#555753",
                dark: "#000000"
            },
            secondArmColors: {
                light: "#ef2929",
                dark: "#4f0000"
            },
            dotColors: {
                light: "#2e3436",
                dark: "#000000"
            },
            minuteArmDimensions: {
                thickness: 6,
                length: 90
            },
            hourArmDimensions: {
                thickness: 6,
                length: 60
            },
            secondArmDimensions: {
                thickness: 4,
                length: 100
            }
        }, options );

        this.offset = 0;

        this.midX = Math.floor( this.options.width / 2 );
        this.midY = Math.floor( this.options.height / 2 );

        this.currentHour = 0;
        this.currentMinute = 0;
        this.currentSecond = 0;

        this.currentHourRotation = 0;
        this.currentMinuteRotation = 0;
        this.currentSecondRotation = 0;

        this.target = $( target );
        this.paper = Raphael( 
            this.target.get( 0 ),
            this.options.width, 
            this.options.height
        );

        // Init the background
        this.background = this.paper.image( 
            this.options.background,
            0, 0,
            this.options.width, this.options.height
        );

        // Init the clock arms
        this.hourArm = this._createArm( 
            this.options.hourArmDimensions,
            this.options.hourArmColors
        );
        this.minuteArm = this._createArm( 
            this.options.minuteArmDimensions,
            this.options.minuteArmColors
        );
        this.secondArm = this._createArm( 
            this.options.secondArmDimensions,
            this.options.secondArmColors
        );

        // Create the dot in the middle
        this.paper.circle(
            this.midX,
            this.midY,
            8
        ).attr({
            stroke: "",
            gradient: [
                "r(0.25, 0.25)", 
                this.options.dotColors.light, 
                "-", this.options.dotColors.dark
            ].join( "" ) 
        });

        // Initiate updates for every second
        this._registerInterval( 1000 );
    }

    Clock.prototype = {
        /**
         * Create an arm of the clock with the given dimensions and colors
         */
        _createArm: function( dimensions, color ) {
            var x = Math.floor( ( this.options.width - dimensions.thickness ) / 2 ),
                y = this.midY - dimensions.length;
           
            return this.paper.rect( 
                x, y,
                dimensions.thickness, dimensions.length
            ).attr({
                gradient: ["0-", color.dark, "-", color.light, ":50-", color.dark].join(""),
                stroke: "",
                rotation: "0"
            });
        },

        /**
         * Set the correct rotation for every layer based on the current time 
         */
        _updateTime: function( initial ) {
            var t      = new Date( (new Date()).getTime() - (this.offset * 1000) ),
                hour   = t.getHours(),
                minute = t.getMinutes(),
                second = t.getSeconds(),
                // 12 Hours a day on a 360° scale make 30° for every hour. We add
                // 0.5 degrees per minute to allow for smooth adaption. On the
                // other hand we only want 6 degree "jumps" because they represent
                // the markers.
                hourRotation   = ( hour * 30 ) + minute * 0.5 - ( minute * 0.5 % 6 ),
                // 60 minutes a hour on 360° scale make 6° for every minute.
                minuteRotation = minute * 6,
                // 60 seconds a minute on a 360° scale make 6° for every second
                secondRotation = second * 6,
                easing = "bounce",
                durationSecond = 500,
                durationMinute = 500,
                durationHour   = 500;

            // We need a 12 hour scale to calculate the rotation easily
            // There will still be 0 and 12 hours but this does not make a
            // difference for the rotation calculation.
            hour = hour > 12 ? hour - 12 : hour;

            // Fix orientation of the different arms, if they are crossing the
            // zero border. This is needed because Raphael does calculate an
            // animation into the wrong direction otherwise.
            if ( secondRotation == 6 ) {
                this.secondArm.rotate( 0.000001, this.midX, this.midY );
            }
            if ( secondRotation == 0 && minuteRotation == 6 ) {
                this.minuteArm.rotate( 0.000001, this.midX, this.midY );
            }
            if ( secondRotation == 0 && minuteRotation == 72 && hourRotation == 6 ) {
                this.hourArm.rotate( 0.000001, this.midX, this.midY );
            }

            this.secondArm.animate({
                rotation: [ secondRotation == 0 ? 360 : secondRotation, this.midX, this.midY ].join( " " )
            }, durationSecond, easing );
            
            this.minuteArm.animateWith( this.secondArm, {
                rotation: [ minuteRotation == 0 ? 360 : minuteRotation, this.midX, this.midY ].join( " " )
            }, durationMinute, easing );

            this.hourArm.animateWith( this.minuteArm, {
                rotation: [ hourRotation == 0 ? 360 : hourRotation, this.midX, this.midY ].join( " " )
            }, durationHour, easing );

            this.currentHour = hour;
            this.currentHourRotation = hourRotation;

            this.currentMinute = minute;
            this.currentMinuteRotation = minuteRotation;
            
            this.currentSecond = second;
            this.currentSecondRotation = secondRotation;
        },
        
        /**
         * Modify the clock offset and animate the change to this offset
         */ 
        moveBack: function( hours ) {
            var offset = hours * 3600,
                realChange = offset + this.offset,
                minutes = Math.floor(offset / 60),
                rounds  = Math.floor(minutes / 60),
                duration         = 10 * minutes,
                durationPerRound = Math.floor(duration / rounds);

            window.clearInterval( this.interval );

            // The following animation cycle will be executed:
            // - Rotate the secondArm to 12 o'clock
            // - Rotate the minuteArm one full circle for each round, while
            //   correcttly moving the hourArm along.
            // - _updateTime
            this.secondArm.animate({
                rotation: ["0", this.midX, this.midY].join( " " )
            }, (this.currentSecond) * 15, jQuery.proxy( function() {
                this._animateRounds( rounds, durationPerRound, jQuery.proxy( function() {
                    this.offset = realChange;
                    this._registerInterval( 1000 );
                }, this ) );
            }, this ));
        },
        
        /**
         * Rotate one hour back
         */
        _animateRounds: function( rounds, durationPerRound, fn ) {
            var oneRoundFx = jQuery.proxy( function() {
                if ( rounds-- > 0 ) {
                    this.minuteArm.animate({
                        rotation: [this.currentMinuteRotation - 360, this.midX, this.midY].join( " " ) 
                    }, durationPerRound, jQuery.proxy( function() {
                        this.minuteArm.rotate( this.currentMinuteRotation, this.midX, this.midY );
                        this.currentHourRotation -= 30;
                        oneRoundFx();
                    }, this ));
                    this.hourArm.animateWith( this.minuteArm, {
                        rotation: [this.currentHourRotation - 30, this.midX, this.midY].join( " " )
                    }, durationPerRound);
                }
                else {
                    fn();
                }
            }, this );
            oneRoundFx();
        },
        
        /**
         * Retrieve the current offset
         */
        getOffset: function() {
            return this.offset;
        },

        /**
         * Register the _updateTime method to be called every second.
         */
        _registerInterval: function( delay ) {
            // A delay can be specified between the call to this function and
            // the first time update
            delay = delay || 1000;
            window.setTimeout( jQuery.proxy( function() {
                this._updateTime( true );

                this.interval = window.setInterval( jQuery.proxy( function() {
                    this._updateTime();
                }, this ), 1000 );
            }, this ), delay );
        }
    }
})(jQuery);
