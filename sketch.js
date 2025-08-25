let cols, rows;
let scl = 20;
let w;
let h = 400;
let terrain = [];

let sound, fft;
let fileInput;

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  w = windowWidth;
  cols = w / scl;
  rows = h / scl;

  // Inicializa o terreno como uma matriz bidimensional
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0;
    }
  }

  fileInput = createFileInput(handleFile);
  fileInput.position(10, 10);
  fft = new p5.FFT();
}

function handleFile(file) {
  if (file.type === 'audio') {
    sound = loadSound(file.data, () => {
      sound.loop();
      fft.setInput(sound);
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  w = windowWidth; // Atualiza a largura do terreno ao redimensionar a tela
  cols = floor(w / scl);
  terrain = new Array(cols).fill().map(() => new Array(rows).fill(0));
}

function draw() {
  let bass = 0;
  let treble = 0;
  let mid = 0;
  let bgBlue = 40;

  if (sound && sound.isPlaying()) {
    let spectrum = fft.analyze();
    bass = fft.getEnergy("bass"); // Energia dos graves
    treble = fft.getEnergy("treble"); // Energia dos agudos
    mid = fft.getEnergy("mid"); // Médios
    bgBlue = map(treble, 0, 255, 40, 120);
  }

  background(10, 10, bgBlue);

  orbitControl();
  ambientLight(80);
  directionalLight(255, 255, 255, 0.25, 0.25, -1);

  rotateX(PI / 3);
  translate(-w / 2, -h / 2); // Centraliza a malha do terreno

  if (sound && sound.isPlaying()) {
    drawHumanoid(bass);

    // Atualiza o terreno dinamicamente com base no som
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols; x++) {
        let noiseValue = noise(frameCount * 0.05 + x * 0.1, y * 0.1);
        terrain[x][y] = map(noiseValue, 0, 1, -mid * 3.2, treble * 4.2);
      }
    }

    let colorIntensity = map(mid, 0, 255, 50, 255);
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
  }
}

function drawHumanoid(bass) {
  let scaleFactor = map(bass, 0, 255, 1, 1.2); // Faz o corpo pulsar
  let armSwing = sin(frameCount * 0.1) * bass * 0.02; // Movimento dos braços
  let legSwing = cos(frameCount * 0.1) * bass * 0.02; // Movimento das pernas

  push();
  scale(scaleFactor); // Faz o corpo "respirar"
  noStroke();
  ambientMaterial(200, 100, 200);

  // Cabeça com olhos
  push();
  translate(0, -110, 0);
  sphere(20, 16, 16);
  // Olho esquerdo
  push();
  translate(-7, -5, 18);
  ambientMaterial(20);
  sphere(3, 8, 8);
  pop();
  // Olho direito
  push();
  translate(7, -5, 18);
  ambientMaterial(20);
  sphere(3, 8, 8);
  pop();
  ambientMaterial(200, 100, 200);
  pop();

  // Pescoço
  push();
  translate(0, -90, 0);
  cylinder(8, 20);
  pop();

  // Tórax
  push();
  translate(0, -50, 0);
  box(40, 60, 20);
  pop();

  // Abdômen
  push();
  translate(0, 10, 0);
  box(30, 40, 15);
  pop();

  // Braço esquerdo
  push();
  translate(-25, -60, 0);
  sphere(8); // articulacao do ombro
  rotateZ(-PI / 6 + armSwing);
  translate(0, 25, 0);
  cylinder(8, 40);
  translate(0, 20, 0);
  sphere(6); // cotovelo
  translate(0, 20, 0);
  cylinder(6, 40);
  translate(0, 25, 0);
  sphere(5); // mão
  pop();

  // Braço direito
  push();
  translate(25, -60, 0);
  sphere(8);
  rotateZ(PI / 6 - armSwing);
  translate(0, 25, 0);
  cylinder(8, 40);
  translate(0, 20, 0);
  sphere(6);
  translate(0, 20, 0);
  cylinder(6, 40);
  translate(0, 25, 0);
  sphere(5);
  pop();

  // Quadril
  push();
  translate(0, 40, 0);
  box(30, 20, 15);
  pop();

  // Perna esquerda
  push();
  translate(-12, 50, 0);
  sphere(6); // articulacao do quadril
  rotateZ(-legSwing);
  translate(0, 25, 0);
  cylinder(8, 50);
  translate(0, 25, 0);
  sphere(6); // joelho
  translate(0, 25, 0);
  cylinder(6, 50);
  translate(0, 30, 10);
  box(12, 5, 20); // pé
  pop();

  // Perna direita
  push();
  translate(12, 50, 0);
  sphere(6);
  rotateZ(legSwing);
  translate(0, 25, 0);
  cylinder(8, 50);
  translate(0, 25, 0);
  sphere(6);
  translate(0, 25, 0);
  cylinder(6, 50);
  translate(0, 30, 10);
  box(12, 5, 20);
  pop();

  pop();
}
