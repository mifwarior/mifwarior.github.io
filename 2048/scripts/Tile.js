define(["GameMath"],function (GameMath) {
    return function MapSprite()
	{

		
		this.speed = 5;
		this.position = {x:0, y:0};
		this.target = {x:0, y:0};
		this.value = 0;
		var time = 0;
		
		this.Update = function(dt)
		{
			if(time < 1)
			{	
				time += dt*this.speed;
				time = Math.min(time,1);
				GameMath.LerpV2(this.position,this.target,this.position, time);
			}
		}
		
		this.SetTarget = function(pos)
		{
			time = 0;
			this.target.x = pos.x;
			this.target.y = pos.y;
		}
	}
});