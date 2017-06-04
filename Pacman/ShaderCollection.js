function ShaderCollection(gl)
{
	var c = {};
	this.Add = function(key, vsh, fsh)
	{
		if(c[key] === undefined) c[key] = {};
		c[key].vsh_src = vsh;
		c[key].fsh_src = fsh;
	}
	this.CompileShader = function(key)
	{
		var sh = c[key];
		
		if(sh.prog !== undefined)
		{
			gl.deleteProgram(sh.prog);
			sh.prog = undefined;
		}
		
		if(sh.vsh !== undefined)
		{
			gl.deleteShader(sh.vsh);
			sh.vsh = undefined;
		}
		
		if(sh.fsh !== undefined)
		{
			gl.deleteShader(sh.fsh);
			sh.fsh = undefined;
		}
		
		
		var vsh = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vsh, sh.vsh_src);
		gl.compileShader(vsh);
		console.log(key + " VERTEX_SHADER:",gl.getShaderParameter(vsh, gl.COMPILE_STATUS));
		
		var fsh = gl.createShader(gl.FRAGMENT_SHADER);
		
		gl.shaderSource(fsh, sh.fsh_src);
		gl.compileShader(fsh);
		console.log(key + " FRAGMENT_SHADER:",gl.getShaderParameter(fsh, gl.COMPILE_STATUS));
		
		sh.vsh = vsh;
		sh.fsh = fsh;
		
		var prog = gl.createProgram();
		gl.attachShader(prog, sh.vsh);
		gl.attachShader(prog, sh.fsh);
		gl.linkProgram(prog);
		
		var programLink = gl.getProgramParameter(prog, gl.LINK_STATUS);
		console.log(key + " LINK: ", programLink);
		if(!programLink)
		{
			var info = gl.getProgramInfoLog(prog);
			throw "Could not compile WebGL program. \n\n" + info;
		}
		
		prog.name = key;
		sh.prog = prog;
	}
	
	this.GetShader = function(key)
	{
		var sh = c[key];
		if(sh === undefined) console.warn("SHADER " + key + " not found");
		else
		{
			if(sh.prog === undefined) this.CompileShader(key);
			gl.useProgram(sh.prog);
		}
		return sh.prog;
	}.bind(this);
}