function Game(savegame) {
    var game = this
    
    game.savegame = savegame
    game.interactionMode = "command"
    game.interactionModeChanged = new SprigganEventRecurring()
    game.contentLoaded = new SprigganEventOnce()
    
    game.characters = []
    
    game.factions = []
    game.partyFaction = new Faction(game)
    game.enemyFaction = new Faction(game)
    new Animosity(game.partyFaction, game.enemyFaction)
    
    var roomScriptContentManager = ShowLoadingScreen(LoadedRoomScript)
    roomScriptContentManager.add(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")
    
    function LoadedRoomScript() {
        game.contentManager = ShowLoadingScreen(LoadedContent)
        
        roomScriptContentManager.get(SprigganJavaScript, "rooms/" + savegame.roomPath + "/script.js")(game)
        
        game.tileset = Tilesets[game.tilesetName]
        game.tilesetSpriteSheet = "battle/tilesets/" + game.tilesetName
        game.contentManager.add(SprigganSpriteSheet, game.tilesetSpriteSheet)
        
        new HeroController(game.spawnRoom, "pistol")
        new HeroController(game.spawnRoom, "sword")
        roomScriptContentManager.dispose()
    }
    
    function LoadedContent() {
        game.viewport = new SprigganViewport(screenWidth, screenHeight)
        game.group = new SprigganGroup(game.viewport)
        game.group.move(screenWidth / 2, (screenHeight - game.tileset.gridSpacing) / 2)
        game.backgroundGroup = new SprigganGroup(game.group)
        game.backgroundOverlayGroup = new SprigganGroup(game.group)
        game.itemPickupsGroup = new SprigganGroup(game.group)
        game.markersGroup = new SprigganGroup(game.group)
        game.charactersGroup = new SprigganGroup(game.group)
        game.effectsGroup = new SprigganGroup(game.group)
        game.foregroundGroup = new SprigganGroup(game.group)

        game.contentLoaded.raise()
        
        game.inventory = new Inventory(game)
        game.playPause = new PlayPause(game)
        
        game.setMode(new CombatMode())
    }
}

Game.prototype.dispose = function() {
    this.contentManager.dispose()
    this.viewport.dispose()
    this.inventory.dispose()
    this.playPause.dispose()
}

Game.prototype.setMode = function(mode) {
    if (this.mode) this.mode.left()
    this.mode = mode
    if (this.mode.showInventory)
        this.inventory.viewport.show()
    else
        this.inventory.viewport.hide()
    mode.game = this
    this.mode.entered()
}

function CombatMode() { }

CombatMode.prototype.clicked = function(clicked) {
    if (clicked instanceof HeroController) this.game.setMode(new HeroSelectedMode(clicked))
    if (clicked instanceof InventorySlot) {
        if (clicked.reservedFor) return
        if (!clicked.item) return
        if (clicked.item["throw"]) this.game.setMode(new ThrowingItemMode(clicked))
    }
}

CombatMode.prototype.entered = function() {}
CombatMode.prototype.showInventory = true
CombatMode.prototype.left = function() {}

function HeroSelectedMode(heroController) { 
    this.heroController = heroController
    this.sprite = new SprigganSprite(this.heroController.character.group, BattleContent, "battle/markers")
    this.sprite.loop("selected")
}

HeroSelectedMode.prototype.entered = function() {}

HeroSelectedMode.prototype.clicked = function(clicked) {
    if (clicked == this.heroController) {
        this.game.setMode(new CombatMode())
    } else if (clicked instanceof HeroController) {
        this.game.setMode(new HeroSelectedMode(clicked))
    } else {
        var room
        if (clicked instanceof Room) room = clicked
        if (clicked instanceof EnemyController) room = clicked.character.room
        if (clicked instanceof ItemPickup) room = clicked.room
        if (!room) return
        this.heroController.character.setDestination(room)
        this.game.setMode(new CombatMode())
    }
}

HeroSelectedMode.prototype.left = function() {
    this.sprite.dispose()
}

HeroSelectedMode.prototype.showInventory = true

function ThrowingItemMode(inventorySlot) {
    this.inventorySlot = inventorySlot
    this.item = this.inventorySlot.item
}

ThrowingItemMode.prototype.entered = function() {}

ThrowingItemMode.prototype.clicked = function(clicked) {
    var mode = this
    
    var room
    if (clicked instanceof Room) room = clicked
    if (clicked instanceof EnemyController) room = clicked.character.room
    if (clicked instanceof HeroController) room = clicked.character.room
    if (clicked instanceof ItemPickup) room = clicked.room
    if (!room) return
    mode.inventorySlot.reserveFor("throwing")
    new Order(mode.game.partyFaction, mode.game.markersGroup, "throwing", room.x * mode.game.tileset.gridSpacing, room.y * mode.game.tileset.gridSpacing, CanExecute, Execute, Cancel)

    function CanExecute(character) {
        return character.room.hasLineOfSightToRoom(room)
    }
    
    function Execute(character, then) {
        mode.inventorySlot.replace(null)
        
        // TODO: this can currently be interrupted
        character.torsoSpriteGroup.play("throw" + Capitalize(character.room.getDirectionToRoom(room) || "down"), function() {
            mode.item["throw"](character, room)
            then()
        })
    }
    
    function Cancel() {
        mode.inventorySlot.reserveFor(null)
    }

    mode.game.setMode(new CombatMode())
}

ThrowingItemMode.prototype.left = function() {}