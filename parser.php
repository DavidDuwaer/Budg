<?php

function readUnit($unit) {
    switch($unit) {
        case "miljoen": return 1000000; break;
        case "x1000": return 1000; break;
        default: throw new Exception("Unit $unit unknown.");
    }
}

function readCSV() {
    $dataString = file_get_contents("data/begrotingsstaten.csv");
    $dataStrings = explode("\n", $dataString);
    array_shift($dataStrings);
    return $dataStrings;
}

function cleanAndConvert($dataStrings) {
    $table = [];
    foreach ($dataStrings as $dataString) {
        if ($dataString == "") continue;
        $row = explode(",", $dataString);

        $data = [
            'year'          => $row[0],                     // Begrotingsjaar
            'type'          => $row[3],                     // Uitgaven (U), Verplichtingen (V), Ontvangsten (O)
            'budget'        => $row[4],                     // Begrotingsstaat
            'section'       => $row[5],                     // Onderdeel
            'description'   => $row[6],                     // Omschrijving
            'draft'         => $row[7] * readUnit($row[2]), // Ontwerpbegroting
        ];
        $table[] = $data;
    }
    return $table;
}

function addKey(&$tree, $key) {
    if (!array_key_exists($key, $tree)) {
        $tree[$key] = [];
    }
}

function convertToTree($data) {
    // year > type > budget > description
    $tree = [];
    foreach ($data as $object) {
        addKey($tree, $object['year']);
        addKey($tree[$object['year']], $object['type']);
        addKey($tree[$object['year']][$object['type']], $object['budget']);
        addKey($tree[$object['year']][$object['type']][$object['budget']], $object['description']);
        $tree[$object['year']][$object['type']][$object['budget']][$object['description']] = $object['draft'];
    }
    return $tree;
}

$csv = readCSV();
$data = cleanAndConvert($csv);
$tree = convertToTree($data);
print_r($tree);