define(["Tile","Cell"], function (Tile,Cell) {
    //Do setup work here

    return function Grid(size)
	{
		this.size = {x:size.x, y:size.y};
		
		this.cells = [];
		function InitLeft(a,b)
		{
			if(a === undefined || b === undefined) return;
			a.l = b;
			b.r = a;
		}
		function InitRight(a,b)
		{
			if(a === undefined || b === undefined) return;
			a.r = b;
			b.l = a;
		}
		function InitTop(a,b)
		{
			if(a === undefined || b === undefined) return;
			a.t = b;
			b.b = a;
		}
		function InitBottom(a,b)
		{
			if(a === undefined || b === undefined) return;
			a.b = b;
			b.t = a;
		}
		
		function Init()
		{
			for(var y = 0; y < size.y; y++)
			{
				this.cells.push([]);
				for(var x = 0; x < size.x; x++)
				{
					this.cells[y].push( new Cell({x:x, y:y}));
				}
			}
			
			for(var y = 0; y < size.y; y++)
			{
				for(var x = 0; x < size.x; x++)
				{
					var c = this.cells[y][x];
					InitLeft(c,this.cells[y][x - 1]);
					InitRight(c,this.cells[y][x + 1]);
					
					if(this.cells[y - 1] !== undefined)
						InitTop(c,this.cells[y - 1][x]);
					if(this.cells[y + 1] !== undefined)
						InitBottom(c,this.cells[y + 1][x]);
				}
			}
		}
		
		
		function RandomValues(array,count)
		{
			var r = [];
			for(var i = 0; i < count; i++)
			{
				var ind = Math.floor(Math.random()*array.length);
				if(r.indexOf(array[ind]) !== -1)
				{
					i--;
				}
				else
				{
					r.push(array[ind]);
				}	
			}
			return r;
		}
		
		this.GetCells = function(query)
		{
			var r = [];
			for(var y = 0; y < size.y; y++)
			{
				for(var x = 0; x < size.x; x++)
				{
					if(query(this.cells[y][x]))
					{
							r.push(this.cells[y][x]);
					}
				}
			}
			return r;
		}.bind(this);
		
		this.GetFreeCells = function()
		{
			return this.GetCells(function(c){return c.values.length === 0;});
		}
		
		this.GenerateValues = function(count, min,max)
		{
			var freeCells = this.GetFreeCells();
			if(freeCells.length < count) count = freeCells.length;
			var generated = [];
			var randomCells = RandomValues(freeCells,count);
			for(var i =0 ; i < randomCells.length; i++)
			{
				var c = randomCells[i];
				var val = ((max - min)*Math.round(Math.random())) + min;
				var spr = new Tile();
				spr.value = val;
				spr.position.x = c.position.x;
				spr.position.y = c.position.y;
				spr.target.x = c.position.x;
				spr.target.y = c.position.y;
				
				c.values.push(spr);
				generated.push(spr);
			}
			return generated;
		}
		this.HaveAvalibaleTurns = function()
		{
			var turns = this.GetCells(function(o){ 
				 
				 if(o.values.length === 0) return true;
				 if(o.r !== undefined && 
					o.r.values.length === 1 && 
					o.r.values[0].value === o.values[0].value){
					 return true;
				 }
				 
				if(o.b !== undefined && 
					o.b.values.length === 1 && 
					o.b.values[0].value === o.values[0].value){
						
					 return true;
				}
				return false;
			 });
			 return turns.length > 0;
		}
		this.MoveLeft = function()
		{
			var c = this.GetCells(function(c){ return c.position.x === 0;});
			for(var i = 0; i < c.length; i++)
			{
				c[i].MoveLeft();
				c[i].AddLeft();
				c[i].MoveLeft();
			}
		}
		
		this.MoveRight = function()
		{
			var c = this.GetCells(function(c){ return c.position.x === size.x-1;});
			for(var i = 0; i < c.length; i++)
			{
				c[i].MoveRight();
				c[i].AddRight();
				c[i].MoveRight();
			}
		}
		
		this.MoveUp = function()
		{
			var c = this.GetCells(function(c){ return c.position.y === 0;});
			for(var i = 0; i < c.length; i++)
			{
				c[i].MoveUp();
				c[i].AddUp();
				c[i].MoveUp();
			}
		}
		
		this.MoveDown = function()
		{
			var c = this.GetCells(function(c){ return c.position.y === size.y-1;});
			for(var i = 0; i < c.length; i++)
			{
				c[i].MoveDown();
				c[i].AddDown();
				c[i].MoveDown();
			}
		}
		
		Init.call(this);
	}
});