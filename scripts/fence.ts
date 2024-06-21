import { Block, BlockPermutation, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerDimensionChangeAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";

const fences :string[]= [
    "citycrafter:iron_block_fence",
    "citycrafter:white_concrete_fence"
]    


const rotations = {
    "north":0,
    "east":1,
    "south":2,
    "west":3
}

const ori_states = [
    "citycrafter:n",
    "citycrafter:e",
    "citycrafter:s",
    "citycrafter:w"
]


function UpdateFence(block:Block) {
    system.run(()=>{
        if (!block.isValid())
            return;
        if (fences.indexOf(block.typeId) === -1) 
            return;
        if (block.permutation.getState("citycrafter:freeze")) {
            //This block is frozen
            return;
        }
        
        let states= {
            "citycrafter:n":false,
            "citycrafter:e":false,
            "citycrafter:s":false,
            "citycrafter:w":false,
            "citycrafter:freeze":false,
        }
        
        if (block.north()?.isValid() && (!block.north()?.isAir && !block.north()?.isLiquid)) {
            states["citycrafter:n"] = true;
        }
        if (block.east()?.isValid() && (!block.east()?.isAir && !block.east()?.isLiquid)) {
            states["citycrafter:e"] = true;
        }
        if (block.south()?.isValid() && (!block.south()?.isAir && !block.south()?.isLiquid)) {
            states["citycrafter:s"] = true;
        }
        if (block.west()?.isValid() && (!block.west()?.isAir && !block.west()?.isLiquid)) {
            states["citycrafter:w"] = true;
        }
        let perm = BlockPermutation.resolve(block.typeId, states).withState("minecraft:cardinal_direction", "north")

        block.setPermutation(perm)
    });
}


function OnPlaceFence(e: PlayerPlaceBlockAfterEvent) {
    UpdateFence(e.block);
    UpdateNeighbors(e.block);
}

function UpdateNeighbors(block:Block) {
    const above = block.above()
    const below = block.below()
    const east = block.east()
    const north = block.north()
    const west = block.west()
    const south = block.south()
    if (above) UpdateFence(above);
    if (below) UpdateFence(below);
    if (south) UpdateFence(south);
    if (west) UpdateFence(west);
    if (east) UpdateFence(east);
    if (north) UpdateFence(north);

}

function OnBreakFence(e: PlayerBreakBlockBeforeEvent) {
    UpdateNeighbors(e.block);
}

export function registerFenceListener() {
    world.afterEvents.playerPlaceBlock.subscribe(OnPlaceFence,{ blockTypes:fences })
    world.beforeEvents.playerBreakBlock.subscribe(OnBreakFence,{ blockTypes:fences })
    
    world.afterEvents.playerPlaceBlock.subscribe((e)=>UpdateNeighbors(e.block))
    world.beforeEvents.playerBreakBlock.subscribe((e)=>UpdateNeighbors(e.block))
}






