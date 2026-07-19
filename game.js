var scene = new Phaser.Scene("game");

const FruitNames = [
    'apple',
    'mango',
    'orange',
    'strawberry',
    'pear'
]
const FruitSize = 96
const HeadSize = 40
const GroundSize = 40
const StatusSize = 20
const SceneWidth = 800
const SceneHeight = 600
const InitialVelocity = 40
const NextLevelCorrectAnswers = 20
const MinLevel = 1
const MaxLevel = 7
const TasksLevels = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 3, 3, 3, 3, 3, 3],
    [1, 2, 3, 4, 4, 4, 4, 4],
    [1, 2, 3, 4, 5, 5, 5, 5],
    [1, 2, 3, 4, 5, 6, 6, 6],
    [1, 2, 3, 4, 5, 6, 7, 7],
    [1, 2, 3, 4, 5, 6, 7, 7],
]
const MinWeight = 1
const MaxWeight = 65536

const Config = {
    width: SceneWidth,
    height: SceneHeight,
    scene: scene,
    physics: {
        default: "arcade",
        arcade: {
            debug: false
        }
    },
}

var game = new Phaser.Game(Config)

// шапка
var head
var stats

// земля
var ground

// фрукты
var fruits = []

// звуки
var snd_correct
var snd_incorrect

// задание
var task_row // множимое
var task_col // множитель
var counter = 0
var correct = 0
var errors = 0
var level = parseInt(CookieManager.get("level"))
if (Number.isNaN(level)) {
    level = MinLevel
}

var tasksWeights = [
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
    [1024, 1024, 1024, 1024, 1024, 1024, 1024, 1024],
]

scene.init = function() {
};

scene.preload = function() {
    for (const name of FruitNames) {
        console.log("load: " + name)
        this.load.image(name, 'assets/png/'+name+'.png')
    }
    this.load.audio('correct', 'assets/sounds/correct.mp3');
    this.load.audio('incorrect', 'assets/sounds/incorrect.mp3');
};

scene.create = function() {
    this.cameras.main.setBackgroundColor('#0000FF')
    this.cameras.main.setViewport(0, 0, 800, 600)

    // добавить звуки
    snd_correct = this.sound.add("correct")
    snd_incorrect = this.sound.add("incorrect")

    // шапка
    CreateHead()
    CreateStatus()
    UpdateStatus()

    // земля
    CreateGround()

    // фрукты
    CreateFruits()
};

scene.update = function() {
    if ( counter === 0 ) {
        NextTask()
    }
};

scene.end = function() {
};

// случайное число в диапазон [min, max]
function randomInt(min, max) {
    return min + Math.floor((max - min + 1) * Math.random())
}

function getVelocity() {
    return Math.max(5, InitialVelocity + correct - errors)
}

// перемешать массив
function ShuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = randomInt(0, i-1)
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function CreateHead() {
    let rect = scene.add.rectangle(0, 0, SceneWidth, GroundSize, 0x11d48c)
    rect.setOrigin(0.5, 0.5)
    let label = scene.add.text(0, 0, "Фруктовая таблица", {
        fontFamily:'Arial',
        fontSize:'30px',
        color:'#000000',
        color: 'black',
      })
    label.setOrigin(0.5, 0.5)
    head = scene.add.container(SceneWidth/2, GroundSize/2, [rect, label])
    head.setSize(SceneWidth, HeadSize)
    head.label = label
}

function CreateStatus() {
    let rect = scene.add.rectangle(0, 0, SceneWidth, StatusSize, 0x11d48c)
    rect.setOrigin(0.5, 0.5)
    let label = scene.add.text(0, 0, "", {
        fontFamily:'Arial',
        fontSize:'15px',
        color:'#000000',
        color: 'black',
      })
    label.setOrigin(0.5, 0.5)
    stats = scene.add.container(SceneWidth/2, HeadSize+StatusSize/2, [rect, label])
    stats.setSize(SceneWidth, HeadSize)
    stats.label = label
}

function UpdateStatus() {
    stats.label.setText("Уровень:" + level.toString() + "    Ошибок:" + errors.toString() + "    Скорость:" + getVelocity().toString())
}

function CreateGround() {
    let rect = scene.add.rectangle(0, 0, SceneWidth, GroundSize, 0x11d48c)
    rect.setOrigin(0.5, 0.5)
    let label = scene.add.text(0, 0, "", {
        fontFamily:'Arial',
        fontSize:'30px',
        color:'#000000',
        color: 'black',
      })
    label.setOrigin(0.5, 0.5)
    ground = scene.add.container(SceneWidth/2, SceneHeight-GroundSize/2, [rect, label])
    ground.setSize(SceneWidth, GroundSize)
    ground.label = label
    ground.setDepth(-2)
    scene.physics.world.enable(ground)
    ground.body.setImmovable(true)
}

function CreateFruits() {
    for (var i=0; i<FruitNames.length; ++i) {
        let sprite = scene.add.sprite(0, 0, FruitNames[i])
        sprite.setOrigin(0.5)
        let label = scene.add.text(0, 0, "", {
            fontFamily:'Arial',
            fontSize:'30px',
            color:'#000000',
            color: 'black',
        })
        // текст должен быть в центре фрукта
        switch (FruitNames[i]) {
            case 'apple':
                label.setOrigin(0.5, 0.3)
                break
            case 'mango':
                label.setOrigin(0.3, 0.3)
                break
            case 'orange':
                label.setOrigin(0.5, 0.2)
                break
            case 'strawberry':
                label.setOrigin(0.15, 0.3)
                break
            case 'pear':
                label.setOrigin(0.7, 0.3)
                break
            default:
                label.setOrigin(0.5, 0.3)
                break
        }
        let fruit = scene.add.container(randomInt(FruitSize/2, SceneWidth-FruitSize/2), -i*FruitSize-FruitSize/2, [sprite, label]);
        fruit.setSize(FruitSize, FruitSize)
        scene.physics.world.enable(fruit)
        scene.physics.add.collider(ground, fruit, function (g, f) {
            if ( g.body.touching.up === true && f.body.touching.down === true ) {
                console.log("Collision with ground: " + f.taskText.text)
                if ( TaskCorrect(f) ) {
                    OnError()
                } else {
                    counter = Math.max(counter-1, 0)
                }
                RemoveFruit(f)
            }
        })

        fruit.on('pointerdown', function() {
            if (TaskCorrect(this)) {
                OnCorrect()
            } else {
                OnError()
            }
        });

        fruit.taskText = label

        fruit.setActive(false)
        fruit.setVisible(false)
        fruit.setInteractive(new Phaser.Geom.Rectangle(0, 0, FruitSize, FruitSize), Phaser.Geom.Rectangle.Contains)

        fruits.push(fruit)
    }
}

function RemoveFruit(fruit) {
    fruit.body.stop()
    fruit.setX(-FruitSize)
    fruit.setY(-FruitSize)
    fruit.setVisible(false)
    fruit.setActive(false)
}

function OnCorrect() {
    snd_correct.play()
    correct++
    counter = 0
    AdjustWeights(true)
    if (correct >= NextLevelCorrectAnswers) {
        NextLevel()
    }
    UpdateStatus()
}

function OnError() {
    snd_incorrect.play()
    correct = 0
    errors++
    counter = 0
    AdjustWeights(false)
    UpdateStatus()
}

function AdjustWeights(correct) {
    var weight = tasksWeights[task_row][task_col]
    if (correct) {
        weight = Math.max(MinWeight, Math.floor(weight / 2))
    } else {
        weight = Math.min(MaxWeight, Math.floor(weight * 2))
    }
    tasksWeights[task_row][task_col] = weight
}

function NextLevel() {
    if (level < MaxLevel) {
        level++
        correct = 0
        errors = 0
        CookieManager.set("level", String(level))
    }
}

function TaskCorrect(fruit) {
    const correct = (task_row + 2) * (task_col + 2)
    return fruit.taskText.text === correct.toString()
}

function CreateTask() {
    var totalSum = 0
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            if (TasksLevels[row][col] <= level) {
                totalSum += tasksWeights[row][col]
            }
        }
    }
    var random = randomInt(0, totalSum)
    var sum = 0
    for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 7; col++) {
            if (TasksLevels[row][col] <= level) {
                sum += tasksWeights[row][col]
                if (random <= sum)
                {
                    task_row = row
                    task_col = col
                    return
                }
            }
        }
    }
    // impossible
    task_row = 1
    task_col = 1
}

function NextTask() {

    CreateTask()

    const multiplicand = task_row + 2;
    const factor       = task_col + 2;
    const product      = multiplicand * factor

    // создание вариантов ответа
    var answers = [
        product - 2,
        product - 1,
        product - 0,
        product + 1,
        product + 2,
    ]
    ShuffleArray(answers)
    for (var i=0; i<5; i++) {
        fruits[i].taskText.setText(answers[i].toString())
    }

    // создание фруктов
    for (var i=0; i<fruits.length; ++i) {
        fruits[i].setX(randomInt(FruitSize/2, SceneWidth-FruitSize/2))
        fruits[i].setY(-FruitSize/2 - i*FruitSize)
        fruits[i].setActive(true)
        fruits[i].setVisible(true)
        fruits[i].body.setVelocity(0, getVelocity())
        fruits[i].body.setAngularVelocity(randomInt(-5, 5))
    }

    ShuffleArray(fruits)

    counter = fruits.length

    ground.label.setText(multiplicand.toString() + " x " + factor.toString())
}
