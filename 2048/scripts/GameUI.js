define(function () {
    function GameUI()
	{
		this.OnRestart = function(){};
		
		var restartButton = document.getElementById("RestartButton");
		var score = document.getElementById("Score");
		var bestResult = document.getElementById("BestResult");
		
		var gameOver = document.getElementById("GameOverWindow");
		var loose = document.getElementById("Loose");
		var win = document.getElementById("Win");
		var bestScore = 0;
		
		restartButton.onclick = Restart.bind(this);
		
		function Restart()
		{
			this.OnRestart();
		}
		
		function SetActive(el, active)
		{
			el.style.display = active?"block":"none";
		}
		
        this.Reset = function () {
            score.innerHTML = "0";
            SetActive(gameOver, false);
            SetActive(loose, false);
            SetActive(win, false);
        };
		
        this.UpdateScore = function (v) {
            score.innerHTML = v;
            if (v > bestScore) {
                bestScore = v;
                bestResult.innerHTML = bestScore;
            }
        };
		
        this.GameOver = function (victory) {
            SetActive(gameOver, true);
            SetActive(victory ? win : loose, true);
        };
	}

    return GameUI;
});