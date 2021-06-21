<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("FILTERER", "1.0");
	
	require_once __DIR__ . "/databaseHelper.php";



	class App_componentManager {
		private $filter;
		private $nodeFilter;
		private $referenceFilter;
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
				"inputs" 			=> ['array'],
				"outputs" 			=> ['array'],
				"content" 			=> ['array'],
			));
		}


		private function importComponent($_component) {
			$component = $this->filter->filter($_component);
			$component['inputs'] = $this->filterNodeList($component['inputs']);
			$component['outputs'] = $this->filterNodeList($component['outputs']);
			$component['content'] = $this->filterContent($component['content']);

			return $component;
		}

		private function filterNodeList($_nodes) {
			$newNodes = [];
			for ($i = 0; $i < sizeof($_nodes); $i++)
			{
				$node = $this->nodeFilter->filter($_nodes[$i]);
				if (!$node || $node == $GLOBALS['FILTERER']->InvalidObj) continue;
				array_push($newNodes, $node);
			}
			return $newNodes;
		}
		private function filterContent($_content) {
			$newContent = [];
			for ($i = 0; $i < sizeof($_content); $i++)
			{	
				if ($_content[$i]['type'] == 'line')
				{
					$line = $this->filterLine($_content[$i]);
					// if (!$line) continue;
					array_push($newContent, $line);
					continue;
				}

				$item = $this->referenceFilter->filter($_content[$i]);
				if (!$item || $item == $GLOBALS['FILTERER']->InvalidObj) continue;
				if (sizeof($item['position']) != 2) continue;
				$item['position'] = [(float)$item['position'][0], (float)$item['position'][1]];

				$referencedComponent = $this->getComponentById($item['componentId']);
				if (!$referencedComponent && $item['componentId'] != -1) continue;
				array_push($newContent, $item);
			}
			return $newContent;
		}

		private function filterLine($_line) {
			return $_line;
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