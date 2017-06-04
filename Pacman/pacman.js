function ToRadians(angle)
{
	return Math.PI * angle / 180;
}
function DownloadImage(url, callback)
{
	var image = document.createElement( 'img' );
	image.crossOrigin = null;
	image.addEventListener( 'load', function ( event ) {
		callback( this );
	}, false );
	image.src = url;
}


function Pacman()
{


	console.log("Pacman Game");
	var canvas = document.getElementById("view");
	var gl = canvas.getContext("webgl",{ antialias: false, /*stencil: true preserveDrawingBuffer: true*/ });
	console.log(gl);
	var shaders = new ShaderCollection(gl);
	
	var contextAttributes = gl.getContextAttributes();
	console.log(contextAttributes);
	
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	
	
	var shaderNames  = {
		Simple:0,
		Sprite:1,
		Points:2
	};
	
	var shaders = new ShaderCollection(gl)
	
	shaders.Add(shaderNames.Simple,	document.getElementById("vs-simple").text,	document.getElementById("fs-simple").text);
	shaders.Add(shaderNames.Sprite,	document.getElementById("vs-sprite").text,	document.getElementById("fs-sprite").text);
	shaders.Add(shaderNames.Points,	document.getElementById("vs-points").text,	document.getElementById("fs-points").text);
	
	shaders.CompileShader(shaderNames.Simple);
	shaders.CompileShader(shaderNames.Sprite);
	shaders.CompileShader(shaderNames.Points);

	var program = shaders.GetShader(shaderNames.Simple);
	
	
	function SetShader(name)
	{
		if(program.name !== name)
		{
			program = shaders.GetShader(name);
		}
	}
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0); 
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	function BaseObject()
	{
		this.color = new Float32Array([1,0,0,1]);
		this.matrix = new Float32Array([
		 1, 0, 0, 0,
		 0, 1, 0, 0,
		 0, 0, 1, 0,
		 0, 0, 0, 1]);
		this.scaleMatrix = new Float32Array([
		 1, 0, 0, 0,
		 0, 1, 0, 0,
		 0, 0, 1, 0,
		 0, 0, 0, 1]);
		
		this.GetScale = function(v)
		{
			v.x = this.scaleMatrix[0];
			v.y = this.scaleMatrix[5];
			v.z = this.scaleMatrix[10];
		}
		this.SetScale = function(v)
		{
			this.scaleMatrix[0] = v.x;
			this.scaleMatrix[5] = v.y;
			this.scaleMatrix[10] = v.z;
		}.bind(this);
		this.SetAngle = function(a)
		{
			var cosB = Math.cos(ToRadians(a));
			var sinB = Math.sin(ToRadians(a));
			this.matrix[0] = cosB;
			this.matrix[1] = sinB;
			
			this.matrix[4] = -sinB;
			this.matrix[5] = cosB;
		}.bind(this);
		
		this.SetPosition = function(x,y)
		{
			this.matrix[12]=x;
			this.matrix[13]=y;
		}.bind(this);
		this.GetPosition = function(c)
		{
			c.x = this.matrix[12];
			c.y = this.matrix[13];
		}
		
		this.AddPosition = function(x,y)
		{
			this.matrix[12]+=x;
			this.matrix[13]+=y;
		}.bind(this);
	}
		
	function DrawObject(gl)
	{
		BaseObject.call(this);
		var vertices = new Float32Array([0.0, 0.5, -0.5,-0.5, 0.5,-0.5])
		var vertexBuffer;
		
		this.color = new Float32Array([1,0,0,1]);
		
		this.Draw = function()
		{
			if(vertexBuffer === undefined)
				vertexBuffer = gl.createBuffer();
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
			
			var a_Position = gl.getAttribLocation(program, "a_Position");
			gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0,0);
			gl.enableVertexAttribArray(a_Position);
			
			var u_xformMatrix = gl.getUniformLocation(program,"u_xformMatrix");
			gl.uniformMatrix4fv(u_xformMatrix,false,this.matrix);
				
			var u_color = gl.getUniformLocation(program,"u_color");
			gl.uniform4fv(u_color,this.color);
			
			gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);		
		}.bind(this);
	}
	function WriteVector(x,y,z,array)
	{
		array.push(x);
		array.push(y);
		array.push(z);
	}
	function GenerateGrid(cols,rows)
	{
		var colStep = 2 / (cols);
		var rowStep = 2 / (rows);
		var array = [];
		
		for(var i = 0; i < cols; i++)
		{
			WriteVector(-1 + i*colStep,1,0,array);
			WriteVector(-1 + i*colStep,-1,0,array);
		}
		for(var n = 0; n < rows; n++)
		{
			WriteVector(-1,-1 + n*rowStep,0,array);
			WriteVector(1,-1 + n*rowStep,0,array);
		}
		return array;
	}
	var map = [	
				[2,2,2,2,1,2,2,2,1,2],
				[2,1,0,0,0,0,1,0,1,2],
				[1,1,0,1,1,1,0,0,0,0],
				[2,0,0,1,2,1,0,1,1,1],
				[1,1,0,1,2,1,0,1,0,0],
				[0,2,0,0,2,0,0,2,2,2],
				[0,2,1,1,0,1,0,1,0,0],
				[0,1,1,2,0,0,0,1,2,1],
				[0,0,1,0,1,1,1,1,2,1],
				[2,2,1,0,2,2,2,0,2,1],
				 ];
	function ConvertToMapCoord(p, width, height)
	{
		p.x *= width / 2;
		p.y *= height / 2;
		
		p.x = Math.floor(p.x + width / 2 );
		p.y = Math.floor(p.y + height / 2 );
	}	
	
	function MapCoordToWorld(p,width,height)
	{
		var wseg = 2 / width;
		var hseg = 2 / height;
		
		p.x = p.x * wseg - 1 + wseg * 0.5;
		p.y = p.y * wseg - 1 + wseg * 0.5;
	}
	
	function GenerateVerticesForMap(map)
	{
		var seg = 2 / map.length;
		var offset = seg / 10;
		var v = [];/*[
					-1+offset,1-offset,0, 1-offset, 1-offset,0 ,
					-1+offset,1-offset,0, -1+offset,-1+offset,0,
					1-offset,1-offset,0, 1-offset,-1+offset,0,
					1-offset,-1+offset,0,-1+offset,-1+offset,0
				 ]; // box*/
		for(var n = 0; n < map.length; n++)
		{
			var row = map[n];
			var rowSeg = 2 / row.length;
			var rowOffset = rowSeg / 10;
			for(var k = 0; k < row.length; k++)
			{
				var r = row[k];
				var x = k - row.length/2;
				var y = n - map.length/2;
				if(r === 1)
				{
					if(map[n-1] === undefined || map[n-1][k] !== 1)
					{
						WriteVector(x*rowSeg, y*seg,0,v);
						WriteVector((x+1) *rowSeg, y*seg,0,v); // bottom
					}
					if(map[n+1] === undefined || map[n+1][k] !== 1)
					{
						WriteVector(x * rowSeg, (y+1)*seg,0,v);
						WriteVector((x+1) *rowSeg, (y+1)*seg,0,v); // top
					}
					
					if(row[k-1] !== 1)
					{
						WriteVector(x * rowSeg, y*seg,0,v); // left
						WriteVector(x *rowSeg, (y+1)*seg,0,v);
					}
					if(row[k+1] !== 1)
					{
						WriteVector((x+1) * rowSeg, (y)*seg,0,v);
						WriteVector((x+1) *rowSeg, (y+1)*seg,0,v);
					}
				}
			}
		}
		return v;
	}
	
	function Points(gl)
	{
		BaseObject.call(this);
		var scale = 0.08;
		this.SetScale({x:scale,y:scale, z:scale});
		this.ShaderName = shaderNames.Points;
		
		function GeneratePointsFromMap(map)
		{
			var arr = [];
			var v = {x:0,y:0};
			for(var n =0; n < map.length; n++)
			{
				var row = map[n];
				for(var k = 0; k < row.length; k++)
				{
					if(row[k] === 2)
					{
						v.x = k;
						v.y = n;
						MapCoordToWorld(v,row.length,map.length)
						WriteVector(v.x,v.y,0,arr);
					}
				}
			}
			return arr;
		}
		
		var vertices = new Float32Array(GeneratePointsFromMap(map));
		var vertexBuffer;
		var texture;
		
		DownloadImage("coin.png",function (image){
			if(texture === undefined) texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		});
		
		var t = 0;
		this.AnimationUpdate = function(dt)
		{
			t+= dt*20;
			
			this.tile = t|0;
			if(t > 4) t = 0;
		}.bind(this);
		
		function EpsEqual(a,b)
		{
			return Math.abs(a-b) < 0.00001;
		}
		var v1 = {x:0,y:0};
		this.RemovePoint = function(x,y)
		{
			v1.x = x;
			v1.y = y;
			MapCoordToWorld(v1,map.length,map[0].length);
			for(var i = 0; i < vertices.length; i += 3)
			{
				if( EpsEqual(vertices[i+0],v1.x) && EpsEqual(vertices[i+1],v1.y))
				{
					vertices[i+0] = -100;
					vertices[i+1] = -100;
					if(vertexBuffer !== undefined)
					{
						gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
						gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
					}
					return;
				}
			}
		}
		
		this.Draw = function()
		{
			SetShader(this.ShaderName);
			if(vertexBuffer === undefined)
			{
				vertexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
			}	
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
			
			var a_Position = gl.getAttribLocation(program, "a_Position");
			gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
			gl.enableVertexAttribArray(a_Position);
			
			if(texture !== undefined)
			{
				var u_sprite = gl.getUniformLocation(program,"t_sprites");
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.uniform1i(u_sprite, 0);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

				gl.enable(gl.BLEND);
			}
			var u_xformMatrix = gl.getUniformLocation(program,"u_xformMatrix");
			gl.uniformMatrix4fv(u_xformMatrix,false,this.matrix);
				
			var u_tile = gl.getUniformLocation(program,"u_tile");
			gl.uniform1f(u_tile,this.tile);
			
			gl.drawArrays(gl.POINTS, 0, vertices.length/3 );
		}
	}
	
	
	function LevelObject(gl)
	{
		BaseObject.call(this);
		this.ShaderName = shaderNames.Simple;
		//var vertices = new Float32Array(GenerateGrid(10,10));
		var vertices = new Float32Array(GenerateVerticesForMap(map));
		var vertexBuffer;
		
		this.color = new Float32Array([0,0.25,1,1]);
		
		this.Draw = function()
		{
			SetShader(this.ShaderName);
			if(vertexBuffer === undefined)
			{
				vertexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
			}	
			
			gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
						
			var a_Position = gl.getAttribLocation(program, "a_Position");
			gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
			gl.enableVertexAttribArray(a_Position);
			
			var u_xformMatrix = gl.getUniformLocation(program,"u_xformMatrix");
			gl.uniformMatrix4fv(u_xformMatrix,false,this.matrix);
			
			var u_color = gl.getUniformLocation(program,"u_color");
			gl.uniform4fv(u_color,this.color);
				
			gl.drawArrays(gl.LINES, 0, vertices.length / 3);		
		}.bind(this);
	}
	
	function Hero(gl)
	{
		BaseObject.call(this);
		var vertices = new Float32Array([-1,1,0, 1,1,0, 1,-1,0, -1,-1,0]);
		var indices = new Uint16Array([0,3,1,2,1,3]);
		var scale = 0.08;
		
		var vertexBuffer;
		var indicesBuffer;
		
		this.ShaderName = shaderNames.Sprite;
		this.SetScale({x:scale,y:scale, z:scale});
		this.color = new Float32Array([1,0.8,0,1]);
		this.tile = 1;
		
		var heroImg;
		var texture;
		
		DownloadImage("hero.png",function (image){
			if(texture === undefined) texture = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
			gl.generateMipmap(gl.TEXTURE_2D);
			gl.bindTexture(gl.TEXTURE_2D, null);
		});


		this.Draw = function()
		{
			SetShader(this.ShaderName);
			if(texture === undefined) texture = gl.createTexture();
			
			if(vertexBuffer === undefined)	
			{
				vertexBuffer = gl.createBuffer();
				gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
			}
			if(indicesBuffer === undefined)
				indicesBuffer = gl.createBuffer();
			
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
				
			var a_Position = gl.getAttribLocation(program, "a_Position");
			gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
			
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
				
			gl.enableVertexAttribArray(a_Position);
			
			var u_xformMatrix = gl.getUniformLocation(program,"u_xformMatrix");
			gl.uniformMatrix4fv(u_xformMatrix,false,this.matrix);
			
			var u_scaleMatrix = gl.getUniformLocation(program,"u_scaleMatrix");
			gl.uniformMatrix4fv(u_scaleMatrix,false,this.scaleMatrix);
			
			if(texture !== undefined)
			{
				var u_sprite = gl.getUniformLocation(program,"u_sprite");
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, texture);
				gl.uniform1i(u_sprite, 0);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
				
				gl.enable(gl.BLEND);
			}
			var u_color = gl.getUniformLocation(program,"u_color");
			gl.uniform4fv(u_color,this.color);
			
			var u_tile = gl.getUniformLocation(program,"u_tile");
			gl.uniform1f(u_tile,this.tile);
		
			gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		}
	}
	
	function MoveBehaviour(map, obj)
	{
		this.Speed = 1;
		this.applyAngle = true;
		var dir = {x:0,y:0};
		var mapHeight = map.length;
		var mapWidht = map[0].length;
		var nextDir = {x:0,y:0};
		
		var v1 = {x:0,y:0};
		var v2 = {x:0,y:0};
		var v3 = {x:0,y:0};
		var v4 = {x:0,y:0};
				
		this.CanMoveTo = function(pos)
		{
			ConvertToMapCoord(pos,mapWidht,mapHeight);
			if(pos.x < 0 || pos.y < 0 || pos.x >= mapWidht || pos.y >= mapHeight ) return false;
			return map[pos.y][pos.x] !== 1;
		}
		this.CanUseDirection = function(dir)
		{
			obj.GetPosition(v1);
			ConvertToMapCoord(v1,mapWidht,mapHeight);
			MapCoordToWorld(v1,mapWidht,mapHeight);
			ConvertToMapCoord(v1,mapWidht,mapHeight);
			MapCoordToWorld(v1,mapWidht,mapHeight);
			v1.x += dir.x * (2 / mapWidht); // collide with 0.8 / width distance 
			v1.y += dir.y * (2 / mapHeight);
			return this.CanMoveTo(v1);
		}.bind(this);
		
		this.SetInput = function(x,y)
		{
			if(Math.abs(x) < 0.00001 && Math.abs(y) < 0.00001) return;
			nextDir.x = x;
			nextDir.y = y;

		}

		var t = 0;
		var lastPos = {x:0,y:0};
		this.AnimationUpdate = function(dt)
		{
			t+= dt*20;
			obj.GetPosition(v1);
			if( (Math.abs(lastPos.x - v1.x) < 0.00001) && (Math.abs(lastPos.y - v1.y) < 0.00001) )  t = 0;
			obj.GetPosition(lastPos);
			
			obj.tile = t|0;
			if(t > 4) t = 0;
		}.bind(this);
		
		function Sign(a)
		{
			var s = Math.abs(a)+a;  
			s = (s === 0)?-1:1;
			return s;
		}
		
		this.Update = function(dt)
		{
			/// --- Recovery position 
			obj.GetPosition(v3);
			obj.GetPosition(v4);
			ConvertToMapCoord(v4,mapWidht,mapHeight);
			MapCoordToWorld(v4,mapWidht,mapHeight);
			v3.x = Math.abs(Math.abs(v3.x) - Math.abs(v4.x));
			v3.y = Math.abs(Math.abs(v3.y) - Math.abs(v4.y));
			if(v3.x > 0.0001 && v3.y > 0.0001)
			{
				obj.SetPosition(v4.x, v4.y);
			}
			/// --- Apply angle
			if(this.applyAngle)
			{
				var angle = 0;
				var b = false;
				obj.GetScale(v1);
				v1.x = Math.abs(v1.x);
				if(dir.x > 0)
				{
					v1.x = Math.abs(v1.x);
					angle = 0;
					b = true;
				}
				if(dir.x < 0)
				{
					angle = 0;
					v1.x = -Math.abs(v1.x);
					b = true;
				}
				if(dir.y > 0)
				{
					angle = 90;
					b = true;
				}
				if(dir.y < 0)
				{	
					angle = 270;
					b = true;
				}
				if(b === true)
				{
					obj.SetAngle(angle);
					obj.SetScale(v1);
				}
			}
			/// --- Apply input direction
			obj.GetPosition(v1);
			v1.x += dir.x * (1/48) * this.Speed;
			v1.y += dir.y * (1/48)* this.Speed;
			v1.x = Math.max(-1 + 1/mapWidht,Math.min(1 - 1/mapWidht ,v1.x));
			v1.y = Math.max(-1 + 1/mapHeight,Math.min(1 - 1/mapHeight,v1.y));
			
			v2.x = v1.x;
			v2.y = v1.y;
			v2.x += dir.x * 0.8 / mapWidht; // collide with 0.8 / width distance 
			v2.y += dir.y * 0.8 / mapHeight;
			
			if(this.CanMoveTo(v2))
				obj.SetPosition(v1.x, v1.y);
			else
			{
				dir.x = 0;
				dir.y = 0;
			}
			/// ---
			
			
			/// --- Apply next direction
			if(this.CanUseDirection(nextDir))
			{
				obj.GetPosition(v3);
				obj.GetPosition(v4);
				ConvertToMapCoord(v4,mapWidht,mapHeight);
				MapCoordToWorld(v4,mapWidht,mapHeight);
				v3.x = Math.abs(Math.abs(v3.x) - Math.abs(v4.x));
				v3.y = Math.abs(Math.abs(v3.y) - Math.abs(v4.y));
				
				if(v3.x < 0.02 && v3.y < 0.02)
				{
					dir.x = nextDir.x;
					dir.y = nextDir.y;
				}
			}
			/// ---
			
		}.bind(this);
		
	}

	function CoinEatBehaviour(obj,map,coins)
	{
		var scoreText = document.getElementById("score");
		var score = 0;
		scoreText.innerHTML = score;
		var v1 = {x:0,y:0};
		var v2 = {x:0,y:0};
		this.Update = function(dt)
		{
			obj.GetPosition(v1);
			ConvertToMapCoord(v1,map.length,map[0].length);
			if(map[v1.y][v1.x] === 2)
			{
				coins.RemovePoint(v1.x,v1.y);
				map[v1.y][v1.x] = 0;
				score +=10;
				scoreText.innerHTML = score;
			}
			
		}.bind(this);
	}
	
	var level = new LevelObject(gl);
	var hero = new Hero(gl);
	
	var heroBehaviour = new MoveBehaviour(map,hero);

	var coins = new Points(gl);
	var coinEat = new CoinEatBehaviour(hero,map,coins);
	
	var inputX = 0;
	var inputY = 0;
	var heroSpeed = 1;
	var time = 0;
	
	function update(t)
	{
		
		var dt = (t - time) * 0.001;
		time = t;
		gl.clear(gl.COLOR_BUFFER_BIT);
		
		level.Draw();
		coins.AnimationUpdate(dt);
		coins.Draw();
		coinEat.Update(dt);

		inputX = Math.min(Math.max(-1,inputX),1);
		inputY = Math.min(Math.max(-1,inputY),1);

		heroBehaviour.SetInput(inputX,inputY);
		heroBehaviour.Update(dt);
		heroBehaviour.AnimationUpdate(dt);
		
		hero.Draw();
	

		inputX = 0;
		inputY = 0;
	}
	
	function OnKeyUp()
	{
		inputY++;
	}
	function OnKeyDown()
	{
		inputY--;
	}
	function OnKeyLeft()
	{
		inputX--;
	}
	function OnKeyRight()
	{
		inputX++;
	}
	
	var keys = {
		65:OnKeyLeft, //a
		83:OnKeyDown, //s
		68:OnKeyRight,//d
		87:OnKeyUp,	  //w
		37:OnKeyLeft, //leftArrow
		40:OnKeyDown, //downArrow
		39:OnKeyRight,//ridhtArrow
		38:OnKeyUp	  //upArrow 
		};
	
	
	document.onkeydown = function(ev){
		var f = keys[ev.keyCode];
		if(f !== undefined) f();
	}
	
	
	function animloop()
	{
		update(Date.now());
	}
	setInterval(animloop,1000/48); // 48 frames per second
	// use setInterval because all browsers base on Chromium have memory leak in requestAnimationFrame

}

Pacman();