<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>Untitled Document</title>
<script type="text/javascript" src="js/mootools-core-1.3.2-full-compat-yc.js"></script>
<script type="text/javascript" src="js/mootools-more-1.3.2.1-yc.js"></script>
<script type="text/javascript" src="js/physicsobject.js"></script>
<script type="text/javascript" src="js/physicsenvironment.js"></script>
<script type="text/javascript">
var el = 'testdiv';

window.addEvent( 'domready', function () {
	testObj = new PhysicsObject( 'div1', {
		vel : {x: 0.3, y: 0.3},
		pos : {x: 20, y: 0},
		mu: 0.95,
		elasticity: 0.6
	});
	
	testObj2 = new PhysicsObject( 'div2', {
		vel : {x: 0.3, y: -0.3},
		pos : {x: 15, y: 100},
		mu: 0.1
	});
	
	testEnv = new PhysicsEnvironment( 'parent', new Array( testObj, testObj2 ), {
		timeScale: 0.005,
		accel: { x: 0, y: 0.3 },
		simpleFriction: false
	});
});
</script>
<style type="text/css">
#parent {
	width: 600px;
	height: 500px;
	background-color: #00F;
	position: relative;
}

#div1 {
	background-color: #F00;
	width: 40px;
	height: 40px;	
	position: absolute;
	top: 0px;
	left: 0px;
	z-index: 3;
}

#div2 {
	background-color: #0F0;
	width: 50px;
	height: 50px;	
	position: absolute;
	top: 50px;
	left: 200px;
	z-index: 2;
}


</style>
</head>

<body>

<div id="parent">
	<div class="testdiv" id="div1"></div>
	<div class="testdiv" id="div2"></div>
</div>

</body>
</html>