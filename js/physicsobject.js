// SCIENCE

var PhysicsObject = new Class ({
	Implements: [Options, Events],
	
	options : {
		ID: 1,
		startTime: 0,
		clock: 0,
		pos: { x: 0, y: 0 }, // m/s unless noted otherwise
		accel: { x: 0, y: 0 },
		vel: { x: 0, y: 0 },
		elasticity: 0.8,
		mass: 50, // In kg
		mu: 0.5, // Friction coefficient, unitless
		active: true
	},
	
	initialize : function ( el, options ) {
		this.setOptions( options );
		
		this.el = $(el);
		this.elID = el;
		
		this.width = this.el.getStyle( 'width' ).toInt();
		this.height = this.el.getStyle( 'height' ).toInt();
		this.startVel = this.options.vel; // Necessary for friction calculations
	},
	
	moveAbs : function ( x, y ) {
		this.el.setStyles({
			top: y,
			left: x
		});
		
		this.setPos( { x: x, y: y } );
	},
	
	moveRel : function ( x, y ) {
		el.setStyle({
			top: el.getStyle( 'top' ).toInt() + y,
			left: el.getStyle( 'left' ).toInt() + x
		});
	},
	
	// Setters
	setPos : function ( pos ) {
		this.options.pos.x = pos.x;
		this.options.pos.y = pos.y;
	},
	
	setVel : function ( vel ) {
		//this.el.set( 'html', vel.x + ', ' + vel.y );
		this.options.vel = vel;
	},
	
	setAccel : function ( accel ) {
		
	},
	
	setHtml : function ( html ) {
		this.el.set( 'html', html )
	},
	
	setClock : function ( clock ) {
		
	},
	
	// Getters
	getElID : function () {
		return this.elID;
	},
	
	getWidth : function () {
		return this.width;
	},
	
	getHeight : function () {
		return this.height;
	},
	
	getPos : function () {
		return this.options.pos;
	},
	
	getVel :  function () {
		return this.options.vel;
	},
	
	getAccel : function () {
		return this.options.accel;	
	},
	
	getActive : function () {
		return this.options.active;
	},
	
	getElasticity : function () {
		return this.options.elasticity;
	},
	
	getMass : function () {
		return this.options.mass;
	},
	
	getMu : function () {
		return this.options.mu;
	},
	
	getStartVel : function () {
		return this.startVel;	
	},
	
	// Events
	
	stop : function () {
		this.options.active = false;
	},
	
	start : function () {
		this.options.active = true;
	}
});