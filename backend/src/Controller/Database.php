<?php
namespace Src\Controller;
require 'vendor/autoload.php';
use Exception;
use MongoDB\Client;

class Database {
    public static $client;

    public static function connectToDatabase() {
        $client = new Client("mongodb://localhost:27017");
        return self::$client->shortenURL->url_mapings;
    }
}

?>
