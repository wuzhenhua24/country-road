import * as THREE from 'three';
import { COLORS } from '../config';

/**
 * Creates a river flowing through the village along a gentle S-curve,
 * including a river bed and semi-transparent water surface.
 */
export function createRiver(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'River';

  // Define S-curve path from south to north edge of the map
  const curvePoints = [
    new THREE.Vector3(8, -0.25, -48),
    new THREE.Vector3(6, -0.25, -30),
    new THREE.Vector3(3, -0.25, -15),
    new THREE.Vector3(-2, -0.25, 0),
    new THREE.Vector3(-5, -0.25, 12),
    new THREE.Vector3(-3, -0.25, 25),
    new THREE.Vector3(2, -0.25, 35),
    new THREE.Vector3(5, -0.25, 48),
  ];

  const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5);

  // --- River bed (slightly wider, darker) ---
  const bedWidth = 5.5;
  const bedShape = new THREE.Shape();
  bedShape.moveTo(-bedWidth / 2, -0.3);
  bedShape.lineTo(-bedWidth / 2, 0);
  bedShape.lineTo(bedWidth / 2, 0);
  bedShape.lineTo(bedWidth / 2, -0.3);
  bedShape.lineTo(-bedWidth / 2, -0.3);

  const bedExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 60,
    bevelEnabled: false,
    extrudePath: curve,
  };

  const bedGeometry = new THREE.ExtrudeGeometry(bedShape, bedExtrudeSettings);
  const bedMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.DIRT_DARK,
    flatShading: true,
    roughness: 1.0,
  });
  const bedMesh = new THREE.Mesh(bedGeometry, bedMaterial);
  bedMesh.receiveShadow = true;
  bedMesh.name = 'RiverBed';
  group.add(bedMesh);

  // --- Water surface (semi-transparent, follows same curve but narrower) ---
  const waterWidth = 4.5;
  const waterShape = new THREE.Shape();
  waterShape.moveTo(-waterWidth / 2, 0.0);
  waterShape.lineTo(waterWidth / 2, 0.0);
  waterShape.lineTo(waterWidth / 2, 0.05);
  waterShape.lineTo(-waterWidth / 2, 0.05);
  waterShape.lineTo(-waterWidth / 2, 0.0);

  const waterExtrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 60,
    bevelEnabled: false,
    extrudePath: curve,
  };

  const waterGeometry = new THREE.ExtrudeGeometry(waterShape, waterExtrudeSettings);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: COLORS.WATER_BLUE,
    transparent: true,
    opacity: 0.7,
    flatShading: true,
    roughness: 0.3,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.name = 'WaterSurface';
  group.add(waterMesh);

  // --- River banks (raised dirt edges along the curve) ---
  const bankOffsets = [-bedWidth / 2 - 0.5, bedWidth / 2 + 0.5];
  const bankWidth = 1.2;
  const bankHeight = 0.2;

  for (const offset of bankOffsets) {
    const bankPoints: THREE.Vector3[] = [];
    const numSamples = 80;

    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const point = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();

      // Perpendicular direction on the XZ plane
      const perp = new THREE.Vector3(-tangent.z, 0, tangent.x);
      bankPoints.push(
        new THREE.Vector3(
          point.x + perp.x * offset,
          0.05,
          point.z + perp.z * offset
        )
      );
    }

    const bankCurve = new THREE.CatmullRomCurve3(bankPoints, false);

    const bankShape = new THREE.Shape();
    bankShape.moveTo(-bankWidth / 2, 0);
    bankShape.lineTo(-bankWidth / 2, bankHeight);
    bankShape.lineTo(0, bankHeight + 0.08);
    bankShape.lineTo(bankWidth / 2, bankHeight);
    bankShape.lineTo(bankWidth / 2, 0);
    bankShape.lineTo(-bankWidth / 2, 0);

    const bankGeometry = new THREE.ExtrudeGeometry(bankShape, {
      steps: 60,
      bevelEnabled: false,
      extrudePath: bankCurve,
    });

    const bankMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.GROUND_BROWN,
      flatShading: true,
      roughness: 0.95,
    });

    const bankMesh = new THREE.Mesh(bankGeometry, bankMaterial);
    bankMesh.receiveShadow = true;
    bankMesh.castShadow = false;
    bankMesh.name = offset < 0 ? 'RiverBankLeft' : 'RiverBankRight';
    group.add(bankMesh);
  }

  return group;
}
