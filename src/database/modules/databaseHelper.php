<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("DB", "1.0");
	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("USER", "1.1");

	global $DBHelper;
	$DBHelper = new _databaseHelper;

	class _databaseHelper {
		private $DBName = "eelekweb_gateSim";
		private $DBTableName = "components";

		private $DB;
		public function __construct() {
			$this->DB = $GLOBALS["DB"]->connect($this->DBName);
			if (!$this->DB) die("databaseHelper.php: DB doesn't exist");
		}

		public function getUserId() {
			$result = (string)$GLOBALS["SESSION"]->get("userId");
			if (!$result) return false;
			return $result;
		}


		public function getAllComponents() {
			$components = $this->DB->execute("SELECT * FROM $this->DBTableName", array());
			$returnVal = array();
			for ($i = 0; $i < sizeof($components); $i++)
			{
				array_push($returnVal, $this->DBToExportComponent($components[$i]));
			}
			return $returnVal;
		}

		private function DBToExportComponent($_component) {
			$creatorName = '--';
			$creator = $GLOBALS['USER']->getById($_component["creatorId"]);
			if ($creator) $creatorName = $creator['name'];

			return array(
				"name" 			=> $_component["name"],
				"componentId" 	=> $_component["componentId"],
				"id" 			=> $_component["internalId"],

				"inputs" 		=> json_decode($_component["inputs"], true),
				"outputs" 		=> json_decode($_component["outputs"], true),
				"content" 		=> json_decode($_component["content"], true),
				"creatorName" 	=> $creatorName,
				'creatorId'		=> $_component["creatorId"]
			);
		}


		
		public function getComponentById($_id) {
			$component = $this->DB->execute("SELECT * FROM $this->DBTableName WHERE componentId=? LIMIT 1", array($_id));
			if (sizeof($component) != 1) return false;
			return $this->DBToExportComponent($component[0]);
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
				"UPDATE $this->DBTableName SET name=?, inputs=?, outputs=?, content=?, internalId=? WHERE componentId=?", 
				array(
					$_component["name"],
					json_encode($_component["inputs"]),
					json_encode($_component["outputs"]),
					json_encode($_component["content"]),
					$_component["id"],
					$exists['componentId']
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