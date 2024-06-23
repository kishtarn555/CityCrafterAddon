import { Block, BlockPermutation, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerDimensionChangeAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";




function ChangeOpenBit(block:Block) {
    const bit = block.permutation.getState("cc:open_bit")as boolean;
    const sound = bit? "close.wooden_door":"open.wooden_door"
    block.dimension.playSound(sound, block.location);
    block.setPermutation( block.permutation.withState("cc:open_bit", !bit))
}

let lock = false;

function OnUseTrapdoor(e: ItemUseOnBeforeEvent) {
    if (!e.block.hasTag("cc_trapdoor")) {
        return;
    }
    if (e.source.isSneaking) {    
        return;
    }
    e.cancel=true;     
    if (lock) { 
        return;
    }
    lock = true;
    system.run(()=>{             
        ChangeOpenBit(e.block);            
        system.runTimeout(()=>lock = false, 5);
    });
    


    

}


export function registerTrapdoorListener() {
    world.beforeEvents.itemUseOn.subscribe(OnUseTrapdoor)
}






