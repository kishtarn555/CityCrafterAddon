import { Block, BlockPermutation, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerDimensionChangeAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";

const doors :string[]= [
    "citycrafter:iron_gate2",
    "citycrafter:arch_door",
    "citycrafter:woody_door",
    "citycrafter:black_door",
]    

function OnPlaceDoor(e:PlayerPlaceBlockAfterEvent) {
    
    let hinge = false;
    const dir = e.block.permutation.getState("minecraft:cardinal_direction");
    if (dir === "north") {
        
        if (e.block.west()?.hasTag("cc_door") || e.block.west()?.hasTag("doors"))  {
            hinge = false;
        } else if (e.block.east()?.hasTag("cc_door") || e.block.east()?.hasTag("doors")) {
            hinge=true;
        }
        else if ((!e.block.east()?.isAir && !e.block.east()?.isLiquid) || (!e.block.above()?.east()?.isAir && !e.block.above()?.east()?.isLiquid)) {
            hinge = false;
        } else if ((!e.block.west()?.isAir && !e.block.west()?.isLiquid) || (!e.block.above()?.west()?.isAir && !e.block.above()?.west()?.isLiquid)){
            hinge = true;
        }
    }
    if (dir === "south") {
        
        if (e.block.east()?.hasTag("cc_door") || e.block.east()?.hasTag("doors"))  {
            hinge = false;
        } else if (e.block.west()?.hasTag("cc_door") || e.block.west()?.hasTag("doors")) {
            hinge=true;
        } else if ((!e.block.west()?.isAir && !e.block.west()?.isLiquid) || (!e.block.above()?.west()?.isAir && !e.block.above()?.west()?.isLiquid)) {
            hinge = false;
        } else if ((!e.block.east()?.isAir && !e.block.east()?.isLiquid) || (!e.block.above()?.east()?.isAir && !e.block.above()?.east()?.isLiquid)){
            hinge = true;
        }
    }

    
    if (dir === "east") {
        if (e.block.north()?.hasTag("cc_door") || e.block.north()?.hasTag("doors")) {
            hinge=false;
        }
        else if (e.block.south()?.hasTag("cc_door") || e.block.south()?.hasTag("doors"))  {
            hinge = true;
        } else if ((!e.block.south()?.isAir && !e.block.south()?.isLiquid) || (!e.block.above()?.south()?.isAir && !e.block.above()?.south()?.isLiquid)){
            hinge = false;
        } else if ((!e.block.north()?.isAir && !e.block.north()?.isLiquid) || (!e.block.above()?.north()?.isAir && !e.block.above()?.north()?.isLiquid)) {
            hinge = true;
        } 
    }
    if (dir === "west") {
        if (e.block.south()?.hasTag("cc_door") || e.block.south()?.hasTag("doors")) {
            hinge=false;
        }
        else if (e.block.north()?.hasTag("cc_door") || e.block.north()?.hasTag("doors"))  {
            hinge = true;
        } else if ((!e.block.north()?.isAir && !e.block.north()?.isLiquid) || (!e.block.above()?.north()?.isAir && !e.block.above()?.north()?.isLiquid)){
            hinge = false;
        } else if ((!e.block.south()?.isAir && !e.block.south()?.isLiquid) || (!e.block.above()?.south()?.isAir && !e.block.above()?.south()?.isLiquid)) {
            hinge = true;
        } 
    }



    if (
        e.block.above()?.isValid() && 
        (e.block.above()?.isAir || e.block.above()?.isLiquid)
    ) {
        e.block.above()?.setPermutation(
            e.block.permutation
            .withState("cc:upper_block_bit", true) 
            .withState("cc:door_hinge_bit", hinge) 
        );
        e.block.setPermutation(
            e.block.permutation
            .withState("cc:door_hinge_bit", hinge) 
        );
    }

}
function OnBreakDoor(e:PlayerBreakBlockBeforeEvent) {
    const bit = e.block.permutation.getState("cc:upper_block_bit") as boolean


    if(bit) {
        if (e.block.below()?.isValid() &&  e.block.below()?.matches(e.block.typeId) ) {
            system.run(()=> e.block.below()!.setType("minecraft:air"));
        }
    } else {
        if (e.block.above()?.isValid() &&  e.block.above()?.matches(e.block.typeId) ) {
            system.run(()=> e.block.above()!.setType("minecraft:air"));
        }
    }

}

function ChangeState(block:Block, state:string) {
    const bit = block.permutation.getState("cc:upper_block_bit") as boolean
    const nextState = !block.permutation.getState(state)

    if(bit) {
        if (block.below()?.isValid() &&  block.below()?.matches(block.typeId) ) {
            system.run(()=> block.below()!.setPermutation(block.below()!.permutation.withState(state, nextState)));
            system.run(()=> block.setPermutation(block.permutation.withState(state, nextState)));
        }
    } else {
        if (block.above()?.isValid() &&  block.above()?.matches(block.typeId) ) {
            system.run(()=> block.above()!.setPermutation(block.above()!.permutation.withState(state, nextState)));
            system.run(()=> block.setPermutation(block.permutation.withState(state, nextState)));
        }
    }
}

function ChangeOpenBit(block:Block) {
    const sound = block.permutation.getState("cc:open_bit")? "close.wooden_door":"open.wooden_door"
    block.dimension.playSound(sound, block.location);
    ChangeState(block, "cc:open_bit");
}
function ChangeHingeBit(block:Block) {
    ChangeState(block, "cc:door_hinge_bit");
}

let lock = false;

function OnUseDoor(e: ItemUseOnBeforeEvent) {
    if ( doors.indexOf(e.block.typeId) === -1) {
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


export function registerDoorListener() {
    world.afterEvents.playerPlaceBlock.subscribe(OnPlaceDoor,{ blockTypes:doors })
    world.beforeEvents.playerBreakBlock.subscribe(OnBreakDoor,{ blockTypes:doors })
    world.beforeEvents.itemUseOn.subscribe(OnUseDoor)
}






