define(function () {
    
	function BatteryStatus(levelId,pluggedId)
	{
		var level = document.getElementById(levelId);
        var plugged = document.getElementById(pluggedId);
			
		if(Ok(level) || Ok(plugged))
		{
			window.addEventListener("batterystatus", onBatteryStatus, false);

		}

        function onBatteryStatus(status) {

            if (Ok(level)) level.innerHTML = status.level;
            if (Ok(plugged)) plugged.innerHTML = status.isPlugged;
        }
		function Ok(el)
		{
			return el !== null && el !== undefined;
		}
	}
	
	
    return BatteryStatus;
});