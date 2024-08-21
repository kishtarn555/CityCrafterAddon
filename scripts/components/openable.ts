import { BlockComponentPlayerInteractEvent, BlockCustomComponent } from "@minecraft/server";

const OPEN_STATE = "cc:open_bit"

export class Openable implements  BlockCustomComponent {
    onPlayerInteract (arg: BlockComponentPlayerInteractEvent) {
        const block = arg.block;
        const bit = block.permutation.getState(OPEN_STATE)as boolean;
        const sound = bit? "close.wooden_door":"open.wooden_door"
        block.dimension.playSound(sound, block.location);
        block.setPermutation( block.permutation.withState(OPEN_STATE, !bit))
    }
}