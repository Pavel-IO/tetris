<?php

require __DIR__ . '/../vendor/autoload.php';

use Nette\Database\Connection;
use Nette\Utils\Json;
use Nette\Neon\Neon;

class GameSync {
    private Connection $db;

    public function __construct(Connection $db) {
        $this->db = $db;
    }

    public function insertRecord(array $values): void {
        $this->db->query('INSERT INTO masakr_bitva ?', $values + ['inserted' => new \Datetime]);
    }

    public function insertField($x, $y, $status) {
        $data = [
            'field_x' => $x,
            'field_y' => $y,
            'status' => $status,
        ];
        $this->insertRecord($data);
        return true;
    }

    public function getChanges() {
        $lines = $this->db->fetchAll('SELECT field_x, field_y, status FROM masakr_bitva ORDER BY id');
        $output = [];
        foreach ($lines as $line) {
            $output[] = '{"x": ' . $line['field_x'] . ', "y": ' . $line['field_y'] . ', "status": ' . $line['status'] . '}';
        }
        return '[' . implode(', ', $output) . ']';
    }
}

$dbLogin = Neon::decode(file_get_contents('config.local.neon'))['database'];
$config = [
    'dbConnection' => new Connection($dbLogin['dsn'] . 'dbname=' . $dbLogin['dbname'], $dbLogin['user'], $dbLogin['password'])
];

$game = new GameSync($config['dbConnection']);

if (isset($_POST['xhrInput'])) {
    $in = Json::decode($_POST['xhrInput'], Json::FORCE_ARRAY);
    $result = $game->insertField($in['x'], $in['y'], $in['status']);
    echo $game->getChanges();
} else {
    //$game->insertField(3, 4, 2);
    echo $game->getChanges();
}
