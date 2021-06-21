<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("SESSION", "1.0");

	require_once __DIR__ . "/componentManager.php";


	if (!function_exists("APP_noAuthHandler")) 
	{
		function APP_noAuthHandler() {
			die('{"error":"E_noAuth","result":false}');
		}
	}

	

	class _App {
		public $userId = false;
		public $component;
		
		public function __construct() {
			$this->userId = (string)$GLOBALS["SESSION"]->get("userId");
			$this->component = new App_componentManager();
		}

		private function throwNoAuthError() {
			try {
				APP_noAuthHandler();
			}
			catch (Exception $_e) {
			}
		}
	}


	global $App;
	$App = new _App();
?>