import * as THREE from 'three';
import { Character, CharacterConfig } from './Character';
import { Animal, AnimalType } from './Animal';
import { navPoints } from '../world/VillageLayout';

const villagerConfigs: CharacterConfig[] = [
  { name: 'Old Wang', role: 'farmer', homeId: 'house1_door', workId: 'field_north' },
  { name: 'Li Mei', role: 'farmer', homeId: 'house2_door', workId: 'field_south' },
  { name: 'Zhang Wei', role: 'craftsman', homeId: 'house3_door', workId: 'barn' },
  { name: 'Chen Hua', role: 'elder', homeId: 'house4_door', workId: 'square' },
  { name: 'Xiao Ming', role: 'child', homeId: 'house1_door', workId: 'square' },
  { name: 'Liu Fang', role: 'farmer', homeId: 'house5_door', workId: 'field_north' },
  { name: 'Xiao Hong', role: 'child', homeId: 'house6_door', workId: 'east_bank' },
];

interface AnimalSpawn {
  type: AnimalType;
  locationId: string;
  offset: THREE.Vector3;
}

const animalSpawns: AnimalSpawn[] = [
  { type: 'cow', locationId: 'barn', offset: new THREE.Vector3(2, 0, 0) },
  { type: 'cow', locationId: 'barn', offset: new THREE.Vector3(-2, 0, 2) },
  { type: 'sheep', locationId: 'field_north', offset: new THREE.Vector3(3, 0, 1) },
  { type: 'sheep', locationId: 'field_north', offset: new THREE.Vector3(1, 0, -2) },
  { type: 'chicken', locationId: 'house3_door', offset: new THREE.Vector3(1, 0, 1) },
  { type: 'chicken', locationId: 'house4_door', offset: new THREE.Vector3(-1, 0, 0.5) },
  { type: 'chicken', locationId: 'square', offset: new THREE.Vector3(2, 0, -1) },
  { type: 'pig', locationId: 'barn', offset: new THREE.Vector3(3, 0, -2) },
];

export class CharacterFactory {
  createVillagers(): Character[] {
    const characters: Character[] = [];
    const pointMap = new Map(navPoints.map(p => [p.id, p]));

    for (const config of villagerConfigs) {
      const c = new Character(config);
      const home = pointMap.get(config.homeId);
      if (home) {
        c.position.copy(home.position);
        c.position.y = 0;
        // Slight random offset so they don't stack
        c.position.x += (Math.random() - 0.5) * 2;
        c.position.z += (Math.random() - 0.5) * 2;
      }
      characters.push(c);
    }

    return characters;
  }

  createAnimals(): Animal[] {
    const animals: Animal[] = [];
    const pointMap = new Map(navPoints.map(p => [p.id, p]));

    for (const spawn of animalSpawns) {
      const a = new Animal(spawn.type, spawn.locationId);
      const loc = pointMap.get(spawn.locationId);
      if (loc) {
        a.position.copy(loc.position);
        a.position.add(spawn.offset);
        a.position.y = 0;
      }
      a.group.rotation.y = Math.random() * Math.PI * 2;
      animals.push(a);
    }

    return animals;
  }
}
