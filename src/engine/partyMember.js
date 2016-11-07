function PartyMember(room) {
    var partyMember = this
    partyMember.game = room.game
    partyMember.game.contentManager.add(SprigganSpriteSheet, "battle")
    
    partyMember.character = new Character(room, Clicked)
    
    function Clicked() {
        partyMember.game.partyMemberClicked(partyMember)
    }
    
    partyMember.character.contentLoaded.listen(function() {
        partyMember.selectedSprite = new SprigganSprite(partyMember.character.group, partyMember.game.contentManager, "battle", Clicked)
        partyMember.selectedSprite.loop("selected")
        partyMember.selectedSprite.hide()
    })
    
    partyMember.game.selectedPartyMemberChanged.listen(function(selected){        
        if (partyMember == selected)
            partyMember.selectedSprite.show()
        else
            partyMember.selectedSprite.hide()
    })
    
    partyMember.game.orderGiven.listen(function(){
        partyMember.character.think()
    })
}