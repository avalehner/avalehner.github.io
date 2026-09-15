import numpy as np
import cv2
from PIL import Image
import dithering

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def luminance(rgb):
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b

# Load and grayscale
img = Image.open("images/IMG_4224.png").convert("L")

# downscale before dithering
scale_factor = 4
small_size = (img.width // scale_factor, img.height // scale_factor)
img = img.resize(small_size, Image.LANCZOS)

arr = np.array(img, dtype=np.uint8)

# --- CLAHE (local contrast) to pull out highlight detail in shadowed areas
# like the face, without blowing out already-bright areas like the sky ---
clip_limit = 2.5      # higher = stronger local contrast boost. try 2.0-4.0
tile_grid_size = 8    # smaller tiles = more localized boosting. try 4-16
clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
arr = clahe.apply(arr)
arr = arr.astype(np.float32)

# levels stretch (global) -- lighter touch now since CLAHE did local work already
black_point = np.percentile(arr, 2)
white_point = np.percentile(arr, 98)
arr = (arr - black_point) / (white_point - black_point) * 255
arr = np.clip(arr, 0, 255)

# gamma adjustment
arr = arr / 255.0
gamma = 0.95
arr = np.power(arr, gamma)
arr = arr * 255

# palette: black, dark shade of accent, light shade of accent
color_palette = ["#000000", "#4a7c1f", "#c4d600"]

lums = [luminance(hex_to_rgb(c)) for c in color_palette]
dark_lum = min(lums)
light_lum = max(lums)

arr = arr / 255.0
arr = dark_lum + arr * (light_lum - dark_lum)
arr = np.clip(arr, 0, 255).astype(np.uint8)

img_processed = Image.fromarray(arr).convert("RGB")

dithered_image = dithering.dither(img_processed, method="floyd-steinberg", palette=color_palette)

final_size = (dithered_image.width * scale_factor, dithered_image.height * scale_factor)
dithered_image = dithered_image.resize(final_size, Image.NEAREST)

dithered_image.save("images/dithered_IMG_4224_floyd_steinberg_dither2.jpg")