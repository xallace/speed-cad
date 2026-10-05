/**
 * SpeedCAD Procedural Geometric Part Generator
 * Builds both solid player meshes and holographic blueprint ghost targets.
 */

const CADPartBuilder = {
  /**
   * 1. Piston / Stepped Pin
   */
  buildPiston(params) {
    const dia = parseFloat(params.diameter || 40);
    const length = parseFloat(params.length || 70);
    const collarDia = parseFloat(params.collarDia || 60);
    const collarLen = parseFloat(params.collarLen || 20);

    const rMain = dia / 2;
    const rCollar = collarDia / 2;

    const mainGeom = new THREE.CylinderGeometry(rMain, rMain, length, 32);
    mainGeom.rotateZ(Math.PI / 2);

    const collarGeom = new THREE.CylinderGeometry(rCollar, rCollar, collarLen, 32);
    collarGeom.rotateZ(Math.PI / 2);
    collarGeom.translate(length / 2 - collarLen / 2, 0, 0);

    const merged = this._mergeBufferGeometries([mainGeom, collarGeom]);
    merged.computeVertexNormals();
    return merged;
  },

  /**
   * 2. Spur Gear
   */
  buildGear(params) {
    const m = parseFloat(params.module || 3.0);
    const z = parseInt(params.teeth || 18);
    const width = parseFloat(params.width || 18);
    const bore = parseFloat(params.bore || 16);

    const d = m * z;
    const r = d / 2;
    const ra = r + m;
    const rf = Math.max(0.1, r - 1.25 * m);

    const shape = new THREE.Shape();
    const toothAngle = (2 * Math.PI) / z;
    const halfTooth = toothAngle / 2;
    const pts = [];

    for (let i = 0; i < z; i++) {
      const a = i * toothAngle;
      pts.push(new THREE.Vector2(rf * Math.cos(a - halfTooth * 0.8), rf * Math.sin(a - halfTooth * 0.8)));
      pts.push(new THREE.Vector2(r * Math.cos(a - halfTooth * 0.4), r * Math.sin(a - halfTooth * 0.4)));
      pts.push(new THREE.Vector2(ra * Math.cos(a - halfTooth * 0.15), ra * Math.sin(a - halfTooth * 0.15)));
      pts.push(new THREE.Vector2(ra * Math.cos(a + halfTooth * 0.15), ra * Math.sin(a + halfTooth * 0.15)));
      pts.push(new THREE.Vector2(r * Math.cos(a + halfTooth * 0.4), r * Math.sin(a + halfTooth * 0.4)));
      pts.push(new THREE.Vector2(rf * Math.cos(a + halfTooth * 0.8), rf * Math.sin(a + halfTooth * 0.8)));
    }

    shape.setFromPoints(pts);
    shape.closePath();

    const hole = new THREE.Path();
    hole.absarc(0, 0, bore / 2, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: width,
      bevelEnabled: true,
      bevelSize: 0.5,
      bevelThickness: 0.5,
      bevelSegments: 2,
      curveSegments: 24
    });
    geom.translate(0, 0, -width / 2);
    geom.computeVertexNormals();
    return geom;
  },

  /**
   * 3. Pipe Flange
   */
  buildFlange(params) {
    const dia = parseFloat(params.flangeDia || 130);
    const thick = parseFloat(params.thickness || 15);
    const numBolts = parseInt(params.numBolts || 6);
    const boltCircle = parseFloat(params.boltCircle || 95);
    const bore = parseFloat(params.bore || 45);

    const shape = new THREE.Shape();
    shape.absarc(0, 0, dia / 2, 0, Math.PI * 2, false);

    // Center bore
    const centerHole = new THREE.Path();
    centerHole.absarc(0, 0, bore / 2, 0, Math.PI * 2, true);
    shape.holes.push(centerHole);

    // Bolt holes
    const rBC = boltCircle / 2;
    for (let i = 0; i < numBolts; i++) {
      const a = (i * 2 * Math.PI) / numBolts;
      const bHole = new THREE.Path();
      bHole.absarc(rBC * Math.cos(a), rBC * Math.sin(a), 7, 0, Math.PI * 2, true);
      shape.holes.push(bHole);
    }

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: true,
      bevelSize: 0.6,
      bevelThickness: 0.6,
      bevelSegments: 2,
      curveSegments: 24
    });
    geom.translate(0, 0, -thick / 2);
    geom.computeVertexNormals();
    return geom;
  },

  /**
   * 4. Aerospace Bracket
   */
  buildBracket(params) {
    const w = parseFloat(params.width || 80);
    const h = parseFloat(params.height || 60);
    const thick = parseFloat(params.thickness || 12);
    const cutoutR = parseFloat(params.cutoutR || 18);

    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, -h / 2);
    shape.lineTo(w / 2, -h / 2);
    shape.lineTo(w / 2, h / 2);
    shape.lineTo(-w / 2, h / 2);
    shape.closePath();

    // Central weight-reduction cutout
    const cutHole = new THREE.Path();
    cutHole.absarc(0, 0, cutoutR, 0, Math.PI * 2, true);
    shape.holes.push(cutHole);

    // 2 mounting holes
    const mHole1 = new THREE.Path();
    mHole1.absarc(-w / 2 + 12, 0, 5, 0, Math.PI * 2, true);
    shape.holes.push(mHole1);

    const mHole2 = new THREE.Path();
    mHole2.absarc(w / 2 - 12, 0, 5, 0, Math.PI * 2, true);
    shape.holes.push(mHole2);

    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: true,
      bevelSize: 0.5,
      bevelThickness: 0.5,
      bevelSegments: 2,
      curveSegments: 24
    });
    geom.translate(0, 0, -thick / 2);
    geom.computeVertexNormals();
    return geom;
  },

  /**
   * 5. Avionics Enclosure
   */
  buildEnclosure(params) {
    const l = parseFloat(params.length || 100);
    const w = parseFloat(params.width || 70);
    const h = parseFloat(params.height || 35);
    const wall = parseFloat(params.wall || 3);

    const shape = new THREE.Shape();
    shape.moveTo(-l / 2, -w / 2);
    shape.lineTo(l / 2, -w / 2);
    shape.lineTo(l / 2, w / 2);
    shape.lineTo(-l / 2, w / 2);
    shape.closePath();

    const cavity = new THREE.Path();
    cavity.moveTo(-l / 2 + wall, -w / 2 + wall);
    cavity.lineTo(l / 2 - wall, -w / 2 + wall);
    cavity.lineTo(l / 2 - wall, w / 2 - wall);
    cavity.lineTo(-l / 2 + wall, w / 2 - wall);
    cavity.closePath();
    shape.holes.push(cavity);

    const bodyGeom = new THREE.ExtrudeGeometry(shape, {
      depth: h - wall,
      bevelEnabled: false,
      curveSegments: 16
    });
    bodyGeom.translate(0, 0, wall);

    const bottomShape = new THREE.Shape();
    bottomShape.moveTo(-l / 2, -w / 2);
    bottomShape.lineTo(l / 2, -w / 2);
    bottomShape.lineTo(l / 2, w / 2);
    bottomShape.lineTo(-l / 2, w / 2);
    bottomShape.closePath();

    const bottomGeom = new THREE.ExtrudeGeometry(bottomShape, {
      depth: wall,
      bevelEnabled: false,
      curveSegments: 16
    });

    const merged = this._mergeBufferGeometries([bodyGeom, bottomGeom]);
    merged.translate(0, 0, -h / 2);
    merged.computeVertexNormals();
    return merged;
  },

  _mergeBufferGeometries(geometries) {
    let totalPositions = 0;
    let totalNormals = 0;
    let totalIndices = 0;

    geometries.forEach(g => {
      totalPositions += g.attributes.position.array.length;
      if (g.attributes.normal) totalNormals += g.attributes.normal.array.length;
      if (g.index) totalIndices += g.index.array.length;
      else totalIndices += g.attributes.position.count;
    });

    const mergedPos = new Float32Array(totalPositions);
    const mergedNorm = new Float32Array(totalPositions);
    const mergedIndices = [];

    let posOffset = 0;
    let vertexCountAccum = 0;

    geometries.forEach(g => {
      const pos = g.attributes.position.array;
      mergedPos.set(pos, posOffset);

      if (g.attributes.normal) {
        mergedNorm.set(g.attributes.normal.array, posOffset);
      }

      if (g.index) {
        const idx = g.index.array;
        for (let i = 0; i < idx.length; i++) {
          mergedIndices.push(idx[i] + vertexCountAccum);
        }
      } else {
        const count = g.attributes.position.count;
        for (let i = 0; i < count; i++) {
          mergedIndices.push(i + vertexCountAccum);
        }
      }

      vertexCountAccum += g.attributes.position.count;
      posOffset += pos.length;
    });

    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(mergedPos, 3));
    result.setAttribute('normal', new THREE.BufferAttribute(mergedNorm, 3));
    result.setIndex(mergedIndices);
    return result;
  }
};
