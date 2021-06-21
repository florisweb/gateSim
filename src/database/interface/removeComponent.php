<?php
	require_once __DIR__ . "/../modules/app.php";

	$componentId = (int)$_POST['id'];
	$result = $App->component->removeComponent($componentId);
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