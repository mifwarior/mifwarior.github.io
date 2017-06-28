define(function () {
    
	function Input(params)
	{
        this.OnInput = function (x, y) { console.log(x, y);};
		var self = this;
		var useKeyboar = params.keyboard || false;
		var useMouse = params.mouse || false;
		var useTouch = params.touch || false;
		var element = params.element || document;
		
		var xAxis = 0;
		var yAxis = 0;
		var endInput = true;
		var treshold = 50;
		
		var mousePos ={x:0,y:0};
		var touchPos ={x:0,y:0};
		
		if (window.navigator.msPointerEnabled) 
		{
			//Internet Explorer 10 style
			this.eventTouchstart    = "MSPointerDown";
			this.eventTouchmove     = "MSPointerMove";
			this.eventTouchend      = "MSPointerUp";
		} 
		else 
		{
			this.eventTouchstart    = "touchstart";
			this.eventTouchmove     = "touchmove";
			this.eventTouchend      = "touchend";
		}
		
		
		function TouchStart(ev)
		{
			if (!window.navigator.msPointerEnabled && ev.touches.length > 1 || ev.targetTouches.length > 1) 
			{
				return; // Ignore if touching with more than 1 finger
			}
	
			endInput = false;
			touchPos.x = ev.clientX;
			touchPos.y = ev.clientY;
			
			if (window.navigator.msPointerEnabled) 
			{
			  touchPos.x = ev.pageX;
              touchPos.y = ev.pageY;
			} 
			else 
			{
                touchPos.x = ev.touches[0].clientX;
                touchPos.y = ev.touches[0].clientY;
			}

			//ev.preventDefault();
		}
		function TouchEnd(ev)
		{
		    if (!window.navigator.msPointerEnabled && ev.touches.length > 0 ||
				ev.targetTouches.length > 0) {
			  return; // Ignore if still touching with one or more fingers
			}
 
			endInput = true;
		}
		function TouchCancel(ev)
		{
			endInput = true;
		}
		function TouchMove(ev)
		{
			if(!endInput)
			{

				var x = 0;
				var y = 0;
				
				if (window.navigator.msPointerEnabled) 
				{
				  x = ev.pageX;
				  y = ev.pageY;
				} 
				else 
				{
				  x = ev.changedTouches[0].clientX;
				  y = ev.changedTouches[0].clientY;
			  	}
				
				x = touchPos.x - x;
				y = touchPos.y - y;


				if( Math.abs(x) > treshold )
				{
					endInput = true;
					x = Clamp(-1,1,-x);
					self.OnInput(x,0);
				}
				else if(Math.abs(y) > treshold)
				{
					endInput = true;
					y = Clamp(-1,1,y);
					self.OnInput(0,y);
				}
			}
		}
		
		function MouseDown(ev)
		{
			endInput = false;
			mousePos.x = ev.clientX;
			mousePos.y = ev.clientY;
		}
		function MouseUp(ev)
		{
			endInput = true;
		}
		function MouseMove(ev)
		{
			if(!endInput)
			{
				var x = mousePos.x - ev.clientX;
				var y = mousePos.y - ev.clientY;
				if( Math.abs(x) > treshold )
				{
					endInput = true;
					x = Clamp(-1,1,-x);
					self.OnInput(x,0);
				}
				else if(Math.abs(y) > treshold)
				{
					endInput = true;
					y = Clamp(-1,1,y);
					self.OnInput(0,y);
				}
			}
		}
		
		function Clamp(min,max,value)
		{
			return Math.min(max,Math.max(min,value));
		}
		
		if(useTouch)
		{
			element.addEventListener( this.eventTouchstart, TouchStart);
			element.addEventListener( this.eventTouchend, TouchEnd);
			//element.addEventListener( "touchcancel",TouchCancel );
			element.addEventListener( this.eventTouchmove, TouchMove );
		}
		if(useKeyboar)
		{
			document.addEventListener("keydown",function(ev){
			if(ev.keyCode === 65) self.OnInput(-1,0);//MoveLeft;
			if(ev.keyCode === 68) self.OnInput(1,0); //MoveRight;
			if(ev.keyCode === 87) self.OnInput(0,1); //MoveUp;
			if(ev.keyCode === 83) self.OnInput(0,-1);//MoveDown;
			});
		}
		if(useMouse)
		{
			element.addEventListener( "mousedown", MouseDown, true);
			element.addEventListener( "mouseup",MouseUp, true );
			element.addEventListener( "mousemove", MouseMove, true );
		}
		
	}
    return Input;
});