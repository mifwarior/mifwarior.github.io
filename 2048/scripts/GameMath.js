define(function () {
	function Lerp(a,b,t)
	{
		return a + (b - a) * t;
	}
		
	function LerpV2(a, b, c ,t)
	{
		c.x = Lerp(a.x, b.x, t);
		c.y = Lerp(a.y, b.y, t);
	}

    return {
        Lerp: Lerp,
        LerpV2: LerpV2
    }
});
