<?php
$directory = "../files/";

$dir = opendir($directory);

$structure = array();

while($file = readdir($dir)){
  $structure[] = $file;
}

print json_encode($structure);
exit();
?>