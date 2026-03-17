//purple bold current page
// const currentPath = window.location.pathname; 
// const pages = [
//   { element: document.getElementById('home'), path: '/home.html' }, 
//   { element: document.getElementById('projects'), path: '/projects.html' }, 
//   { element: document.getElementById('art'), path: '/art.html' }, 
//   { element: document.getElementById('about'), path: '/about.html' }, 
// ]

// pages.forEach((page) => {
//   if (currentPath === page.path) page.element.classList.add('current-page')
// })

//p5.js stuff
const sketch = (p) => {

  const makeMountain = (seed, baseY, peakAmp, numPeaks) => {
    p.randomSeed(seed)
    let keyPoints = []  //stores mountain peaks and valley key points  
    keyPoints.push({ x: -10, y: baseY }) //creates leftist most point 

    for(let i = 0; i < numPeaks; i++) { 
      let x = p.map(i, 0, numPeaks - 1, 0.03 * p.width, 0.97 * p.width)
      x += p.random(-p.width * 0.04, p.width * 0.04)
      let isPeak = i % 2 === 0 
      let y = isPeak 
        ? baseY - p.random(peakAmp * 0.55, peakAmp)
        : baseY - p.random(peakAmp * 0.05, peakAmp * 0.3)
      keyPoints.push({ x, y })
    }

    keyPoints.push({ x: p.width + 10, y: baseY }) //rightest most key point 



    let points = [] //stores points in between key points 
    for (let i = 0; i < keyPoints.length - 1; i++) {
      let a = keyPoints[i], b = keyPoints[i + 1]
      let intermediatePoints = Math.max(3, Math.floor(Math.abs(b.x - a.x) / 2))

      for (let s = 0; s < intermediatePoints; s++) { 
        let t = s / intermediatePoints //represents percentage distance (decimal) between a and b 
        points.push({ x: p.lerp(a.x, b.x, t), y: p.lerp(a.y, b.y, t) })
      }
    }

    points.push(keyPoints[keyPoints.length - 1]) //manually adds last point 
    return points 

  }


  p.setup = () => {
    let canvas = p.createCanvas(p.windowWidth, 300)
    canvas.parent('desert-footer')
    p.noLoop()
  }

  p.draw = () => {
    p.background('#FAF8F3')

    const mountainPoints = makeMountain(10, p.height * 0.6, p.height * 0.4, 11)
    console.log(mountainPoints)
    console.log('canvas height', p.height)
    p.fill('#E1DDE8')
    p.noStroke()
    p.beginShape()
    for (let point of mountainPoints ) p.vertex(point.x, point.y)
    p.vertex(p.width, p.height + 5)
    p.vertex(0, p.height + 5)
    p.endShape(p.CLOSE);
  }
}
 
new p5(sketch)
