<?php
	require_once __DIR__ . "/../modules/app.php";

	$component = false;
	try {
		$component = json_decode((string)$_POST['component'], true);
	} 
	catch (exception $e) {
		die('E_invalidData');
	} 

	$result = $App->component->updateComponent($component);
	if (is_string($result))
	{
		$response = array(
			"error" => $result,
			"result" => false,
		);

		die(json_encode($response));
	}

	$response = array(
		"error" => false,
		"result" => $result
	);
	echo json_encode($response);
?>