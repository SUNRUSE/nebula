var BattleContent
var Battle

function LoadBattle() {    
    if (!BattleContent) {
        BattleContent = ShowLoadingScreen(function() {
            Battle = BattleContent.get(SprigganJavaScript, "battle.js")
            AfterLoading()
        })
        BattleContent.add(SprigganJavaScript, "battle.js")
        BattleContent.add(SprigganSpriteSheet, "character")
        BattleContent.add(SprigganSpriteSheet, "battle")
        BattleContent.add(SprigganSpriteSheet, "effects")
        BattleContent.add(SprigganSpriteSheet, "items/icons")
    } else AfterLoading()
    
    function AfterLoading() {
        var savegame = {
            roomPath: "tutorial/throwing",
            areaPath: "test",
            inventory: []
        }
        while (savegame.inventory.length < 12) savegame.inventory.push(null)
        new Battle.Game(savegame)
    }
}