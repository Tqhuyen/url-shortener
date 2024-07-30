<?php
require 'vendor/autoload.php';

use Src\Controller\Database;
use MongoDB\Client;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: OPTIONS,GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

if ($uri[1] !== "api") {
    $filter = ["_id"=> $uri[1]];
    $client = new Client("mongodb://db:27017/");
    $url_collection = $client->shorten_url->url_mapings;

    $url_map = $url_collection->findOne($filter);

    if ($url_map) {
        echo $url_map['longURL'];
        header("Location: " . $url_map['longURL']);

    }
    else {
        header("HTTP/1.1 404 Not Found");
        exit();
    }
}

function generateShortCode($length = 8) {
    return substr(str_shuffle("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, $length);
}


$requestMethod = $_SERVER["REQUEST_METHOD"];
if (isset($uri[2])) {
    if ($uri[2] !== "shorten") {
        header("HTTP/1.1 404 Not Found");
        exit();
    }
    if ($requestMethod == "POST" ) {
        $postBody = file_get_contents('php://input');
        $data = json_decode($postBody, true);
        $longURL = $data["longURL"];
        
        $shortenUrlSuffix = generateShortCode();
        $filter = ['_id' => $shortenUrlSuffix];
        $client = new Client("mongodb://db:27017/");
        $url_collection = $client->shorten_url->url_mapings;

        $duplicateHash = $url_collection->findOne($filter);
        while ($duplicateHash != null) {
            $shortenUrlSuffix = generateShortCode();
            $filter = ['_id' => $shortenUrlSuffix];
            $duplicateHash = $url_collection->findOne($filter);
        }
        $url_map = $filter;
        $url_map["shortURL"] = "https://go.hekate.ai/" . $shortenUrlSuffix;
        $url_map["longURL"] = $longURL;
        $url_collection->insertOne($url_map);
        http_response_code(200);
        echo json_encode(['success' => true,'status' => 'ok', 'message' =>  "Short is: " . $url_map["shortURL"], 'id' => $shortenUrlSuffix]);
    }
    elseif ($requestMethod == "OPTIONS") {
        http_response_code(200);
        echo json_encode(['status' => 'ok', 'message' => 'ok']);
    }
    else {
        http_response_code(405);
        header('Allow: POST');
        
        echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
        exit();
    }
}




?>
