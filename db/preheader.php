<?php
include_once 'db.inc.php';

$MYSQL_HOST = DB_SERVER;
$MYSQL_LOGIN = DB_USERNAME;
$MYSQL_PASS = DB_PASSWORD;
$MYSQL_DB = DB_DATABASE;

session_start();

error_reporting(E_ALL - E_NOTICE);

// Create connection
$db = new mysqli($MYSQL_HOST,$MYSQL_LOGIN,$MYSQL_PASS,$MYSQL_DB);
// Check connection
if ($db->connect_error) {
	die("Connection failed: " . $db->connect_error);
}

if(!$db){
	echo('Unable to authenticate user.');
	exit;
}

mysqli_query($db,"SET NAMES 'utf8'");
mysqli_query($db,"SET character_set_results = 'utf8_general_ci', character_set_client = 'utf8_general_ci', character_set_connection = 'utf8_general_ci', character_set_database = 'utf8_general_ci', character_set_server = 'utf8_general_ci'", $db);

//TODO: Add PHP Version check
//TODO: Add pdo
//TODO: Add fallback mysqli if pdo is not available
//TODO: Add fallback mysql if mysqli is not available

if (!function_exists('q')) {
	function q($q, $debug = 0){
		global $db;

		$r = mysqli_query($db,$q);

		if(mysqli_error($db)){
			echo mysqli_error($db);
			echo "$q<br>";
		}

		if($debug == 1)
			echo "<br>$q<br>";

		if(stristr(substr($q,0,8),"delete") ||	stristr(substr($q,0,8),"insert") || stristr(substr($q,0,8),"update")){
			if(mysqli_affected_rows($db) > 0)
				return true;
			else
				return false;
		}
		if(mysqli_num_rows($r) > 1){
			while($row = mysqli_fetch_array($r, MYSQL_ASSOC)){
				$results[] = $row;
			}
		}
		else if(mysqli_num_rows($r) == 1){
			$results = array();
			$results[] = mysqli_fetch_array($r,MYSQLI_ASSOC);
		}

		else
			$results = array();
		return $results;
	}
}

if (!function_exists('q1')) {
	function q1($q, $debug = 0){
		global $db;
		$r = mysqli_query($db,$q);
		if(mysqli_error($db)){
			echo mysqli_error($db);
			echo "<br>$q<br>";
		}

		if($debug == 1)
			echo "<br>$q<br>";
		$row = mysqli_fetch_array($r);

		if(count($row) == 2)
			return $row[0];
		else
			return $row;
	}
}

if (!function_exists('qr')) {
	function qr($q, $debug = 0){
		global $db;
		$r = mysqli_query($db,$q);
		if(mysqli_error($db)){
			echo mysqli_error($db);
			echo "<br>$q<br>";
		}

		if($debug == 1)
			echo "<br>$q<br>";

		if(stristr(substr($q,0,8),"delete") ||	stristr(substr($q,0,8),"insert") || stristr(substr($q,0,8),"update")){
			if(mysqli_affected_rows($db) > 0)
				return true;
			else
				return false;
		}

		$results = array();
		$results[] = mysqli_fetch_array($db,$r);
		$results = $results[0];

		return $results;
	}
}

if (!function_exists('qa')) {
	function qa($q, $debug = 0){
		global $db;
		$r = mysqli_query($db,$q);
		if(mysqli_error($db)){
			echo mysqli_error($db);
			echo "<br>$q<br>";
		}

		if($debug == 1)
			echo "<br>$q<br>";

		if(stristr(substr($q,0,8),"delete") ||	stristr(substr($q,0,8),"insert") || stristr(substr($q,0,8),"update")){
			if(mysqli_affected_rows($db) > 0)
				return true;
			else
				return false;
		}

		$results = array();
		$results[] = mysqli_fetch_object($db,$r);
		$results = $results[0];

		return $results;
	}
}
?>