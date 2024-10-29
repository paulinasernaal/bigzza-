let particles = [];
let smileParticles = [];
let upperSmileParticles = [];
let font;
let explosionTime = 5000; // Tiempo en milisegundos para la explosión (5 segundos)
let exploded = false;
let remainingParticles = []; // Array para las partículas que no desaparecerán
let selectedParticle = null; // Partícula seleccionada

// Partículas de fondo
let backgroundParticles = [];
const NUM_BACKGROUND_PARTICLES = 300; // Aumentado a 300

// Mensajes aleatorios
const messages = [
  "Obten un 20% de descuento en la compra de alguno de nuestros cocteles",
  "Compra una de nuestras pizzas y te regalaremos una de nuestras deliciosas entradas",
  "Llevate completamente gratis alguno de nuestros helados",
  "Obtén un 15% de descuento en tus siguientes 3 compras en la tienda física",
  "Por la compra de alguno de nuestros productos, te regalamos dos gaseosas"
];

function preload() {
  font = loadFont('assets/FEASFBRG.TTF');
}

function setup() {
  createCanvas(800, 600);
  textFont(font);
  textSize(120);
  fill(255, 0, 0);
  noStroke();

  // Inicializar partículas de fondo
  for (let i = 0; i < NUM_BACKGROUND_PARTICLES; i++) {
    backgroundParticles.push(new BackgroundParticle(random(width), random(height)));
  }

  let points = font.textToPoints('BIGZZA', width / 4, height / 2, 200, {
    sampleFactor: 0.5
  });

  for (let pt of points) {
    let particle = new Particle(pt.x, pt.y);
    particles.push(particle);
  }

  drawSmile(points);
  drawUpperSmile(points);

  // Programar la explosión después de 5 segundos
  setTimeout(() => {
    exploded = true;
    for (let particle of particles) {
      particle.explode();
    }
    for (let smileParticle of smileParticles) {
      smileParticle.explode();
    }
    for (let upperSmileParticle of upperSmileParticles) {
      upperSmileParticle.explode();
    }
    
    // Selecciona aleatoriamente 20 partículas que se mantendrán visibles
    let allParticles = [...particles, ...smileParticles, ...upperSmileParticles];
    remainingParticles = randomSubset(allParticles, 20);
  }, explosionTime);
}

function draw() {
  if (selectedParticle) {
    drawMessageScreen(selectedParticle.message); // Muestra la pantalla del mensaje si hay una partícula seleccionada
  } else {
    background(0);
    
    for (let particle of particles) {
      particle.update();
      particle.show();
    }

    for (let smileParticle of smileParticles) {
      smileParticle.update();
      smileParticle.show();
    }

    for (let upperSmileParticle of upperSmileParticles) {
      upperSmileParticle.update();
      upperSmileParticle.show();
    }
  }
}

// Dibuja el lienzo con el mensaje de la partícula seleccionada
function drawMessageScreen(message) {
  background(0);
  
  // Muestra las partículas de fondo
  for (let bgParticle of backgroundParticles) {
    bgParticle.update();
    bgParticle.show();
  }
  
  fill(255, 0, 0); // Establecer color rojo para el texto
  textSize(32);
  textAlign(CENTER, CENTER);
  
  // Divide el mensaje en partes
  const messageParts = splitMessage(message, 3);
  for (let i = 0; i < messageParts.length; i++) {
    text(messageParts[i], width / 2, height / 2 + (i * 40)); // Ajusta el espacio entre líneas
  }
}

// Función para dividir el mensaje en partes sin partir palabras
function splitMessage(message, numParts) {
  let words = message.split(' ');
  let parts = [];
  let currentPart = '';

  for (let word of words) {
    if ((currentPart + word).length <= Math.ceil(message.length / numParts)) {
      currentPart += (currentPart ? ' ' : '') + word;
    } else {
      parts.push(currentPart);
      currentPart = word;
    }
  }
  
  if (currentPart) {
    parts.push(currentPart); // Agregar la última parte
  }

  // Asegúrate de que haya exactamente numParts partes
  while (parts.length < numParts) {
    parts.push(''); // Rellenar con cadenas vacías si hay menos partes
  }

  return parts.slice(0, numParts); // Asegúrate de devolver solo numParts
}

function drawSmile(points) {
  let smileY = height / 2 + 60;
  let startX = points[0].x;
  let endX = points[points.length - 1].x + 100;
  let numParticles = 100;

  for (let i = 0; i <= numParticles; i++) {
    let x = lerp(startX, endX, i / numParticles);
    let curveOffset = 30 * pow((x - startX) / (endX - startX), 2);
    let y = smileY + curveOffset;
    
    let smileParticle = new SmileParticle(x, y);
    smileParticles.push(smileParticle);
  }
}

function drawUpperSmile(points) {
  let upperSmileY = height / 2 + 20;
  let startX = points[0].x - 40;
  let endX = points[points.length - 1].x + 70;
  let numParticles = 100;

  for (let i = 0; i <= numParticles; i++) {
    let x = lerp(startX, endX, i / numParticles);
    let curveOffset = 15 * pow((x - startX) / (endX - startX), 2);
    let y = upperSmileY + curveOffset;
    
    let upperSmileParticle = new SmileParticle(x, y);
    upperSmileParticles.push(upperSmileParticle);
  }
}

function randomSubset(array, num) {
  let shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, num);
}

// Detecta el clic en la pantalla para seleccionar una partícula
function mousePressed() {
  // Obtener las coordenadas del mouse
  let mx = mouseX;
  let my = mouseY;

  for (let particle of remainingParticles) {
    let d = dist(mx, my, particle.position.x, particle.position.y);
    if (d < particle.size / 2) {
      selectedParticle = particle; // Guarda la partícula seleccionada
      return;
    }
  }
}

// Clase de partículas
class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.originalPosition = createVector(x, y);
    this.offset = createVector(random(-3, 3), random(-3, 3));
    this.velocity = createVector(0, 0);
    this.opacity = 255;
    this.size = 2; // Tamaño inicial de la partícula
    this.message = random(messages); // Asigna un mensaje aleatorio
  }
  
  explode() {
    this.velocity = p5.Vector.random2D().mult(random(2, 5));
  }
  
  update() {
    if (exploded) {
      this.position.add(this.velocity);

      // Rebote en los bordes
      if (this.position.x <= 0 || this.position.x >= width) {
        this.velocity.x *= -1;
      }
      if (this.position.y <= 0 || this.position.y >= height) {
        this.velocity.y *= -1;
      }
      
      // Reducción de opacidad y aumento de tamaño para las partículas restantes
      if (!remainingParticles.includes(this)) {
        this.opacity = max(this.opacity - 2, 0);
      } else {
        this.size = min(this.size + 0.1, 30); // Aumento gradual del tamaño hasta un máximo de 30
      }
    } else {
      this.position.x = this.originalPosition.x + sin(frameCount * 0.5) * this.offset.x;
      this.position.y = this.originalPosition.y + cos(frameCount * 0.5) * this.offset.y;
    }
  }
  
  show() {
    fill(255, 0, 0, this.opacity);
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }
}

class SmileParticle extends Particle {
  show() {
    fill(255, 255, 0, this.opacity);
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }
}

// Clase para las partículas de fondo
class BackgroundParticle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D().mult(random(0.5, 2)); // Velocidad aleatoria
    this.size = random(2, 5); // Tamaño aleatorio
  }
  
  update() {
    this.position.add(this.velocity);
    
    // Rebote en los bordes
    if (this.position.x <= 0 || this.position.x >= width) {
      this.velocity.x *= -1;
    }
    if (this.position.y <= 0 || this.position.y >= height) {
      this.velocity.y *= -1;
    }
  }
  
  show() {
    fill(0, 0, 255, 150); // Color azul semi-transparente
    noStroke();
    ellipse(this.position.x, this.position.y, this.size);
  }
}
