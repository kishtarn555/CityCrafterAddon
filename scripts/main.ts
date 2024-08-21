import { world, system, BlockTypes, BlockPermutation, BlockStates, StructureRotation } from "@minecraft/server";
import { registerFenceListener } from "./fence";
import { registerBarsListener } from "./iron_bars_wall";
import { OpenableComponent } from "./components/openable";
import { DoorComponent } from "./door";


world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.blockComponentRegistry.registerCustomComponent('cc:openable', new OpenableComponent());
    initEvent.blockComponentRegistry.registerCustomComponent('cc:door', new DoorComponent());
});

registerFenceListener();
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