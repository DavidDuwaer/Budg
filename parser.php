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

function fillMissing($tree) {
    $values = getAllValues($tree);
    foreach ($values as $ministryKey => $ministry) {
        foreach ($ministry as $departmentKey => $department) {
            checkOrFill($ministryKey, $department, $tree);
        }
    }

    return $tree;
}

// Helper for fillMissing
function getAllValues($tree) {
    $output = [];
    foreach ($tree as $yearKey => $year) { // years
        foreach ($year as $typeKey => $type) { // types
            foreach ($type as $ministryKey => $ministry) { // ministry
                if (!keyInArray($ministryKey, $output)) $output[$ministryKey] = [];
                foreach ($ministry as $departmentKey => $department) {
                    if (!valueInArray($departmentKey, $output[$ministryKey])) {
                        $output[$ministryKey][] = $departmentKey;
                    }
                }
            }
        }
    }

    return $output;
}

// Helper for fillMissing
function checkOrFill($ministry, $department, &$tree) {
    foreach ($tree as $yearKey => $year) { // years
        foreach ($year as $typeKey => $type) { // types
            if (!keyInArray($ministry, $tree[$yearKey][$typeKey])) {
                $tree[$yearKey][$typeKey][$ministry] = [];
            }
            if (!keyInArray($department, $tree[$yearKey][$typeKey][$ministry])) {
                $tree[$yearKey][$typeKey][$ministry][$department] = 0;
            }
        }
    }
}

// Check if key is in array, case insensitive
function keyInArray($searchKey, $array) {
    $search = strtolower($searchKey);
    foreach ($array as $key => $value) {
        if ($search == strtolower($key)) {
            return true;
        }
    }
    return false;
}

// Check if value is in array, case insensitive
function valueInArray($searchValue, $array) {
    $search = strtolower($searchValue);
    foreach ($array as $key => $value) {
        if (strtolower($value) == $search) {
            return true;
        }
    }

    return false;
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
$completeTree = fillMissing($tree);
//$output = wrap(makeD3Readable($completeTree));
echo(json_encode($completeTree, JSON_UNESCAPED_UNICODE));