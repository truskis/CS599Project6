<?php

$_POST = json_decode(file_get_contents('php://input'), true);
$db = 'combined.sqlite';

try
{
  $sql = new SQLite3($db, SQLITE3_OPEN_READONLY);
  $query = $_POST['query'];
  if (!$result = $sql->query($query))
  {
    $response = array('status' => 'error', 'result' => 'Query failed: ' . $query);
  }
  else
  {
    $rows = array();
    while ($row = $result->fetchArray(SQLITE3_ASSOC))
    {
      array_push($rows, $row);
    }
    $response = array('status' => 'success', 'result' => $rows);
  }
}
catch (Exception $e)
{
  $response = array('status' => 'error', 'result' => 'Database open failed');
}
finally
{
  exit(json_encode($response));
}

?>
