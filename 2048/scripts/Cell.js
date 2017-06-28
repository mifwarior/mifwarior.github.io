define(function () {
    //Do setup work here

    return function Cell(p)
	{
		this.position = p;
		this.t;
		this.b;
		this.l;
		this.r;
		
		this.values = [];
		function SetTarget(arr, target)
		{
			for(var i =0; i<arr.length; i++)
			{
				arr[i].SetTarget(target);
			}
		}
		
		this.MoveTo = function(a,b)
		{
			if(this.values.length > 0)
			{
				var o = this[a];
				if(o !== undefined)
				{
					while(o[a] !== undefined && o[a].values.length === 0)
					{
						o = o[a];
					}
					if(o.values.length ===0)
					{
						var v = this.values;
						this.values = o.values;
						o.values = v;
						SetTarget(v,o.position);
					}
				}
			}
			if(this[b] !== undefined) this[b].MoveTo(a,b);
		}
		this.AddTo = function(a,b)
		{
			if(this.values.length === 1)
			{
				var o = this[a];
				if(o !== undefined && o.values.length === 1 && o.values[0].value === this.values[0].value )
				{
					var v = this.values.shift();
					o.values.push(v); 
					SetTarget(o.values,o.position);
				}
			}
			if(this[b] !== undefined) this[b].AddTo(a,b);
		}
		
		this.AddLeft = function()
		{
			this.AddTo("l","r");
		}
		this.AddRight = function()
		{
			this.AddTo("r","l");
		}
		this.AddUp = function()
		{
			this.AddTo("t","b");
		}
		this.AddDown = function()
		{
			this.AddTo("b","t");
		}
		
		
		this.MoveLeft = function()
		{
			this.MoveTo("l","r");
		}
		this.MoveRight = function()
		{
			this.MoveTo("r","l");
		}
		this.MoveUp = function()
		{
			this.MoveTo("t","b");
		}
		this.MoveDown = function()
		{
			this.MoveTo("b","t");
		}
	}
});