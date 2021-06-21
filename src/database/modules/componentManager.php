<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("FILTERER", "1.0");
	
	require_once __DIR__ . "/databaseHelper.php";



	class App_componentManager {
		private $filter;
		private $userId = false;
		
		public function __construct() {
			$this->userId = $GLOBALS["SESSION"]->get("userId");
			$this->nodeFilter 		= $GLOBALS['FILTERER']->createFilter(array(
				"name" 				=> ['string', 'Nameless', $GLOBALS["FILTERER"]->Defaultable],
			));
			$this->referenceFilter 	= $GLOBALS['FILTERER']->createFilter(array(
				"componentId" 		=> ['int', $GLOBALS["FILTERER"]->IdentifyingKey],
				"id" 				=> ['int'], // internal reference id
				"position" 			=> ['array', [0, 0], $GLOBALS["FILTERER"]->Defaultable],
			));

			$this->filter = $GLOBALS['FILTERER']->createFilter(array(
				"componentId" 		=> ['int', $GLOBALS["FILTERER"]->IdentifyingKey],
				"id" 				=> ['int'], // internal reference id
				
				"name" 				=> ['string', 'Nameless', $GLOBALS["FILTERER"]->Defaultable],
				"inputs" 			=> [$this->nodeFilter],
				"outputs" 			=> [$this->nodeFilter],
				"content" 			=> [$this->referenceFilter],
			));
		}


		private function importComponent($_component) {
			// Do some checks to ensure the component is viable
			return $_component;
		}


		public function getAllComponents() {
			$components = $GLOBALS['DBHelper']->getAllComponents();
			$returnVal = array();
			for ($i = 0; $i < sizeof($components); $i++)
			{
				$returnVal[$i] = $this->exportComponent($components[$i]);
			}
			return $returnVal;
		}

		private function exportComponent($_component) {
			if (!$_component) return $_component;
			if ($_component['creatorId'] == $this->userId) $_component["isOwnComponent"] = true;
			unset($_component['creatorId']);
			return $_component;
		}

		
		public function getComponentById($_id) {
			$component = $GLOBALS['DBHelper']->getComponentById($_id);
			return $this->exportComponent($component);
		}



	
		public function updateComponent($_component) {
			$component = $this->importComponent($_component);
			if (!$component) return false;
			return $this->exportComponent($GLOBALS['DBHelper']->updateComponent($component));
		}


		public function removeComponent($_id) {
			return $GLOBALS['DBHelper']->removeComponent($_id);
		}

	}
?>