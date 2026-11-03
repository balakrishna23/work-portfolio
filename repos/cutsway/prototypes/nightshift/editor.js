// Night Shift: the editor at the desk. A rigged character (Mixamo "Michelle", from the three.js examples; slimmed to assets/models/editor.glb)
// posed live every frame: two-bone IK puts the hands on the keyboard and mouse, the feet under the desk,
// and the spine, head and fingers follow the night (typing, slumping, stretching, leaning back).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = V(0, 1, 0), DOWN = V(0, -1, 0), FWD = V(0, 0, -1), BACK = V(0, 0, 1);

// scratch, so posing allocates nothing per frame
const _x = V(), _y = V(), _z = V(), _m1 = new THREE.Matrix4(), _m2 = new THREE.Matrix4();
const _q = new THREE.Quaternion(), _qp = new THREE.Quaternion(), _e = new THREE.Euler();
const _a = V(), _b = V(), _c = V(), _d = V(), _p = V();

function basis(m, a, b) {
  _x.copy(a).normalize(); _z.crossVectors(_x, b).normalize(); _y.crossVectors(_z, _x);
  return m.makeBasis(_x, _y, _z);
}
// the rotation that carries frame (a, b) onto frame (c, d): a lands on c exactly, b as near d as it can
function frameQuat(a, b, c, d, out) {
  basis(_m1, a, b); basis(_m2, c, d);
  return out.setFromRotationMatrix(_m2.multiply(_m1.transpose()));
}
// where the middle joint goes: lengths l1, l2 from root to target, bending toward pole
function solveJoint(root, target, l1, l2, pole, out) {
  const dir = _c.subVectors(target, root), d = Math.min(dir.length(), (l1 + l2) * 0.999); dir.normalize();
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const side = _d.copy(pole).addScaledVector(dir, -pole.dot(dir)).normalize();
  return out.copy(root).addScaledVector(dir, a).addScaledVector(side, h);
}

export async function loadEditor(scene, { url, height = 1.68, seat = V(0, 0.6, 0.47) }) {
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(url);
  const root = gltf.scene;
  const tpose = gltf.animations.find(a => /tpose/i.test(a.name));
  if (tpose) { const mixer = new THREE.AnimationMixer(root); mixer.clipAction(tpose).play(); mixer.update(0); }

  const B = {};
  root.traverse(o => {
    if (o.isBone) B[o.name.replace(/^mixamorig:?/, '')] = o;
    if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; }
  });

  // stand it up at a real height, turn it to face the desk (-z), sit the hips on the chair
  root.updateMatrixWorld(true);
  const wp = (bone, out = V()) => bone.getWorldPosition(out);
  const h0 = wp(B.HeadTop_End).y - Math.min(wp(B.LeftToe_End).y, wp(B.RightToe_End).y);
  root.scale.multiplyScalar(height / h0);
  root.rotation.y = Math.PI;
  scene.add(root); root.updateMatrixWorld(true);
  root.position.add(seat.clone().sub(wp(B.Hips))); root.updateMatrixWorld(true);

  // rest pose, in world terms
  const bones = Object.values(B), rest = new Map();
  bones.forEach(b => rest.set(b, { local: b.quaternion.clone(), world: b.getWorldQuaternion(new THREE.Quaternion()) }));
  const dirTo = (a, b) => wp(b).sub(wp(a)).normalize();
  const R = { 1: 'Right', '-1': 'Left' };
  const side = Math.sign(wp(B.RightArm).x - wp(B.LeftArm).x) || 1;   // world x of the character's right side
  const len = (a, b) => wp(a).distanceTo(wp(b));
  const limb = s => {
    const n = R[s];
    return {
      s: s * side, arm: B[n + 'Arm'], fore: B[n + 'ForeArm'], hand: B[n + 'Hand'],
      armDir: dirTo(B[n + 'Arm'], B[n + 'ForeArm']), foreDir: dirTo(B[n + 'ForeArm'], B[n + 'Hand']), handDir: dirTo(B[n + 'Hand'], B[n + 'HandMiddle1']),
      l1: len(B[n + 'Arm'], B[n + 'ForeArm']), l2: len(B[n + 'ForeArm'], B[n + 'Hand']),
      fingers: ['Index', 'Middle', 'Ring', 'Pinky'].map(f => [1, 2, 3].map(k => ({ bone: B[`${n}Hand${f}${k}`], dir: dirTo(B[`${n}Hand${f}${k}`], B[`${n}Hand${f}${k + 1}`]) }))),
      up: B[n + 'UpLeg'], leg: B[n + 'Leg'], foot: B[n + 'Foot'],
      upDir: dirTo(B[n + 'UpLeg'], B[n + 'Leg']), legDir: dirTo(B[n + 'Leg'], B[n + 'Foot']), footDir: dirTo(B[n + 'Foot'], B[n + 'ToeBase']),
      t1: len(B[n + 'UpLeg'], B[n + 'Leg']), t2: len(B[n + 'Leg'], B[n + 'Foot']),
      // the middle finger's rest geometry, to work out where its tip lands
      knuckle: wp(B[n + 'HandMiddle1']).sub(wp(B[n + 'Hand'])),
      segs: [1, 2, 3].map(k => wp(B[`${n}HandMiddle${k + 1}`]).sub(wp(B[`${n}HandMiddle${k}`]))),
    };
  };
  const L = [limb(-1), limb(1)];   // L[0] the left side, L[1] the right
  const spine = ['Hips', 'Spine', 'Spine1', 'Spine2', 'Neck', 'Head'].map((n, k, a) => ({ bone: B[n], dir: dirTo(B[n], B[a[k + 1]] || B.HeadTop_End) }));

  // set a bone by its world rotation relative to rest
  function setWorld(bone, q) {
    const w = _q.copy(q).multiply(rest.get(bone).world);
    bone.parent.getWorldQuaternion(_qp);
    bone.quaternion.copy(_qp.invert().multiply(w));
    bone.updateMatrixWorld(true);
  }
  const qFrom = (restA, restB, a, b) => frameQuat(restA, restB, a, b, new THREE.Quaternion());
  const AX = V(1, 0, 0), rotX = a => new THREE.Quaternion().setFromAxisAngle(AX, a);

  // headphones ride on the head
  const phones = new THREE.Group(); scene.add(phones);
  const headRestW = rest.get(B.Head).world.clone();
  const headC = wp(B.Head).lerp(wp(B.HeadTop_End), 0.55), headR = len(B.Head, B.HeadTop_End) * 0.62;
  const headOff = headC.clone().sub(wp(B.Head));
  phones.userData = { headR };

  const pts = {
    wrist: [V(), V()], pole: [V(), V()], hDir: [V(), V()], palm: [V(), V()], curl: [0, 0], ankle: [V(), V()],
  };
  const elbow = V(), knee = V(), sh = V(), hip = V(), lat = V(), tip = V(), seg = V(), tmpQ = new THREE.Quaternion(), qHand = new THREE.Quaternion();
  const CURL = [0.6, 0.9, 0.5];   // how a curl splits across knuckle, middle and end joints (cumulative)

  // where the middle fingertip lands relative to the wrist, for a hand rotation qH and a curl
  function tipOffset(l, qH, latAxis, curl, out) {
    out.copy(l.knuckle).applyQuaternion(qH);
    let c = 0;
    l.segs.forEach((s, j) => { c += curl * CURL[j]; tmpQ.setFromAxisAngle(latAxis, c).multiply(qH); out.add(seg.copy(s).applyQuaternion(tmpQ)); });
    return out;
  }

  // how each hand holds its tool: the middle fingertip's target, the back of the hand's direction, the palm, the curl
  // typing: wrist low, knuckles up, fingers arched down onto the home row; mouse: palm on the shell, fingers draped to its front
  const KEY_TOP = 0.81;
  function toolGrip(k, s, t, mouse, out) {
    if (s < 0) {
      out.tip.set(-0.17 + Math.sin(t * 0.9) * 0.014, KEY_TOP, -0.128 + Math.sin(t * 1.3) * 0.008);
      out.dir.set(0.14, 0.07, -1).normalize(); out.palm.set(0.15, -1, 0.06).normalize(); out.curl = 0.86;
    } else {
      out.tip.set(mouse.x - 0.004, 0.79, mouse.z - 0.052);
      out.dir.set(-0.04, 0.2, -1).normalize(); out.palm.set(-0.1, -1, 0.15).normalize(); out.curl = 0.52;
    }
    return out;
  }
  const grip = { tip: V(), dir: V(), palm: V(), curl: 0 }, NO_MOUSE = V(0.36, 0.768, -0.07);

  // pose: { t, look, slump, stretch, relax, mouse }
  function update(pose, reduce) {
    const t = reduce ? 0 : pose.t, { slump, stretch, relax } = pose;
    const work = Math.max(0, 1 - stretch - relax);
    bones.forEach(b => b.quaternion.copy(rest.get(b).local));
    B.Hips.updateMatrixWorld(true);

    // spine: pelvis rolls back on the seat, the back curls toward the screen, or straightens to stretch
    const breathe = reduce ? 0 : Math.sin(t * 1.6) * 0.012;
    const lean = [0.14, -0.04 - slump * 0.12 + relax * 0.1, -0.1 - slump * 0.16 + relax * 0.14 + stretch * 0.08, -0.12 - slump * 0.18 + relax * 0.12 + breathe];
    spine.slice(0, 4).forEach((s, k) => setWorld(s.bone, rotX(lean[k])));
    const pitch = -0.1 - slump * 0.32 + relax * 0.32 + stretch * 0.3 + (reduce ? 0 : Math.sin(t * 0.8) * 0.02);
    const qHead = new THREE.Quaternion().setFromEuler(_e.set(pitch, pose.look, 0, 'YXZ'));
    setWorld(B.Neck, rotX(lean[3]).slerp(qHead, 0.45));
    setWorld(B.Head, qHead);

    // hand targets for each activity, blended
    const head = wp(B.Head, _p);
    L.forEach((l, k) => {
      const s = l.s;
      // at work: put the fingertip on its target, and let the wrist fall where that hand shape puts it
      toolGrip(k, s, t, pose.mouse || NO_MOUSE, grip);
      qHand.copy(qFrom(l.handDir, DOWN, grip.dir, grip.palm));
      lat.crossVectors(grip.dir, grip.palm).normalize();
      const wT = _a.copy(grip.tip).sub(tipOffset(l, qHand, lat, grip.curl, tip));
      // stretching overhead, or leaning back with the hands behind the head
      const wS = _b.set(s * 0.16, head.y + 0.42, head.z + 0.04);
      const wR = _c.set(s * 0.08, head.y + 0.1, head.z + 0.14);
      pts.wrist[k].copy(wT).multiplyScalar(work).addScaledVector(wS, stretch).addScaledVector(wR, relax);
      pts.pole[k].set(s * 0.8, -0.6, 0.6).multiplyScalar(work).addScaledVector(V(s, -0.1, 0.25), stretch).addScaledVector(V(s, 0.35, -0.4), relax).normalize();
      pts.hDir[k].copy(grip.dir).multiplyScalar(work).addScaledVector(UP, stretch).addScaledVector(V(-s, 0.1, 0.3).normalize(), relax).normalize();
      pts.palm[k].copy(grip.palm).multiplyScalar(work).addScaledVector(FWD, stretch).addScaledVector(FWD, relax).normalize();
      pts.curl[k] = grip.curl * work + 0.6 * relax + 0.1 * stretch;
      pts.ankle[k].set(s * (0.15 + (k ? 0.02 : 0)), 0.1, -0.02 + (k ? 0.05 : 0));
    });
    // right foot taps
    if (!reduce) pts.ankle[1].y += Math.max(0, Math.sin(t * 3.4)) * 0.025 * work;

    L.forEach((l, k) => {
      // arm: two-bone IK, the elbow toward its pole
      l.arm.getWorldPosition(sh);
      solveJoint(sh, pts.wrist[k], l.l1, l.l2, pts.pole[k], elbow);
      _a.subVectors(elbow, sh); setWorld(l.arm, qFrom(l.armDir, BACK, _a, pts.pole[k]));
      _b.subVectors(pts.wrist[k], elbow); setWorld(l.fore, qFrom(l.foreDir, DOWN, _b, pts.palm[k]));
      qHand.copy(qFrom(l.handDir, DOWN, pts.hDir[k], pts.palm[k])); setWorld(l.hand, qHand);
      // fingers curl toward the palm; on the keys one finger at a time lifts and strikes, on the mouse the index clicks
      lat.crossVectors(pts.hDir[k], pts.palm[k]).normalize();
      l.fingers.forEach((chain, f) => {
        const spread = l.s < 0 ? [0.03, 0, 0.04, 0.1][f] : [-0.08, 0, 0.02, 0.06][f];   // outer fingers arch a touch more
        const strike = l.s < 0 && !reduce ? Math.pow(Math.max(0, Math.sin(t * 7.3 + f * 2.4)), 6) * 0.3 * work : 0;
        const click = l.s > 0 && f === 0 && !reduce ? Math.pow(Math.max(0, Math.sin(t * 2.1)), 10) * 0.18 * work : 0;
        let c = 0;
        chain.forEach((sg, j) => {
          c += (pts.curl[k] + spread * work) * CURL[j] - (j === 0 ? strike + click : 0);
          tmpQ.setFromAxisAngle(lat, c).multiply(qHand);
          setWorld(sg.bone, tmpQ);
        });
      });
      // leg: hip to ankle, the knee forward and up
      l.up.getWorldPosition(hip);
      _d.set(0, 0.55, -1).normalize();
      const pole = _p.copy(_d);
      solveJoint(hip, pts.ankle[k], l.t1, l.t2, pole, knee);
      _a.subVectors(knee, hip); setWorld(l.up, qFrom(l.upDir, FWD, _a, pole));
      _b.subVectors(pts.ankle[k], knee); setWorld(l.leg, qFrom(l.legDir, FWD, _b, pole));
      setWorld(l.foot, qFrom(l.footDir, UP, V(0, -0.35, -1), UP));
    });

    // headphones follow the head
    B.Head.getWorldQuaternion(phones.quaternion).multiply(_q.copy(headRestW).invert());
    B.Head.getWorldPosition(phones.position).add(_a.copy(headOff).applyQuaternion(phones.quaternion));
  }

  return { root, bones: B, phones, update, wrist: pts.wrist };
}
