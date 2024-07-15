import { Block, BlockPermutation, ItemUseOnAfterEvent, ItemUseOnBeforeEvent, PlayerBreakBlockBeforeEvent, PlayerDimensionChangeAfterEvent, PlayerPlaceBlockAfterEvent, system, world } from "@minecraft/server";

const iron_bars: string[] = [
    "citycrafter:iron_bars_wall"
]


function UpdateBars(block: Block) {
    system.run(() => {
        if (!block.isValid())
            return;
        if (iron_bars.indexOf(block.typeId) === -1)
            return;
        if (block.permutation.getState("citycrafter:freeze")) {
            //This block is frozen
            return;
        }
        const ori = block.permutation.getState("minecraft:cardinal_direction") as string
        let states = {
            "citycrafter:e": false,
            "citycrafter:w": false,
            "citycrafter:freeze": false,
            "minecraft:cardinal_direction": ori
        }
        let left: Block | undefined = block.east()
        let right: Block | undefined = block.west()
        switch (ori) {
            case "north":
                left = block.east()
                right = block.west()
                break;
            case "south":
                left = block.west()
                right = block.east()
                break;
            case "west":
                left = block.north()
                right = block.south()
                break;
            case "east":
                left = block.south()
                right = block.north()
                break;
        }

        if (left?.isValid() && (!left?.isAir && !left?.isLiquid)) {
            states["citycrafter:e"] = true;
        }
        if (right?.isValid() && (!right?.isAir && !right?.isLiquid)) {
            states["citycrafter:w"] = true;
        }
        let perm = BlockPermutation.resolve(block.typeId, states)

        block.setPermutation(perm)
    });
}


function OnPlaceBars(e: PlayerPlaceBlockAfterEvent) {
    UpdateBars(e.block);
    UpdateNeighbors(e.block);
}

function UpdateNeighbors(block: Block) {
    const east = block.east()
    const north = block.north()
    const west = block.west()
    const south = block.south()
    if (south) UpdateBars(south);
    if (west) UpdateBars(west);
    if (east) UpdateBars(east);
    if (north) UpdateBars(north);

}

function OnBreakBars(e: PlayerBreakBlockBeforeEvent) {
    UpdateNeighbors(e.block);
}

export function registerBarsListener() {
    world.afterEvents.playerPlaceBlock.subscribe(OnPlaceBars, { blockTypes: iron_bars })
    world.beforeEvents.playerBreakBlock.subscribe(OnBreakBars, { blockTypes: iron_bars })

    world.afterEvents.playerPlaceBlock.subscribe((e) => UpdateNeighbors(e.block))
    world.beforeEvents.playerBreakBlock.subscribe((e) => UpdateNeighbors(e.block))
}






