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


		private function filterComponent() {

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



		private function addComponent($_component) {
			$creatorId = $this->getUserId();
			if (!$creatorId) return "E_noAuth";
			
			$result = $this->DB->execute(
				"INSERT INTO $this->DBTableName (name, inputs, outputs, content, creatorId, internalId) VALUES (?, ?, ?, ?, ?, ?)", 
				array(
					$_component["name"],
					json_encode($_component["inputs"]),
					json_encode($_component["outputs"]),
					json_encode($_component["content"]),
					$creatorId,
					$_component["id"],
				)
			);
			$componentId = $this->DB->getLatestInsertId();
			return $this->getComponentById($componentId);
		}

		public function updateComponent($_component) {
			$exists = $this->getComponentById($_component["componentId"]);
			if (!$exists) return $this->addComponent($_component);

			$creatorId = $this->getUserId();
			if (!$creatorId) return "E_noAuth";
			if ($exists['creatorId'] != $creatorId) return "E_notAllowed";

			
			$result = $this->DB->execute(
				"UPDATE $this->DBTableName SET name=?, inputs=?, outputs=?, content=?, internalId=?", 
				array(
					$_component["name"],
					json_encode($_component["inputs"]),
					json_encode($_component["outputs"]),
					json_encode($_component["content"]),
					$_component["id"],
				)
			);
			return $this->getComponentById($exists['componentId']);
		}


		public function removeComponent($_id) {
			$exists = $this->getComponentById($_id);
			if (!$exists) return false;

			$creatorId = $this->getUserId();
			if (!$creatorId) return "E_noAuth";
			if ($exists['creatorId'] != $creatorId) return "E_notAllowed";


			return $this->DB->execute(
				"DELETE FROM $this->DBTableName WHERE componentId=? LIMIT 1", 
				array($exists['componentId'])
			);
		}

	}
?>