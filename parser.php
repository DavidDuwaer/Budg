<?php
header('Content-Type: application/json');

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
        if (strtoupper($row[6]) == "TOTAAL" || strtoupper($row[4]) == "RIJK") continue;

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

    return $key;
}

function convertToTree($data) {
    // year > type > budget > description
    $tree = [];
    foreach ($data as $object) {
        $keys = [];
        $keys[] = addKey($tree, $object['year']);
        $keys[] = addKey($tree[$keys[0]], $object['type']);
        $keys[] = addKey($tree[$keys[0]][$keys[1]], $object['budget']);
        $keys[] = addKey($tree[$keys[0]][$keys[1]][$keys[2]], $object['description']);
        $tree[$keys[0]][$keys[1]][$keys[2]][$keys[3]] = $object['draft'];
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
//$output = wrap(makeD3Readable($tree));
echo(json_encode($tree, JSON_UNESCAPED_UNICODE));