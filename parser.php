<?php

function readUnit($unit) {
    switch($unit) {
        case "miljoen": return 1000000; break;
        case "x1000": return 1000; break;
        default: throw new Exception("Unit $unit unknown.");
    }
}

function readCSV() {
    $dataString = utf8_encode(file_get_contents("data/begrotingsstaten.csv"));
    $dataStrings = explode("\n", $dataString);
    array_shift($dataStrings);
    return $dataStrings;
}

function cleanAndConvert($dataStrings) {
    $table = [];
    foreach ($dataStrings as $dataString) {
        if ($dataString == "") continue;
        $row = explode(",", $dataString);
        if (strtoupper($row[6]) == "TOTAAL") continue;

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

function makeD3Readable($tree) {
    $d3Tree = [];
    foreach ($tree as $key => $value) {
        if (is_array($value)) {
            $object = [];
            $object['name'] = $key;
            $object['children'] = makeD3Readable($value);
            $d3Tree[] = $object;
        } else {
            $leave = [];
            $leave['name'] = $key;
            $leave['size'] = $value;
            $d3Tree[] = $leave;
        }
    }
    return $d3Tree;
}

function wrap($tree) {
    $d3Tree = [];
    $d3Tree['name'] = 'Begroting';
    $d3Tree['children'] = $tree;
    return $d3Tree;
}

$csv = readCSV();
$data = cleanAndConvert($csv);
$tree = convertToTree($data);
$output = wrap(makeD3Readable($tree));
print_r(json_encode($output));