let cols, rows;
let scl = 40;
let w;
let h;
let terrain = [];

let fft;
let mic;
let listening = false;
let startBtn;
const TERRAIN_UPDATE_INTERVAL = 2; // recalcula a malha a cada 2 frames

// Variáveis de física para movimentar o humanoide conforme o áudio
let humanoidOffset = 80; // altura base acima do terreno
let humanoidVelocity = 0; // velocidade vertical atual
const GRAVITY = -0.8; // força gravitacional aplicada a cada frame

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pixelDensity(1);
  frameRate(60);
  w = windowWidth * 1.5;
  h = windowHeight;
  cols = floor(w / scl);
  rows = floor(h / scl);

  // Inicializa o terreno como uma matriz bidimensional
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0;
    }
  }

  startBtn = select('#start-btn');
  startBtn.mousePressed(initAudio);
  fft = new p5.FFT();
}

function initAudio() {
  userStartAudio();
  mic = new p5.AudioIn();
  mic.start(() => {
    fft.setInput(mic);
    listening = true;
    startBtn.remove();
    const instr = document.getElementById('instructions');
    if (instr) instr.remove();
  }, err => {
    console.error('Erro ao acessar áudio:', err);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = windowWidth * 1.5;
  h = windowHeight;
  cols = floor(w / scl);
  rows = floor(h / scl);
  terrain = new Array(cols).fill().map(() => new Array(rows).fill(0));
}

function draw() {
  let bass = 0;
  let treble = 0;
  let mid = 0;
  let bgBlue = 40;
  let colorIntensity = 150;
  let terrainCenter = 0; // altura do terreno no centro da cena

  if (listening) {
    fft.analyze();
    bass = fft.getEnergy("bass"); // Energia dos graves
    treble = fft.getEnergy("treble"); // Energia dos agudos
    mid = fft.getEnergy("mid"); // Médios
    bgBlue = map(treble, 0, 255, 40, 120);
    colorIntensity = map(mid, 0, 255, 50, 255);

    // Atualiza o terreno de forma menos frequente para melhorar o desempenho
    if (frameCount % TERRAIN_UPDATE_INTERVAL === 0) {
      let yoff = frameCount * 0.05;
      for (let y = 0; y < rows - 1; y++) {
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
          let noiseValue = noise(xoff, yoff);
          terrain[x][y] = map(noiseValue, 0, 1, -mid * 3.2, treble * 4.2);
          xoff += 0.1;
        }
        yoff += 0.1;
      }
    }

    // Calcula a altura do terreno no centro e atualiza a física do humanoide
    terrainCenter = terrain[floor(cols / 2)][floor(rows / 2)];
    if (bass > 170 && humanoidOffset <= 81) {
      humanoidVelocity += map(bass, 170, 255, 4, 12);
    }
    humanoidVelocity += GRAVITY;
    humanoidOffset += humanoidVelocity;
    if (humanoidOffset < 80) {
      humanoidOffset = 80;
      humanoidVelocity = 0;
    }
  }

  background(10, 10, bgBlue);

  orbitControl();
  ambientLight(80);
  directionalLight(255, 255, 255, 0.25, 0.25, -1);

  rotateX(PI / 3);
  translate(-w / 2, -h / 2); // Centraliza a malha do terreno

  if (listening) {
    stroke(255, colorIntensity, 150);
    noFill();

    // Renderiza a malha do terreno com TRIANGLE_STRIP
    for (let y = 0; y < rows - 1; y++) {
      beginShape(TRIANGLE_STRIP);
      for (let x = 0; x < cols; x++) {
        vertex(x * scl, y * scl, terrain[x][y]);
        vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
      }
      endShape();
    }

    push();
    translate(w / 2, h / 2, terrainCenter + humanoidOffset);
    drawHumanoid(bass, colorIntensity);
    pop();
  }
}

function drawHumanoid(bass, colorIntensity) {
  let scaleFactor = map(bass, 0, 255, 1, 1.2); // Faz o corpo pulsar
  let armSwing = sin(frameCount * 0.1) * bass * 0.02; // Movimento dos braços
  let legSwing = cos(frameCount * 0.1) * bass * 0.02; // Movimento das pernas

  push();
  scale(scaleFactor); // Faz o corpo "respirar"
  stroke(255, colorIntensity, 150);
  noFill();
  strokeWeight(1.5);

  // Cabeça
  push();
  translate(0, -110, 0);
  sphere(20, 8, 8);
  pop();

  // Pescoço
  push();
  translate(0, -90, 0);
  cylinder(8, 20, 8, 1);
  pop();

  // Tórax
  push();
  translate(0, -50, 0);
  box(40, 60, 20, 2, 2);
  pop();

  // Abdômen
  push();
  translate(0, 10, 0);
  box(30, 40, 15, 2, 2);
  pop();

  // Braço esquerdo
  push();
  translate(-25, -60, 0);
  sphere(8, 6, 6); // ombro
  rotateZ(-PI / 6 + armSwing);
  translate(0, 25, 0);
  cylinder(8, 40, 6, 1);
  translate(0, 20, 0);
  sphere(6, 6, 6); // cotovelo
  translate(0, 20, 0);
  cylinder(6, 40, 6, 1);
  translate(0, 25, 0);
  sphere(5, 6, 6); // mão
  pop();

  // Braço direito
  push();
  translate(25, -60, 0);
  sphere(8, 6, 6);
  rotateZ(PI / 6 - armSwing);
  translate(0, 25, 0);
  cylinder(8, 40, 6, 1);
  translate(0, 20, 0);
  sphere(6, 6, 6);
  translate(0, 20, 0);
  cylinder(6, 40, 6, 1);
  translate(0, 25, 0);
  sphere(5, 6, 6);
  pop();

  // Quadril
  push();
  translate(0, 40, 0);
  box(30, 20, 15, 2, 2);
  pop();

  // Perna esquerda
  push();
  translate(-12, 50, 0);
  sphere(6, 6, 6); // quadril
  rotateZ(-legSwing);
  translate(0, 25, 0);
  cylinder(8, 50, 6, 1);
  translate(0, 25, 0);
  sphere(6, 6, 6); // joelho
  translate(0, 25, 0);
  cylinder(6, 50, 6, 1);
  translate(0, 30, 10);
  box(12, 5, 20, 2, 2); // pé
  pop();

  // Perna direita
  push();
  translate(12, 50, 0);
  sphere(6, 6, 6);
  rotateZ(legSwing);
  translate(0, 25, 0);
  cylinder(8, 50, 6, 1);
  translate(0, 25, 0);
  sphere(6, 6, 6);
  translate(0, 25, 0);
  cylinder(6, 50, 6, 1);
  translate(0, 30, 10);
  box(12, 5, 20, 2, 2);
  pop();

  pop();
}
