import * as THREE from 'three';

import { createTerrain } from './Terrain';
import { createRiver } from './River';
import { createBridge } from './Bridge';
import { createRoads } from './Road';
import { createHouse } from './buildings/House';
import { createBarn } from './buildings/Barn';
import { createWell } from './buildings/Well';
import { createTree } from './nature/Tree';
import { createRock } from './nature/Rock';
import { createFence } from './nature/Fence';
import { createCropField } from './nature/Crop';
import { buildings, nature, bridgePosition } from './VillageLayout';

/**
 * Assembles the entire village scene from terrain, water features,
 * buildings, and nature elements defined in VillageLayout.
 */
export class WorldBuilder {
  private worldGroup = new THREE.Group();

  build(): THREE.Group {
    this.worldGroup.name = 'World';

    // Ground plane
    this.worldGroup.add(createTerrain());

    // Water
    this.worldGroup.add(createRiver());

    // Bridge across the river
    this.worldGroup.add(createBridge(bridgePosition));

    // Dirt roads connecting key locations
    this.worldGroup.add(createRoads());

    // Place buildings
    for (const b of buildings) {
      let obj: THREE.Group;
      switch (b.type) {
        case 'house':
          obj = createHouse(b.options);
          break;
        case 'barn':
          obj = createBarn();
          break;
        case 'well':
          obj = createWell();
          break;
      }
      obj.position.copy(b.position);
      obj.rotation.y = b.rotation;
      this.worldGroup.add(obj);
    }

    // Place nature elements
    for (const n of nature) {
      let obj: THREE.Group;
      switch (n.type) {
        case 'tree':
          obj = createTree(n.options?.type);
          break;
        case 'rock':
          obj = createRock(n.options?.size);
          break;
        case 'fence':
          obj = createFence(n.options?.length ?? 5, n.options?.direction);
          break;
        case 'cropField':
          obj = createCropField(n.options?.rows ?? 5, n.options?.cols ?? 5);
          break;
      }
      obj.position.copy(n.position);
      if (n.rotation) obj.rotation.y = n.rotation;
      this.worldGroup.add(obj);
    }

    return this.worldGroup;
  }
}
