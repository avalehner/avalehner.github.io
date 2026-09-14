from PIL import Image 
import dithering 

image = Image.open("images/IMG_4224.jpg").convert("1")

dithered_image = dithering.dither(image, method="bayer16x16", levels=10)

dithered_image.save("images/dithered_IMG_4224_bayer_16.jpg")