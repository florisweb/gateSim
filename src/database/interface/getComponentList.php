<?php
	require_once __DIR__ . "/../modules/app.php";

	$components = $App->component->getAllComponents();
	if (is_string($components))
	{
		$response = array(
			"error" => $components,
			"result" => false,
		);

		die(json_encode($response));
	}

	$response = array(
		"error" => false,
		"result" => $components
	);

	echo json_encode($response);
?>