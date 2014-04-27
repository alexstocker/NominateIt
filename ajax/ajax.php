<?php 

include_once '../db/db.inc.php';
include_once '../db/preheader.php';

$func = $_REQUEST['func'];
$table = $_REQUEST['table'];
$field = $_REQUEST['field'];
$pk = $_REQUEST['pk'];
$id = $_REQUEST['id'];
$last = $_REQUEST['last'];
$where = $_REQUEST['where'];

if($_REQUEST['func'] == 'getRows'){
	//getRows($table,$field,$pk,$id,$where,$last);
	$results = new Pfuscher();
	$results->getPfuscher($last);
}

if($_REQUEST['func'] == 'insert'){
	//insert($table,$field,$pk,$id,$where,$last);
	$insert = new pfuscher();
	$insert->dataPfuscher($_POST['formdata']);
    $insert->addPfuscher();
}

if($_REQUEST['func'] == 'nominate'){
	$nominate = new awards();
	$nominate->addAwards($_POST['data']);
}

if($_REQUEST['func'] == 'insertOpinion'){
	$insert = new opinion();
	$insert->addOpinion($_POST['data']);
}

if($_REQUEST['func'] == 'search'){
	$results = new Pfuscher();
	$results->searchPfuscher($_GET['data']);
}

class pfuscher{
	
	var $post;
	var $table = 'pfuscher';
	var $data;
	
	function __construct(){
		
	}
	
	function searchPfuscher($term){
		$results = $this->getPfuscher('0',$term);
	}
	
	function getPfuscher($last,$term = '0'){
		$possibleAwards = new award();
		//$possibleAwards->getAward();
		if($term != '0'){
			$where = "WHERE title LIKE '%".mysql_real_escape_string($term)."%'";
		}else{
			$where = '';
		}
		
		if($last != "end"){
			$max = 1 ;
			if($last == '0') $min = '0'; else $min = $last;
			if(!$limit) $limit = 'LIMIT '.$min.','.$max;
			if(!empty($where)) $limit = '';
			$sql = "SELECT * FROM $this->table $where ORDER BY pfuscher_id DESC $limit";
			$results = q($sql);
		}
		//error_log($sql.' '.count($results));
		if($results){
			$output = array();
			foreach($results as $result => $val){
				$output[$result] = $val;
				foreach($val as $k => $v){
					if($k == 'pfuscher_id'){
						$awards = new awards();
						$output[$result]['award'] = $possibleAwards->getAward($v);
							$i = 0;
							foreach($output[$result]['award'] as $possible){
									foreach($awards->getAwards($v) as $akey => $avalue){
										if($possible['award_id'] == $avalue['award_id']){
											$opinions = new opinion();
											$o = $opinions->getOpinion($v,$avalue['awards_id']);
											$output[$result]['award'][$i]['opinion'] = $o;
											//error_log($v.' '.$avalue['awards_id']);
											$output[$result]['award'][$i]['votes'] = $avalue['votes']; 
										}
									}
							$i++;
							}
					}
				}
				
			}
			echo json_encode($output);
		}else{
			echo json_encode(array('status' => 'end','message'=> 'No more records!', 'limit' => $max));
		}
	}
	
	function addPfuscher(){
		$values = $this->values();
		$q = "INSERT INTO $this->table SET $values ";
		$insert = qr($q);
		if($insert){
			echo 'ok';
		}else{
			echo 'failure';
		}
	}
	
	function deletePfuscher(){
		
	}
	
	function updatePfuscher(){
		
	}
	
	function values(){
		$c = count($this->data);
		$i = 0;
		foreach($this->data as $d){
			if(!empty($d['data'])) $values .= $d['field'] ."='". mysql_real_escape_string(urldecode($d['data']))."'";		
			if($i < ($c - 1)) $values .= ',';
		$i++;
		}
		$values = rtrim($values,',');
		$values = str_replace(',,',',',$values);
		$values = ltrim($values,',');
		return $values;
	}
	
	function dataPfuscher($string){
		$stringarray = explode('&',$string);
		$i = 0;
		foreach($stringarray as $s){
			$array[$i] = explode('=',$s);
			$array[$i]['field'] = $array[$i][0];
			$array[$i]['data'] = $array[$i][1];
			unset($array[$i][0],$array[$i][1]);
			$i++;
		}
		$this->data = $array;
	}
}

class awards {
	
	var $table = 'awards';
	var $vtable = 'vote';
	var $ltable = 'locked';
	var $ip;
	var $leasetime = '-1';
	var $leaseunit = 'days';
	var $current_lease;
	
	function __construct(){
		
	}
	
	function getAwards($id){
		$sql = "SELECT * FROM $this->table WHERE pfuscher_id = '$id'";
		$results = q($sql);
		
		$i = 0;
		foreach($results as $result){
			$awards = $this->getThisAward($result['pfuscher_id'],$result['award_id']);
			foreach($awards as $award => $a){
				$votes = $this->countVotes($id,$a['awards_id']);
				$results[$i]['votes'] = $votes;
			}
		$i++;
		}
		return $results;
	}
	
	function getThisAward($pfuscher_id,$award_id){
		$sql = "SELECT * FROM $this->table WHERE pfuscher_id = '$pfuscher_id' AND award_id = '$award_id' ";
		$results = q($sql);
		return $results;
	}
	
	function addAwards($add){
		$id = explode('-',$add);
		$pfuscher_id = $id[1];
		$award_id = $id[2];
		$award = $this->getThisAward($pfuscher_id,$award_id);
		if($award){
			foreach($award as $aw => $a){
				if($a['award_id'] == $award_id){
					$added = $this->addVote($pfuscher_id,$a['awards_id']);
				}	
			}
		}else{
			$q = "INSERT INTO $this->table SET award_id = '$award_id', pfuscher_id = '$pfuscher_id' ";
			$insert = qr($q);
			$awards_id = mysql_insert_id();
			$added = $this->addVote($pfuscher_id,$awards_id);
		}
		if($added){
			echo "votes-".$pfuscher_id."-".$award_id;
		}
	}
	
	function deleteAwards(){
		
	}
	
	function updateAwards(){
		
	}
	
	function suggestAwards(){
		
	}
	
	function addVote($pfuscher_id,$awards_id){
		$locked = $this->lockVote($pfuscher_id,$awards_id);
		if(!$locked){
			// Insert vote
			$q = "INSERT INTO $this->vtable SET awards_id = '$awards_id', pfuscher_id = '$pfuscher_id' ";
			$insert = qr($q);
			$last_vote = mysql_insert_id();
			// Lock client
			$qlock = "INSERT INTO $this->ltable " .
					"SET awards_id = '$awards_id', " .
					"pfuscher_id = '$pfuscher_id', " .
					"vote_id = '$last_vote', " .
					"ip = '".$_SERVER['REMOTE_ADDR']."', " .
					"lease = '$this->current_lease'";
			$lock = qr($qlock);
			return true;
		}else{
			return false;
		}
	}
	
	function lockVote($pfuscher_id,$awards_id){
		$this->current_lease = $current_lease = date('Y-m-d H:i:s', strtotime($current_lease .' '.$this->leasetime.' '.$this->leaseunit.''));
		$q = "SELECT EXISTS(SELECT 1 FROM $this->ltable WHERE pfuscher_id = '$pfuscher_id' AND awards_id = '$awards_id' AND ip = '".$_SERVER['REMOTE_ADDR']."' AND lease > '$current_lease')";
		$exists = q1($q);
		if($exists){
			error_log('is locked!');
			return true;
		}else{
			return false;	
		}
	}
	
	function countVotes($pfuscher_id,$awards_id){
		$q = "SELECT vote_id FROM $this->vtable WHERE pfuscher_id = '$pfuscher_id' AND awards_id = '$awards_id' ";
		$results = q($q);
		if($results){
			$c = count($results);
		 	return $c;
		}else{
			return 'no votes';
		}
	}
}

class award {
	
	var $table = 'award';
	
	function __construct(){
		
	}
	
	function getAward($id){ 
		$sql = "SELECT * FROM $this->table";
		$results = q($sql);		
		return $results;
	}
	
	function suggestAward(){
		
	}
	
	function approveAward(){
		
	}
	
	function refuseAward(){
		
	}
}

class opinion {
	
	var $table = 'opinion';
	var $opinions;
	
	function __construct(){
		
	}
	
	function addOpinion($data){
		$stringarray = explode('&',$data);
		$i = 0;
		foreach($stringarray as $s){
			$array[$i] = explode('=',$s);
			$array[$i]['field'] = $array[$i][0];
			$array[$i]['data'] = $array[$i][1];
			unset($array[$i][0],$array[$i][1]);
			$i++;
		}
		$array;
		
		foreach($array as $field){
			if($field['field'] == 'opinion'){
				if($field['data'] == 'j') $opinion = 1;
				if($field['data'] == 'n') $opinion = -1;
				if($field['data'] == '0') $opinion = 0;
			}
			if($field['field'] == 'id'){ 
			$id = explode('-',$field['data']);
			$pfuscher_id = $id[1];
			$award_id = $id[2];
			$award = new awards();
			$t = $award->getThisAward($pfuscher_id,$award_id);
			$awards_id = $t[0]['awards_id'];
			}
			if($field['field'] == 'comment'){
				$comment= $field['data'];
			}
		}
		
		$q = "INSERT INTO $this->table " .
					"SET awards_id = '$awards_id', " .
					"pfuscher_id = '$pfuscher_id', " .
					"plus = '0', " .
					"neutral = '0', " .
					"minus = '0', " .
					"opinion = '$opinion', " .
					"comment = '$comment'";
		$insert = qr($q);
	}
	
	function deleteOpinion(){
		
	}
	
	function updateOpinion(){ 
		
	}
	
	function getOpinion($id,$award){
		$q = "SELECT * FROM $this->table WHERE pfuscher_id = '$id' AND awards_id = '$award'";
		$results = q($q);
		if($results){
			$s = $this->countOpinion($results);
			return $s;	
		}else{
			return false;
		}
	}
	
	function countOpinion($opinions){
		$array = '';
		$p = 0; // pro
		$c = 0; // contra
		$n = 0; // neutral
		foreach($opinions as $o){
			if($o['opinion'] == 1) $p++;
			if($o['opinion'] == -1) $c++;
			if($o['opinion'] == 0) $c++;
//			error_log($o['pfuscher_id'].' '.$o['opinion_id'].' '.$o['opinion']);
			
		}
		//error_log($p.' '.$c.' '.$n);
		$array = array('pro' => $p, 'con' => $c, 'neu' => $n);
		//return $p.' '.$c.' '.$n;
		return $array;
	}
}
?>
