const orientations= ["north", "east", "south", "west"]

function getDoorPermutation(data,facing, north, east, west, south) {

    let mx = east ? -8 : -2, mz = north ? -8 : -2;
    let Mx = west ? 8 : 2, Mz = south ? 8 : 2;
    
    const rots = {
        "north": 0,
        "east": -90,
        "west": 90,
        "south": 180
      };
    const rotY = rots[facing];

    const perm = {
        "condition": `q.block_state('minecraft:cardinal_direction') == '${facing}'  && q.block_state('citycrafter:n') == ${north} && q.block_state('citycrafter:s') == ${south} && q.block_state('citycrafter:w') == ${west} && q.block_state('citycrafter:e') == ${east}`,
        "components": {
            "minecraft:collision_box": {
                "origin": [
                    mx,
                    0,
                    mz
                ],
                "size": [
                    Mx-mx,
                    16,
                    Mz-mz
                ]
            },
            "minecraft:selection_box": {
                "origin": [
                    mx,
                    0,
                    mz
                ],
                "size": [
                    Mx-mx,
                    16,
                    Mz-mz
                ]
            },
            "minecraft:transformation": { "rotation": [0, rotY, 0] }
        }
    };

    return perm;
}


function getFenceJSON(data) {

    permutations = [
    ]
    for (let i = 0; i < 16; i++) {
        permutations.push(
            getDoorPermutation(data, "north", (i & 8) != 0, (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
        );
        permutations.push(
            getDoorPermutation(data, "east", (i & 8) != 0, (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
        );
        permutations.push(
            getDoorPermutation(data, "south", (i & 8) != 0, (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
        );
        permutations.push(
            getDoorPermutation(data, "west", (i & 8) != 0, (i & 4) != 0, (i & 2) != 0, (i & 1) != 0)
        );
    }

    const object = {

        "format_version": "1.20.30",
        "minecraft:block": {
            "description": {
                "identifier": data.identifier,
                "menu_category": {
                    "category": "construction",
                    "group": "itemGroup.name.fence",
                    "is_hidden_in_commands": false
                },
                "states": {
                    "citycrafter:n": [false, true],
                    "citycrafter:e": [false, true],
                    "citycrafter:s": [false, true],
                    "citycrafter:w": [false, true],
                    "citycrafter:freeze": [false, true],
                },
                "traits": {
                    "minecraft:placement_direction": {
                        "enabled_states": [
                            "minecraft:cardinal_direction"
                        ]
                    }
                }
            
            },
            "components": {
                "minecraft:geometry": {
                    "identifier": "geometry.fence_nesw",
                    "bone_visibility": {
                        "north_connection": "q.block_state('citycrafter:n')",
                        "east_connection": "q.block_state('citycrafter:e')",
                        "west_connection": "q.block_state('citycrafter:w')",
                        "south_connection": "q.block_state('citycrafter:s')"
                    }
                },
                "minecraft:material_instances": {
                    "*": {
                        "texture": data.texture
                    }
                },
            },
            "permutations": permutations
        }
    };
    return object
}

exports.getFenceJSON = getFenceJSON;