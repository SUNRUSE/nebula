function PlayPause(game) {
    var playPause = this
    playPause.viewport = new SprigganViewport(screenWidth, screenHeight, "left", "bottom")
    playPause.sprite = new SprigganSprite(playPause.viewport, BattleContent, "battle/battle", TogglePause)
    playPause.sprite.move(0, screenHeight)
    playPause.sprite.loop("pause")
    playPause.paused = false
    function TogglePause() {
        playPause.paused = !playPause.paused
        if (playPause.paused) {
            playPause.sprite.loop("play")
            game.group.pause()
        } else {
            playPause.sprite.loop("pause")
            game.group.resume()
        }
    }
}

PlayPause.prototype.dispose = function() {
    this.viewport.dispose()
}