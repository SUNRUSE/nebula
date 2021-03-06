function Inventory(game) {
    var inventory = this
    inventory.game = game
    inventory.opened = false
    inventory.viewport = new SprigganViewport(screenWidth, screenHeight, "right", "bottom")
    inventory.icon = new SprigganSprite(inventory.viewport, BattleContent, "battle/inventory", ToggleInventory)
    inventory.icon.move(screenWidth, screenHeight)
    function ToggleInventory() {
        inventory.opened = !inventory.opened
        inventory.refresh()
    }
    
    inventory.panelGroup = new SprigganGroup(inventory.viewport)
    inventory.panelGroup.move(screenWidth + 120, screenHeight)
    inventory.panelBackground = new SprigganSprite(inventory.panelGroup, BattleContent, "battle/inventory")
    inventory.panelBackground.loop("panel")
    
    inventory.slots = []
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 3; x++) {
            new InventorySlot(inventory, x, y)
        }
    }
    
    inventory.refresh()     
}

Inventory.prototype.close = function() {
    this.opened = false
    this.refresh()
}

Inventory.prototype.refresh = function() {
    this.icon.loop(this.opened ? "iconOpen" : "iconClosed")
    this.panelGroup.moveAtPixelsPerSecond(screenWidth + (this.opened ? 0 : 120), screenHeight, 1000)
}

Inventory.prototype.tryToAcquire = function(itemName) {
    var inventory = this
    for (var i = 0; i < inventory.game.savegame.inventory.length; i++) {
        if (inventory.game.savegame.inventory[i]) continue
        inventory.game.savegame.inventory[i] = itemName
        inventory.slots[i].refresh()
        inventory.icon.play("iconAdded", function() {
            inventory.refresh()
        })
        return true
    }
    inventory.icon.play("iconFull", function() {
        inventory.refresh()
    })
    return false
}

Inventory.prototype.remove = function(index) {
    this.game.savegame.inventory[index] = null
    this.slots[index].refresh()
}

Inventory.prototype.dispose = function() {
    this.viewport.dispose()
}

function InventorySlot(inventory, x, y) {
    var inventorySlot = this
    inventorySlot.inventory = inventory
    inventorySlot.x = x
    inventorySlot.y = y
    inventorySlot.reserved = false
    inventorySlot.id = inventory.slots.length
    inventory.slots.push(inventorySlot)
    
    inventorySlot.group = new SprigganGroup(inventory.panelGroup, function() {
        inventory.game.mode.clicked(inventorySlot)
    })
    
    inventorySlot.group.move(x * 39 - 98, y * 39 - 178)
    
    inventorySlot.itemSprite = new SprigganSprite(inventorySlot.group, BattleContent, "battle/inventory")
    inventorySlot.statusSprite = new SprigganSprite(inventorySlot.group, BattleContent, "battle/inventory")

    inventorySlot.refresh()
}

InventorySlot.prototype.refresh = function() {    
    this.itemName = this.inventory.game.savegame.inventory[this.id]
    if (this.itemName) {
        this.item = Items[this.itemName]
        this.itemSprite.loop(this.itemName)
        this.itemSprite.show()
        this.statusSprite.loop("slot" + (this.reservedFor ? Capitalize(this.reservedFor) : "Occupied"))
        
    } else {
        this.item = null
        this.itemSprite.hide()
        this.statusSprite.loop("slotEmpty")
    }
}

InventorySlot.prototype.replace = function(withItemName) {
    this.inventory.game.savegame.inventory[this.id] = withItemName
    this.reserveFor(null)
}

InventorySlot.prototype.reserveFor = function(actionName) {
    this.reservedFor = actionName
    this.refresh()
}