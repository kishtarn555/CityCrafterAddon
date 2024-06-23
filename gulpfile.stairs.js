const orientations = ["north", "east", "south", "west"]



function getStairsJSON(data) {


    const object = {
        "format_version": "1.20.30",
        "minecraft:block": {
            "description": {
                "identifier": data.identifier,
                "menu_category": {
                    "category": "construction",
                    "group": "itemGroup.name.stairs",
                    "is_hidden_in_commands": false
                },
                "traits": {
                    "minecraft:placement_direction": {
                        "enabled_states": ["minecraft:cardinal_direction"],
                        "y_rotation_offset": 180
                    },
                    "minecraft:placement_position": {
                        "enabled_states": ["minecraft:vertical_half"]
                    }
                }
            },
            "components": {
                "minecraft:collision_box": {
                    "origin": [-8, 0, -7.9],
                    "size": [16, 8, 15.9]

                },
                "minecraft:geometry": "geometry.cc_stair",
                "minecraft:material_instances": {
                    "*": {
                        "texture":  data.texture
                    }
                }
            },
            "permutations": [

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'north' && q.block_state('minecraft:vertical_half') == 'bottom'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 0, 0] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'west'&& q.block_state('minecraft:vertical_half') == 'bottom'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 90, 0] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'south'&& q.block_state('minecraft:vertical_half') == 'bottom'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 180, 0] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'east'&& q.block_state('minecraft:vertical_half') == 'bottom'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, -90, 0] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'north' && q.block_state('minecraft:vertical_half') == 'top'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 0, 180] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'west'&& q.block_state('minecraft:vertical_half') == 'top'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, -90, 180] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'south'&& q.block_state('minecraft:vertical_half') == 'top'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 180, 180] }
                    }
                },

                {
                    "condition": "q.block_state('minecraft:cardinal_direction') == 'east'&& q.block_state('minecraft:vertical_half') == 'top'",
                    "components": {
                        "minecraft:transformation": { "rotation": [0, 90, 180] }
                    }
                }
            ]
        }
    };
    return object
}

exports.getStairsJSON = getStairsJSON;