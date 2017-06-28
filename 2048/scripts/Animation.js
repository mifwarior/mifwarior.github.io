define(function () {
    function Animation(anim)
	{
		var time = 1;
		this.done = true;
		this.speed = 1;
		this.onend;
		this.Update = function(dt)
		{
			if(time < 1)
			{	
				time += dt*this.speed;
				time = Math.min(time,1);
				this.done = time === 1;
				if(anim !== undefined) anim(time);
				if(this.done && this.onend !== undefined) this.onend();
			}
		}
		this.Start = function()
		{
			time = 0;
		}
		
	}

    return Animation;
});