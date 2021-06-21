<?php
	require_once __DIR__ . "/../getRoot.php";
	include_once($GLOBALS["Root"] . "/PHP/PacketManager.php");

	$GLOBALS["PM"]->includePacket("SESSION", "1.0");
	$GLOBALS["PM"]->includePacket("USER", "1.1");
	$GLOBALS["PM"]->includePacket("FILTERER", "1.0");
	
	require_once __DIR__ . "/databaseHelper.php";



	class App_componentManager {
		private $filter;
		
		public function __construct() {
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




		public function getAllData() {
			$data = $this->DBHelper->getProjectData();
			if (!$data) 						return array();
			if (!$data[$this->dataType]) 		return array();
			return $data[$this->dataType];
		}

			private function _writeData($_data) {
				return $this->DBHelper->writeProjectData(
					$this->dataType, 
					(string)$_data
				);
			}

			private function _filterData($_data) {
				$data = array();
				$keys = array_keys($this->dataTypeTemplate);

				if (!$_data[$keys[0]]) return false;

				for ($i = 0; $i < sizeof($keys); $i++) 
				{
					$curKey 	= $keys[$i];
					$curKeyType = $this->dataTypeTemplate[$keys[$i]];
					
					if (!$_data[$curKey]) $_data[$curKey] = "";

					$curValue = $this->__valueToType($_data[$curKey], $curKeyType);
					$data[$curKey] = $curValue;
				}
				return $data;
			}

				private function __valueToType($_value, $_type = "Int") {
					switch ($_type) 
					{
						case "String": 		return (String)$_value; 	break;
						case "Array": 		if ($_value === "") 		return array(); else return (Array)$_value; break;
						case "float": 		return (float)$_value; 		break;
						case "Boolean": 	return (Boolean)$_value; 	break;
						default: 			return (int)$_value; 		break;
					}
				}







		public function get($_id) {
			$data = $this->getAllData();

			for ($i = 0; $i < sizeof($data); $i++)
			{
				$curDataItem = $data[$i];
				if (!$curDataItem) continue;
				$idKey = array_keys($this->dataTypeTemplate)[0];
				
				$dataId = $curDataItem[$idKey];
				if ($dataId != $_id) continue;
				
				return $this->_filterData($data[$i]);
			}

			return false;
		}



		public function remove($_id) {
			$data = $this->getAllData();
			$dataIdKey = array_keys($this->dataTypeTemplate)[0];
			$idType = $this->dataTypeTemplate[$dataIdKey];
			$_id = $this->__valueToType($_id, $idType);

			for ($i = 0; $i < sizeof($data); $i++)
			{
				$curDataItem = $this->_filterData($data[$i]);
				if (!$data[$i] || !$curDataItem) continue;

				$dataId = $curDataItem[$dataIdKey];
				if ($dataId != $_id) continue;

				array_splice($data, $i, 1);
				return $this->_writeData(json_encode($data));
			}

			return false;
		}



		public function update($_newData) {
			$newData = $this->_filterData($_newData);
			if (!$newData) return false;


			$dataIdKey 	= array_keys($this->dataTypeTemplate)[0];
			$dataId 	= $newData[$dataIdKey];
			$data 		= $this->get($dataId);

			if (!$dataId) return false;
			if ($data) return $this->_updateDataItem($newData);
			return $this->_createDataItem($newData);
		}

			public function _updateDataItem($newData) {
				$data = $this->getAllData();
				$dataIdKey = array_keys($this->dataTypeTemplate)[0];
				for ($i = 0; $i < sizeof($data); $i++)
				{
					if (!$data[$i]) continue;
					$dataId = $data[$i][$dataIdKey];
					if ($dataId != $newData[$dataIdKey]) continue;
					
					$data[$i] = $newData;
					return $this->_writeData(json_encode($data));
				}
				return false;
			}

			public function _createDataItem($newData) {
				$data = $this->getAllData();			
				array_push($data, $newData);
				return $this->_writeData(json_encode($data));
			}
	}
?>