<?php

declare(strict_types=1);

namespace App\Presenters;

use Nette;
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

class Shape {
    private $points;
    private $coords;

    public function __construct($points, $coords) {
        $this->points = $points;
        $this->coords = $coords;
    }

    public function getPoints() {
        return $this->points;
    }

    public function getCoords() {
        return $this->coords;
    }

    public function getIndexes() {
        $k = 5;
        $output = [];
        for ($x = 0; $x < $k; $x++) {
            for ($y = 0; $y < $k; $y++) {
                if (in_array([$x, $y], $this->coords)) {
                    $output[] = $k * $y + $x;
                }
            }
        }
        return $output;
    }
}

final class BitvaPresenter extends Nette\Application\UI\Presenter {
    private $db;
    const ROWS = 10;
    const COLS = 10;

    public function __construct(Nette\Database\Connection $database) {
        $this->db = $database;
        parent::__construct();
    }

    public function zeros($cols, $rows) {
        $row = [];
        for ($j = 0; $j < $cols; $j++) {
            $row[] = 0;
        }
        $plan = [];
        for ($i = 0; $i < $rows; $i++) {
            $plan[] = $row;
        }
        return $plan;
    }

    public function printPlan($plan) {
        $rows = [];
        foreach ($plan as $row) {
            $rows[] = implode(' ', $row);
        }
        dump($rows);
    }

    public function loadTeritory() {
        $plan = $this->zeros(10, 10);
        $lines = $this->db->fetchAll('SELECT field_x, field_y, status FROM masakr_bitva ORDER BY id');
        $output = [];
        foreach ($lines as $line) {
            $plan[$line['field_x']][$line['field_y']] = $line['status'];
        }
        return $plan;
    }

    public function getSize($shape) {
        $sx = $sy = 0;
        foreach ($shape as list($x, $y)) {
            $sx = max($sx, $x);
            $sy = max($sy, $y);
        }
        return [$sx, $sy];
    }

    public function compareOnePosition($plan, $shape, $dx, $dy, $group) {
        foreach ($shape as list($x, $y)) {
            if ($plan[$y + $dy][$x + $dx] != $group) {
                return false;
            }
        }
        return true;
    }

    public function countShape($plan, $shape, $group) {
        $match = 0;
        list($sizeX, $sizeY) = $this->getSize($shape->getCoords());
        for ($dx = 0; $dx < self::COLS - $sizeX; $dx++) {
            for ($dy = 0; $dy < self::ROWS - $sizeY; $dy++) {
                if ($this->compareOnePosition($plan, $shape->getCoords(), $dx, $dy, $group)) {
                    $match++;
                }
            }
        }
        return $match;
    }

    public function renderVysledky() {
        $plan = $this->loadTeritory();
        // $this->printPlan($plan);

        $shapes = [];
        $shapes[] = new Shape(10, [[0, 0], [0, 1], [0, 2], [0, 3], [1, 1], [2, 2], [3, 1], [4, 0], [4, 1], [4, 2], [4, 3]]);
        $shapes[] = new Shape(1, [[0, 0], [1, 0], [2, 0], [3, 0]]);
        $shapes[] = new Shape(8, [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [0, 2], [1, 2], [3, 2], [4, 2]]);
        $shapes[] = new Shape(1, [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [1, 2]]);
        $shapes[] = new Shape(4, [[1, 0], [2, 0], [0, 1], [3, 1], [0, 2], [3, 2], [1, 3], [2, 3]]);

        $table = [];
        $groups = [];
        for ($g = 1; $g <= 3; $g++) {
            $groupPoints = 0;
            $output = [];
            foreach ($shapes as $index => $shape) {
                $shapeCount = $this->countShape($plan, $shape, $g);
                $groupPoints += $shape->getPoints() * $shapeCount;
                $table[$index][$g] = $shapeCount;
                if ($shapeCount) {
                    $output[] = 'tvar ' . chr(65 + $index) . ' ' . $shapeCount . 'x po ' . $shape->getPoints() . ' bodech';
                }
            }
            $groups[$g] = $groupPoints;
            //$str = 'Tym ' . $g . ' celkem ' . $groupPoints . ' bodu (' . implode(', ', $output) . ').';
            //dump($str);
        }
        $this->template->shapes = $shapes;
        $this->template->table = $table;
        $this->template->groups = $groups;
    }

    public function renderRefresh() {
        $game = new GameSync($this->db);

        if (isset($_POST['xhrInput'])) {
            $list = Json::decode($_POST['xhrInput'], Json::FORCE_ARRAY);
            foreach ($list as $in) {
                $result = $game->insertField($in['x'], $in['y'], $in['status']);
            }
            echo $game->getChanges();
        } else {
            //$game->insertField(3, 4, 2);
            echo $game->getChanges();
        }

        exit;
    }
}
