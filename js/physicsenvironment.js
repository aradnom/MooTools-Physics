// SCIENCE

var PhysicsEnvironment = new Class ({
	Implements : [Options, Events],
	
	options : {
		ID: 1,
		pixel_density: 3500, // Standard pixel density per meter
		accel: { x: 0, y: 0.5 },  // Standard acceleration, m/s
		timeScale: 0.02,
		startTime: 0,
		frames: 40,
		collisions: true,
		friction: true,
		simpleFriction: false,
		active: true,
		draggable: true
	},
	
	initialize : function ( el, objects, options ) {
		this.setOptions( options );
		
		this.el = $(el);
		
		// Window properties
		this.screenHeight = screen.height;
		this.screenWidth = screen.width;
		this.windowHeight = window.getSize().y;
		this.windowWidth = window.getSize().x;
		this.elHeight = this.el.getSize().y;
		this.elWidth = this.el.getSize().x;
		
		this.objects = objects;
		
		// Start the periodical clock
		this.startClock();
		
		// Set up draggable object if requested
		if ( this.options.draggable )
			this.startDraggable();
	},
	
	stop : function () {
		if ( this.clockRef )
			clearInterval( this.clockRef );
		this.options.startTime = 0;			
		this.options.active = false;
	},
	
	start : function () {
		this.startClock();
		this.options.active = true;
	},
	
	startClock : function () {
		this.clockRef = this.updateClock.periodical((1000 / this.options.frames), this); 
	},
	
	updateClock : function () {
		this.options.startTime = this.options.startTime + ( this.options.timeScale * (1 / this.options.frames) );
		this.updateObjects();
	},
	
	addObject : function ( object ) {
		this.objects.push( object );
	},
	
	updateObjects : function () {
		if ( this.objects.length > 0 ) {
			this.objects.each ( function (el) {
				if ( el.getActive() ) {
					// Basic object velocity and acceleration calcs
					if ( el.getPos().x < this.elWidth && el.getPos().y < this.elHeight ) {
						// Current acceleration is a sum of the environment accel (gravity) + any accel
						// the object itself has
						var accel = {
							x: this.options.accel.x + el.getAccel().x,
							y: this.options.accel.y + el.getAccel().y
						};
						
						var vel = {
							x: el.getVel().x + (accel.x * this.options.startTime),
							y: el.getVel().y + (accel.y * this.options.startTime)
						}	
						
						// Temp output
						//el.setHtml( left );
						//el.setHtml( this.options.startTime );
						
						// Update velocity before position is calculated
						el.setVel( vel );					
						
						var left = 
							el.getPos().x + 
							((el.getVel().x * this.options.pixel_density) * this.options.startTime) + 
							(0.5 * (this.options.accel.x * this.options.pixel_density) * Math.pow(this.options.startTime, 2));
						
						var top = 
							el.getPos().y + 
							((el.getVel().y * this.options.pixel_density) * this.options.startTime) + 
							(0.5 * (this.options.accel.y * this.options.pixel_density) * Math.pow(this.options.startTime, 2));								
						
						// Move object according to the junk above.  If pos is out of bounds, assume we hit the floor/wall					
						if ( (left + el.getWidth()) > this.elWidth ) {	
							left = this.elWidth - el.getWidth();
							el.setVel( {x: -vel.x * el.getElasticity(), y: el.getVel().y} );
						}
						
						if ( left < 0 ) {
							left = 0;
							el.setVel( {x: -vel.x * el.getElasticity(), y: el.getVel().y} );
						}
						
						if ( (top + el.getHeight()) > this.elHeight ) {
							top = this.elHeight - el.getHeight();	
							el.setVel( {x: el.getVel().x, y: -vel.y * el.getElasticity()} );
						}

						if ( top < 0 ) {							
							top = 0;
							el.setVel( {x: el.getVel().x, y: -vel.y * el.getElasticity()} );
						}
						
						el.moveAbs( left, top );					
					}
				}					
			}, this );
			
			if ( this.options.friction )
				this.updateFriction();
			
			if ( this.options.collisions )
				this.updateCollisions();
		}
	},
	
	updateFriction : function () {
		this.objects.each ( function (el) {
			// Floor friction
			if ( el.getPos().y + el.getHeight() >= this.elHeight ) {
				if ( this.options.simpleFriction )
					el.setVel({ x: el.getVel().x * el.getMu(), y: el.getVel().y });
				else {
					if ( Math.abs( el.getVel().x ) > 0.01 ) {
						var downForce = this.options.accel.y * el.getMass();
						var frictionForce = el.getMu() * downForce;
						var objectForce = (el.getMass() * el.getStartVel().x) + (el.getMass() * el.getAccel().x);
						var netForce = objectForce - frictionForce;
						var drag = netForce / el.getMass();
						
						// If netForce < 0, this means initial accel would not be enough to overcome to force of 
						// friction, so the object would simply stop completely
						var vel = netForce > 0 ? 
						{
							x: el.getVel().x > 0 ? 
								el.getVel().x - (drag * this.options.startTime) : 
								el.getVel().x + (drag * this.options.startTime),
							y: el.getVel().y
						} : { 
							x: 0, 
							y: el.getVel().y 
						};	
										
						//el.setHtml( drag );
						el.setVel( vel );						
					} else {
						el.setVel({ x: 0, y: el.getVel().y });
					}
				}				
			}
		}, this);
	},
	
	updateCollisions :  function () {		
		this.objects.each ( function (el) {
			this.objects.each ( function (el2) {
				if ( el2 != el ) {	
					if ( 
					((el.getPos().y + el.getHeight()) >= el2.getPos().y) &&
					(el.getPos().y <= (el2.getPos().y + el2.getHeight())) &&
					((el.getPos().x + el.getWidth()) >= el2.getPos().x) &&
					(el.getPos().x <= (el2.getPos().x + el2.getWidth()))
					) {
						if ( (el.getPos().y + el.getHeight()) > el2.getPos().y ) {
							this.calculate2DCollision( el, el2 );
						}
						
						//if ( (el.getPos().x + el.getHeight()) > el2.getPos().x )
							//el.setHtml( 'x' );
							/*el.setPos({ 
								x: el.getPos().x, 
								y: el.getPos().y - ((el.getPos().y + el.getHeight()) - el2.getPos().y)
							});*/
						//el.setVel( {x: -el.getVel().x, y: -el.getVel().y} );
							
						//el2.setHtml( 'boom' );
					} else {
						//el.setHtml( '' );
					}
					
					
									
					/*// Right of first element to left of second
						
					if ( this.ballpark( el.getPos().x + el.getWidth(), el2.getPos().x )
						&& ( el2.getPos().y >= el.getPos().y 
						&& el2.getPos().y < (el.getPos().y + el.getHeight()) ) ) {
							el.setVel( {x: -el.getVel().x, y: el.getVel().y} );
							el2.setVel( {x: -el2.getVel().x, y: el2.getVel().y} );
					}
					
					// Bottom of first element to top of second
					
					if ( this.ballpark( el.getPos().y + el.getHeight(), el2.getPos().y )
						&& ( el2.getPos().x >= el.getPos().x 
						&& el2.getPos().x < (el.getPos().x + el.getWidth()) ) ) {
							el.setVel( {x: el.getVel().x, y: -el.getVel().y} );
							el2.setVel( {x: el2.getVel().x, y: -el2.getVel().y} );
							//el.setHtml( "bang" );
					}
					
					// Left of first element to right of second
					
					if ( this.ballpark( el.getPos().x, el2.getPos().x + el2.getWidth() )
						&& ( el2.getPos().y >= el.getPos().y 
						&& el2.getPos().y < (el.getPos().y + el.getHeight()) ) ) {
							el.setVel( {x: -el.getVel().x, y: el.getVel().y} );
							el2.setVel( {x: -el2.getVel().x, y: el2.getVel().y} );
							//el.setHtml( "bang" );
					}
					
					// Top of first element to bottom of second
					
					if ( this.ballpark( el.getPos().y, el2.getPos().y + el2.getHeight() )
						&& ( el2.getPos().x + el2.getWidth() >= el.getPos().x 
						&& el2.getPos().x < (el.getPos().x + el.getWidth()) ) ) {
							el.setVel( {x: el.getVel().x, y: -el.getVel().y} );
							el2.setVel( {x: el2.getVel().x, y: -el2.getVel().y} );
							//el.setHtml( "bang" );
					}*/
				}
					
			}, this);
		}, this );
	},
	
	calculate2DCollision : function ( el1, el2 ) {
		el1Pos = el1.getPos(); // Initial positions of el1 and el2
		el2Pos = el2.getPos();		
		
		var el1Vel = { // Initial element velocity
			x: el1.getVel().x,
			y: el1.getVel().y
		} 
		
		var el2Vel = {
			x: el2.getVel().x,
			y: el2.getVel().y
		}
		
		el1Mass = el1.getMass(); // Element mass
		el2Mass = el2.getMass();
		
		el1Axis = { // Collision axes for both elements
			x: el1Pos.x - el2Pos.x,
			y: el1Pos.y - el2Pos.y
		}
		
		el2Axis = {
			x: el2Pos.x - el1Pos.x,
			y: el2Pos.y - el1Pos.y
		}		
		
		this.normalize( el1Axis ); // Normalized to provide a velocity component for each axis
		this.normalize( el2Axis );	
		
		el1InitVel = el1Vel * el1Axis; // Provides a normalized velocity component for each axis
		el2InitVel = el2Vel * el2Axis;
		
		el1InitVel = {
			x: el1Vel.x * el1Axis.x,
			y: el1Vel.y * el1Axis.y	
		}
		
		el2InitVel = {
			x: el2Vel.x * el2Axis.x,
			y: el2Vel.y * el2Axis.y	
		}		
		
		el1Vel.x -= ( el1Axis.x * el1InitVel.x ); // Remove normalized velocity component along collision axis
		el1Vel.y -= ( el1Axis.y * el1InitVel.y );		
		el2Vel.x -= ( el2Axis.x * el2InitVel.x );
		el2Vel.y -= ( el2Axis.y * el2InitVel.y );
		
		// 1-dimensional collision calculations, not a perfect calculation of 2d collision but good enough
		// for government work /shrug
		el1FinalVel = {
			x: ( el1InitVel.x * (el1Mass - el2Mass ) + 2 * el2Mass * el2InitVel.x ) / (el1Mass + el2Mass),
			y: ( el1InitVel.y * (el1Mass - el2Mass ) + 2 * el2Mass * el2InitVel.y ) / (el1Mass + el2Mass)
		}
		el2FinalVel = {
			x: ( el2InitVel.x * (el2Mass - el1Mass ) + 2 * el1Mass * el1InitVel.x ) / (el1Mass + el2Mass),
			y: ( el2InitVel.y * (el2Mass - el1Mass ) + 2 * el1Mass * el1InitVel.y ) / (el1Mass + el2Mass)	
		}		
		
		el1Axis.x *= el1FinalVel.x; // Multiply back into velocity along element axis
		el1Axis.y *= el1FinalVel.y;
		el2Axis.x *= el2FinalVel.x;
		el2Axis.y *= el2FinalVel.y;		
		
		el1Vel.x += el1Axis.x; // And add new velocity back into original minus velocity directly along axis
		el1Vel.y += el1Axis.y;
		el2Vel.x += el2Axis.x;
		el2Vel.y += el2Axis.y;
		
		el1.setHtml( el1Vel.x );
		el2.setHtml( el2Vel.x );
		
		el1.setVel( el1Vel );
		el2.setVel( el2Vel );		
	},
	
	startDraggable : function () {
		var thisGuy = this;
		
		this.objects.each ( function (object) {
			new Drag( object.getElID(), {
				onStart : function () {
					thisGuy.stop();
				},
				onComplete : function (el) {
					thisGuy.start();
					object.setPos({ x: el.getStyle('left').toInt(), y: el.getStyle('top').toInt() });
				}
			});
		}, this);
	},
	
	// Getter functions
	getClock : function () {
		return this.options.startTime++;
	},
	
	getActive : function () {
		return this.options.active;
	},
	
	// Setters
	
	setActive : function ( true_or_false ) {
		this.options.active = true_or_false ? true : false;
	},
	
	// Helper functions
	
	// Used in collisions
	ballpark : function ( first, second, ballpark ) {
		return Math.abs( first - second ) < ballpark ? true : false;
	},
	
	normalize : function ( vector ) {
		magnitude = Math.sqrt( Math.pow( vector.x, 2 ) + Math.pow( vector.y, 2 ) );
		vector.x = vector.x / magnitude;
		vector.y = vector.y / magnitude;	
	}	
});