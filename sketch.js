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
  background(10);
  
  rotateX(PI / 3);
  translate(-w / 2, -h / 2); // Centraliza a malha do terreno

  if (sound && sound.isPlaying()) {
    let spectrum = fft.analyze();
    let bass = fft.getEnergy("bass"); // Energia dos graves
    let treble = fft.getEnergy("treble"); // Energia dos agudos
    let mid = fft.getEnergy("mid"); // Médios
    let speed = map(bass, 0, 255, 0.02, 0.2);
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
  stroke(255, 0, 150, 200);
  strokeWeight(2);
  noFill();

  let scaleFactor = map(bass, 0, 255, 1, 1.2); // Faz o corpo pulsar

  push();
  scale(scaleFactor); // Faz o corpo "respirar"

  // Cabeça pulsante
  push();
  translate(0, -90, 0);
  sphere(20 + sin(frameCount * 0.1) * 5, 8, 8);
  pop();

  // Corpo principal
  push();
  cylinder(25, 80, 8, 1);
  pop();

  // Oscilações para braços e pernas
  let armSwing = sin(frameCount * 0.1) * bass * 0.02; // Movimento dos braços
  let legSwing = cos(frameCount * 0.1) * bass * 0.02; // Movimento das pernas

  // Braço Esquerdo
  push();
  translate(-30, -50, 0);
  rotateZ(-PI / 6 + armSwing);
  translate(0, 25, 0);
  cylinder(10, 50, 8, 1);
  pop();

  // Braço Direito
  push();
  translate(30, -50, 0);
  rotateZ(PI / 6 - armSwing);
  translate(0, 25, 0);
  cylinder(10, 50, 8, 1);
  pop();

  // Perna Esquerda
  push();
  translate(-15, 40, 0);
  rotateZ(-legSwing);
  translate(0, 30, 0);
  cylinder(10, 60, 8, 1);
  pop();

  // Perna Direita
  push();
  translate(15, 40, 0);
  rotateZ(legSwing);
  translate(0, 30, 0);
  cylinder(10, 60, 8, 1);
  pop();

  pop();
}
