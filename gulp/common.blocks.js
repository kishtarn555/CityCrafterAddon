function AddComponents(block, json) {
    if (json.components == null) 
        return;
    const components = block["minecraft:block"].components;
    for (let key in json.components) {
        if (Object.hasOwn(components, key)) {
            Object.assign(components[key], json.components[key]);
        } else {
            components[key] = json.components[key];
        }

    }
}

exports.addComponents = AddComponents;