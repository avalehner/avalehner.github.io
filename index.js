//purple bold current page
const currentPath = window.location.pathname; 
const pages = [
  { element: document.getElementById('home'), path: '/home.html' }, 
  { element: document.getElementById('projects'), path: '/projects.html' }, 
  { element: document.getElementById('art'), path: '/art.html' }, 
  { element: document.getElementById('about'), path: '/about.html' }, 
]

pages.forEach((page) => {
  if (currentPath === page.path) page.element.classList.add('current-page')
})

//p5.js stuff
const sketch = (p) => {

  const makeMountain = (seed, baseY, peakAmp, numPeaks) => {
    p.randomSeed(seed)
    p.noiseSeed(seed + 100)
    let keyPoints = []  //stores mountain peaks and valley key points  
    keyPoints.push({ x: -10, y: baseY }) //creates leftist most point 

    for(let i = 0; i < numPeaks; i++) { 
      let x = p.map(i, 0, numPeaks - 1, 0.03 * p.width, 0.97 * p.width)
      x += p.random(-p.width * 0.04, p.width * 0.04)
      const isPeak = i % 2 === 0 
      const y = isPeak 
        ? baseY - p.random(peakAmp * 0.55, peakAmp)
        : baseY - p.random(peakAmp * 0.05, peakAmp * 0.3)
      keyPoints.push({ x, y })
    }

    keyPoints.push({ x: p.width + 10, y: baseY }) //rightest most key point 



    let points = [] //stores points in between key points 
    for (let i = 0; i < keyPoints.length - 1; i++) {
      const a = keyPoints[i], b = keyPoints[i + 1]
      const intermediatePoints = Math.max(3, Math.floor(Math.abs(b.x - a.x) / 2))

      for (let s = 0; s < intermediatePoints; s++) { 
        const t = s / intermediatePoints //represents percentage distance (decimal) between a and b 
        const x = p.lerp(a.x, b.x, t)
        let y = p.lerp(a.y, b.y, t)
        y += (p.noise(x * 0.02 + seed) - 0.5) * 8 
        points.push({ x, y })
      }
    }

    points.push(keyPoints[keyPoints.length - 1]) //manually adds last point 
    return points 

  }

  const makeGround = (seed) => {
    p.noiseSeed(seed)
    const points = []
    for (let x = 0; x <= p.width; x += 3) {
      const y = p.height * 0.83 
        + (p.noise((x / p.width) * 50 + seed) - 0.5)
        * p.height * 0.025 
      points.push({ x, y })
    }
    return points
  }

  const makeSingleAgave = (x, y, size, shade) => {
    const [r, g, b] = shade 
    const numLeaves = 9 

    for (let i = 0; i < numLeaves; i++ ) {
      const t = i / (numLeaves - 1)
      const angle = p.lerp(p.PI * 1.1, p.PI * 1.9, t)
      const length = size * p.lerp(0.6, 1.0, Math.sin(t * p.PI)) //how does it know to stop at 180 degrees? 
      const leafWidth = size * 0.11 //ask for trigonometry/calculus (derivative) refresher here
      const tipX = x + p.cos(angle) * length 
      const tipY = y + p.sin(angle) * length
      const midX = x + p.cos(angle) * (length/2)
      const midY = y + p.sin(angle) * (length/2) 
      const perpX = -p.sin(angle) * leafWidth
      const perpY = p.cos(angle) * leafWidth

      const lr = r + Math.floor((i - 4) * 3)
      const lg = g + Math.floor((i - 4) * 3)
      const lb = b + Math.floor((i - 4) * 2)
      p.fill(lr, lg, lb)
      p.noStroke()
      p.beginShape()

      // Top edge
      for (let nt = 0; nt <= 1; nt += 0.08) {
        let lx = p.lerp(x, tipX, nt)
        let ly = p.lerp(y, tipY, nt)
        const w = leafWidth * (1 - nt)  // width tapers to 0 at tip
        const noiseAmount = (p.noise(x * 0.01 + i * 10 + nt * 5) - 0.5) * size * 0.25 * nt
        lx += -p.sin(angle) * (w + noiseAmount)
        ly +=  p.cos(angle) * (w + noiseAmount)
        p.vertex(lx, ly)
      }

      // Bottom edge
      for (let nt = 1; nt >= 0; nt -= 0.08) {
        let lx = p.lerp(x, tipX, nt)
        let ly = p.lerp(y, tipY, nt)
        const w = leafWidth * (1 - nt)
        const noiseAmount = (p.noise(x * 0.01 + i * 10 + nt * 5 + 100) - 0.5) * size * 0.25 * nt
        lx -= -p.sin(angle) * (w + noiseAmount)
        ly -=  p.cos(angle) * (w + noiseAmount)
        p.vertex(lx, ly)
      }

      p.endShape(p.CLOSE)
    }

    p.fill(r-10, g-10, b-8); p.noStroke();
    p.ellipse(x, y, size * 0.16, size * 0.16);
  }

  const placeMultipleAgave = (seed, numAgaves) => {
    p.randomSeed(seed)
    const groundLevel = p.height * 0.83 

    for (let i = 0; i < numAgaves; i++) {
      let x = p.random(p.width * 0.01, p.width * 0.99)
      let y = p.random(groundLevel, p.height)
      let size = p.random(15, 35)
      let shade = [
        p.random(160, 185),  // red
        p.random(175, 200),  // green
        p.random(155, 175) 
      ]

      makeSingleAgave(x, y, size, shade)
    }
  }

  p.setup = () => {
    let canvas = p.createCanvas(p.windowWidth, 175)
    canvas.parent('desert-footer')
    p.noLoop()
  }

  p.draw = () => {
    // p.background('#FAF8F3')
    
    //draw mountains 
    const mountainPointsArr = [
      makeMountain(9, p.height * 0.45, p.height * 0.4, 11), 
      makeMountain(11, p.height * 0.5, p.height * 0.3, 9),
      makeMountain(12, p.height * 0.65, p.height * 0.3, 10)    ]

    const mountainColors = ['#E1DDE8', '#CDC5E1', '#B6ADD7', '#E6E7DE']
    for (let i = 0; i < mountainPointsArr.length; i++) {
      p.fill(mountainColors[i]) 
      p.noStroke()
      p.beginShape()
      for (let point of mountainPointsArr[i]) p.vertex(point.x, point.y)
      p.vertex(p.width, p.height + 5)
      p.vertex(0, p.height + 5)
      p.endShape(p.CLOSE);
    }

    //draw ground 
    const groundPoints = makeGround(99)
    p.fill('#e2d7c6') 
    p.noStroke()
    p.beginShape()
    for (let point of groundPoints) p.vertex(point.x, point.y)
    p.vertex(p.width, p.height + 5)
    p.vertex(0, p.height + 5)
    p.endShape(p.CLOSE);

    //draw agave 
    placeMultipleAgave(42, 15)
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, 175)
    p.redraw()
  }
}
 
new p5(sketch)
