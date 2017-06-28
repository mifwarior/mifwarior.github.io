define(["Colors","Animation","GameMath"], function (Colors,Animation,GameMath) {
    //Do setup work here

    return function PixiTile(root,scene)
	{
		this.root = root;
		root.view = this;
		
		this.container = new PIXI.Container();
		this.graphics = new PIXI.Graphics();
		
		this.text = new PIXI.Text(root.value.toString(),
		{fontFamily : 'Arial', fontSize: 24, fill : 0x3c3a32, 
		align : 'center', fill:"green"});
		
		this.container.addChild(this.graphics);
		this.container.addChild(this.text);
		
		var size = 50;
		var hSize = size/2;
		var offset = 5;
		var corner = 5;
		var color = 0xeee4da;
		var c = this.root;
		var pos = {x:0, y:0};
		
		this.container.position.x = this.root.position.x*(size + offset);
		this.container.position.y = this.root.position.y*(size + offset);
		this.text.position.x = this.text.width/3;
		this.text.position.y = this.text.height/4;
			
		scene.addChild(this.container);
		
		this.RefreshBackground = function(color)
		{
			this.graphics.clear();
			this.graphics.beginFill(color);
			this.graphics.lineStyle(0, color, 1);
			this.graphics.beginFill(color, 1);
			this.graphics.drawRoundedRect(pos.x *(size + offset), pos.y *(size + offset), size, size, 5);
			this.graphics.endFill();
		}
		
		this.RefreshColors = function (v)
		{
			var c = Colors[this.root.value];
			if(c) 
			{
				this.text.style.fill = c.color;
				this.RefreshBackground(c.background);
			}
		};
		this.RefreshColors(this.root.value);
		this.Dispose = function()
		{
			scene.removeChild(this.container);
		}
		
		var animation = new Animation(function(t){
				var s = GameMath.Lerp(1,1.2,t);
				this.container.scale.x = s;
				this.container.scale.y = s;
				if(t === 1)
				{
					this.container.scale.x = 1;
					this.container.scale.y = 1;
				}
		}.bind(this));
		animation.speed = 20;
		
		var val = -1;
		this.ScaleEffect = function()
		{
			this.RefreshColors(this.root.value);
			
			animation.Start();
		}.bind(this);
		
		this.Update = function(dt)
		{
			this.root.Update(dt);
			this.container.position.x = this.root.position.x*(size + offset);
			this.container.position.y = this.root.position.y*(size + offset);
			
			if(val !== root.value) 
			{
				val = root.value;
				this.text.text =  val.toString();
			}
			animation.Update(dt);
		}
	}
});