import { world, system, BlockTypes, BlockPermutation, BlockStates, StructureRotation } from "@minecraft/server";
import { registerDoorListener } from "./door";
import { registerFenceListener } from "./fence";
import { registerTrapdoorListener } from "./trapdoor";
import { registerBarsListener } from "./iron_bars_wall";

registerDoorListener();
registerFenceListener();
registerTrapdoorListener();
registerBarsListener();




function debug() {

    const blocks = BlockTypes.getAll()
    let res=0;
    let cc=0;
    let mc=0;
    for (let block of blocks) {
        let sres = 1;
        const states = BlockPermutation.resolve(block.id).getAllStates(); 
        for (let state of Object.keys(states)) {
            let res = BlockStates.get(state)?.validValues.length ?? 1;
            sres*=res;
        }
        if (block.id.startsWith("citycrafter:")) {
            cc+=sres;
        } else if (block.id.startsWith("minecraft:")){
            mc += sres;
        }
        res+=sres;
    }
    world.sendMessage(`MC: ${mc}/${res} = ${mc/res*100.0}%`  );
    world.sendMessage(`CC: ${cc}/${res} = ${cc/res*100.0}%`  );
    const limit = 65536
    world.sendMessage(`OF ALL ${res}/${limit} = ${res/limit*100.0}%`  );
}