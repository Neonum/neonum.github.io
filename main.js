const canvasMainElement = document.getElementById('result')
const canvasBackElement = document.createElement('canvas')
const canvasTextureElement = document.getElementById('texture')

const mainContext = canvasMainElement.getContext('2d')
const backContext = canvasBackElement.getContext('2d')
const textureContext = canvasTextureElement.getContext('2d')

const pathImageData = [
  loadImage({name: 'bg', path: 'assets/bathroom-a/bathroom.jpeg'}),
  loadImage({name: 'uv', path: 'assets/bathroom-a/uvmask.png'}),
  loadImage({name: 'mask_a', type: 'mask', path:  'assets/bathroom-a/mask-a.ashx'}),
  loadImage({name: 'mask_c', type: 'mask', path:  'assets/bathroom-a/mask-c.ashx'}),
  loadImage({name: 'mask_d', type: 'mask', path:  'assets/bathroom-a/mask-d.ashx'}),
  loadImage({name: 'mask_g', type: 'mask', path:  'assets/bathroom-a/mask-g.ashx'}),
  loadImage({name: 'tile_a', type: 'tile', path:  'assets/bathroom-a/tile_a.jpg'}),
  // loadImage({name: 'tile_b', type: 'tile', path:  'assets/bathroom-a/tile_b.jpg'}),
  // loadImage({name: 'tile_c', type: 'tile', path:  'assets/bathroom-a/tile_c.jpg'}),
  loadImage({name: 'tile_d', type: 'tile', path:  'assets/bathroom-a/tile_d.png'}),
  // loadImage({name: 'tile_e', type: 'tile', path:  'assets/bathroom-a/tile_e.jpg'}),

  loadImage({name: 'tile_1', type: 'tile', path:  'assets/bathroom-a/tile_1.jpg'}),
  loadImage({name: 'tile_2', type: 'tile', path:  'assets/bathroom-a/tile_2.jpg'}),
  loadImage({name: 'tile_3', type: 'tile', path:  'assets/bathroom-a/tile_3.jpg'}),
  loadImage({name: 'tile_4', type: 'tile', path:  'assets/bathroom-a/tile_4.jpg'}),
  loadImage({name: 'tile_5', type: 'tile', path:  'assets/bathroom-a/tile_5.jpg'}),
  loadImage({name: 'tile_6', type: 'tile', path:  'assets/bathroom-a/tile_6.jpg'}),
  loadImage({name: 'tile_7', type: 'tile', path:  'assets/bathroom-a/tile_7.jpg'}),
  loadImage({name: 'tile_8', type: 'tile', path:  'assets/bathroom-a/tile_8.jpg'})
];

let click = false

const imageData = {}
Promise.all(pathImageData)
  .then(images => run(images))

function run(images) {
  imageData['masks'] = []
  imageData['tiles'] = []
  images.forEach(image => {
    console.log('image', image)
    if (image.type === 'mask') {
      imageData['masks'].push(image);
      return
    }

    if (image.type === 'tile') {
      imageData['tiles'].push(image);
      return
    }

    imageData[image.name] = image.image
  })

  canvasMainElement.width = imageData.masks[0].image.width;
  canvasMainElement.height = imageData.masks[0].image.height;
  canvasBackElement.width = canvasMainElement.width
  canvasBackElement.height = canvasMainElement.height
  mainContext.drawImage(imageData.bg, 0, 0, canvasMainElement.width, canvasMainElement.height)
  backContext.drawImage(imageData.bg, 0, 0, canvasMainElement.width, canvasMainElement.height)

  canvasMainElement.addEventListener('mousemove', onMouseMove)
  canvasMainElement.addEventListener('click', onMouseClick)
  canvasMainElement.addEventListener('mouseout', () => mainContext.drawImage(canvasBackElement, 0, 0))

  canvasTextureElement.width = imageData.tiles[0].image.width;
  canvasTextureElement.height = imageData.tiles[0].image.height;
  textureContext.drawImage(imageData.tiles[0].image, 0, 0)
  click = false

  imageData['tiles'].forEach((tile) => {
    document.body.appendChild(tile.image);
    tile.image.style.width = '150px'
    tile.image.style.height = '150px'
    tile.image.style.margin = '0 10px'
    tile.image.addEventListener('click', (event) => {
      textureContext.drawImage(tile.image, 0, 0)
    })
  });
}

function onMouseMove(event) {
  const rect = canvasMainElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let currentMask = null
  mainContext.drawImage(canvasBackElement, 0, 0, canvasBackElement.width, canvasBackElement.height)

  for (let i = 0; i < imageData.masks.length; i++) {
    const tempCanvas = document.createElement('canvas')
    const tempContext = tempCanvas.getContext('2d')
    tempCanvas.width = imageData.masks[i].image.width
    tempCanvas.height = imageData.masks[i].image.height
    tempContext.drawImage(imageData.masks[i].image, 0, 0)

    const pixel = tempContext.getImageData(x, y, 1, 1).data;
    if (pixel[0] !== 0 && pixel[1] !== 0 && pixel[3] !== 0) {
      currentMask = imageData.masks[i].name
      mainContext.drawImage(imageData.masks[i].image, 0, 0)
    }
  }
}

function onMouseClick(event) {
  const rect = canvasMainElement.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  let currentMask = null

  for (let i = 0; i < imageData.masks.length && currentMask === null; i++) {
    const tempCanvas = document.createElement('canvas')
    const tempContext = tempCanvas.getContext('2d')
    tempCanvas.width = imageData.masks[i].image.width
    tempCanvas.height = imageData.masks[i].image.height
    tempContext.drawImage(imageData.masks[i].image, 0, 0)

    const pixel = tempContext.getImageData(x, y, 1, 1).data;
    if (pixel[0] !== 0 && pixel[1] !== 0 && pixel[3] !== 0) {
      currentMask = imageData.masks[i].image
    }
  }

  if (currentMask === null) {
    return
  }

  const tempCanvas = document.createElement('canvas')
  const tempContext = tempCanvas.getContext('2d')
  tempCanvas.width = currentMask.width
  tempCanvas.height = currentMask.height
  tempContext.drawImage(currentMask, 0, 0)

  const uvCanvas = document.createElement('canvas')
  const uvContext = uvCanvas.getContext('2d')
  uvCanvas.width = imageData.uv.width
  uvCanvas.height = imageData.uv.height
  uvContext.drawImage(imageData.uv, 0, 0)

  for (let y = 0; y < currentMask.height; y++) {
    for (let x = 0; x < currentMask.width; x++) {
      const pixel = tempContext.getImageData(x, y, 1, 1).data;
      if (pixel[0] !== 0 && pixel[1] !== 0 && pixel[3] !== 0) {
        const newPixel = uvContext.getImageData(x, y, 1, 1).data;
        const uvx = newPixel[0] * 4 % textureContext.canvas.width
        const uvy = newPixel[1] * 4 % textureContext.canvas.height
        const texel = textureContext.getImageData(uvx-1, uvy-1, 3, 3).data;
        backContext.beginPath()
        backContext.fillStyle = `rgb(${texel[0]}, ${texel[1]}, ${texel[2]})`
        backContext.fillRect(x, y, 1, 1)
      }
    }
  }

  mainContext.drawImage(canvasBackElement, 0, 0, canvasMainElement.width, canvasMainElement.height)
}


function loadImage(imageData) {
  return new Promise((resolve, reject) => {
    let image = new Image()
    image.onload = () => resolve({name: imageData.name, type: imageData.type, image:image})
    const msg = `Could not load image at ${imageData.path}`
    image.onerror = () => reject(new Error(msg))
    image.src = imageData.path;
    image.crossOrigin = "Anonymous";
  })
}
