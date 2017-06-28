// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397704
// To debug code on page load in Ripple or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
(function () {
    "use strict";

    //document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
	
	var game;
	var batteryStatus;
	
    function onDeviceReady() {
		
		require.config({
			baseUrl: "scripts",
			paths: {		 
			}
		});
		require(["Game","BatteryStatus"],function(Game,BatteryStatus)
		{
			game = new Game();
			game.StartGame();
			batteryStatus = new BatteryStatus("BatteryLevel","BatteryPlugged");
		});
		
		/*
        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var parentElement = document.getElementById('deviceready');
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
		*/
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
	onDeviceReady();
} )();