define(["GameUI","PixiGrid","Input"],function (GameUI,PixiGrid,Input) {
  
	function Game()
	{
		var self = this;
		var map;
		var canvas = document.getElementById("view");
		var renderer = new PIXI.autoDetectRenderer(270, 270, {view:document.getElementById("view"),autoResize:true,backgroundColor:0xb7afaf});
		var stage;
		var play = false;
		var animFrame;
		var gameUI = new GameUI();
		
		gameUI.OnRestart = function ()
		{
			gameUI.Reset();
			self.StopGame();
			self.StartGame();
		}
		
		this.StartGame = function()
		{
			play = true;
			map = new PixiGrid({x:5,y:5});
			map.OnGameOver = function(win,score)
			{
				play = false;
				
				gameUI.GameOver(win);
				console.log("You " + (win?"Win":"Loose") + " Score:" + score);
				
			}
			
			stage = new PIXI.Container();
			stage.addChild(map.container);
			
			var time = 0;
			var dt = 0;
			
			function animate(t) {  
				dt = (t - time)*0.001;
				time = t;
		  
				if(play) animFrame = requestAnimationFrame(animate);
				map.Update(dt);
				renderer.render(stage);
			}
			animate(0); 
		}
		
		this.StopGame = function()
		{
			if(animFrame !== undefined) cancelAnimationFrame(animFrame);
			animFrame = undefined;
			play = false;
		}
		
		this.input = new Input({element:document, keyboard:false,mouse:true,touch:true});
		this.input.OnInput = function(x,y)
        {
            if (x < 0) { map.MoveLeft(); gameUI.UpdateScore(map.score); }
			if(x > 0) { map.MoveRight(); gameUI.UpdateScore(map.score); }
            if (y < 0) { map.MoveDown(); gameUI.UpdateScore(map.score); }
            if (y > 0) { map.MoveUp(); gameUI.UpdateScore(map.score); }
		}
	}
    return Game;
});