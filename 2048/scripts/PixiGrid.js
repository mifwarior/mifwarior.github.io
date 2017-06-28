define(["Grid","Animation", "PixiTile"], function (Grid,Animation,PixiTile) {
    
	function PixiGrid(size)
	{
		var map = new Grid(size);
		var cells = map.GetCells(function(o){return true;});
		var turnAnimation = new Animation();
		turnAnimation.speed = 4;
		
		this.container = new PIXI.Container();
		this.background = new PIXI.Graphics();
		this.backgroundColor = 0xefefef;
		this.score = 0;
		
		this.container.addChild(this.background);
		
		this.values = [];
		
		this.OnGameOver = function(win,score)
		{
			
		}
		
		this.CalcScore = function()
		{
			var v = map.GetCells(function(o){ return o.values.length > 1;});
			
			for(var i = 0; i < v.length; i++)
			{
					var vls = v[i].values;
					var summ = 0;
					for(var n = 0; n < vls.length; n++)
					{
						summ+=vls[n].value;
						if(n > 0)
						{
							var toRemove = vls.pop();
							toRemove.view.Dispose();
							var ind = this.values.indexOf(toRemove.view);
							if(ind !== -1)
								this.values.splice(ind,1);
						}
					}
					this.score +=summ;
					vls[0].value = summ;
					vls[0].view.ScaleEffect();
			}
		}
		
		this.NextTurn = function()
		{
			this.CalcScore();
			if(this.IsWin())
			{
				this.OnGameOver(true,this.score);
				this.Update(2);
			}
			else if(!this.HaveAvalibaleTurns())
			{
				this.OnGameOver(false,this.score);
				this.Update(2);
			}
			this.GenerateValues();
		}
		
		this.MoveLeft = function() 
		{
			if(turnAnimation.done)
			{	
				map.MoveLeft();
				turnAnimation.Start();
			}
		}
		this.MoveRight = function()
		{
			if(turnAnimation.done)
			{
				map.MoveRight();
				turnAnimation.Start();
			}
		}
		this.MoveUp = function()
		{
			if(turnAnimation.done)
			{
				map.MoveUp();
				turnAnimation.Start();
			}
		}
		this.MoveDown = function()
		{
			if(turnAnimation.done)
			{
				map.MoveDown();
				turnAnimation.Start();
			}
		}
		
		this.GenerateValues = function(count, min,max)
		{
			min = min || 2; max = max || 4;
			count = count || 1; 

			
			var generated = map.GenerateValues(count,min,max);
			
			for(var i = 0; i < generated.length; i++)
			{
				var chip = new PixiTile(generated[i],this.container);
				this.values.push(chip);
			}
		}
		
		turnAnimation.onend = function()
		{
			this.NextTurn();
		}.bind(this);
		
		this.Update = function(dt)
		{
			turnAnimation.Update(dt);
			for(var i = 0; i < this.values.length; i++)
			{
				this.values[i].Update(dt);
			}
		}
		this.HaveAvalibaleTurns = function()
		{
			return map.HaveAvalibaleTurns();
		}
		
		this.IsWin = function()
		{
			var cells = map.GetCells(function(o){ return (o.values.length === 1 && o.values[0].value === 2048) })
			return cells.length > 0;
		}
		
		function DrawCells(graphics,cells,color, addon)
		{
			var size = 50;
			var hSize = size/2;
			var offset = 5;
			var corner = 5;
			graphics.beginFill(color);
			graphics.lineStyle(0, color, 1);
			
			// draw a rounded rectangle
			for(var i = 0; i < cells.length; i++)
			{
				var c = cells[i];
				var pos = {x:c.position.x, y:c.position.y};
				graphics.beginFill(color, 1);
				graphics.drawRoundedRect(pos.x *(size + offset), pos.y *(size + offset), size, size, 5);
				if(addon !== undefined)
				{
					addon(graphics,c);
				}
			}
			graphics.endFill();
		}
		
		
		DrawCells(this.background,cells,this.backgroundColor);	
		this.GenerateValues(2);
	}

    return PixiGrid;
});