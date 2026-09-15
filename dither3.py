import numpy as np
import cv2
from PIL import Image
from rembg import remove
import dithering

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
 
def luminance(rgb):
    r, g, b = rgb
    return 0.299 * r + 0.587 * g + 0.114 * b

INPUT_PATH = "images/IMG_4224.jpg"

# --- Load original color image and get a subject mask ---
original_rgb = Image.open(INPUT_PATH).convert("RGB")
removed = remove(original_rgb)          # returns RGBA image, alpha channel = subject mask
subject_mask = np.array(removed.split()[-1], dtype=np.float32) / 255.0  # 0 = background, 1 = subject

# Load and grayscale (same image, for the dithering pipeline)
img = original_rgb.convert("L")

# downscale before dithering -- resize mask to match
scale_factor = 4
small_size = (img.width // scale_factor, img.height // scale_factor)
img = img.resize(small_size, Image.LANCZOS)
mask_img = Image.fromarray((subject_mask * 255).astype(np.uint8)).resize(small_size, Image.LANCZOS)
subject_mask = np.array(mask_img, dtype=np.float32) / 255.0

arr = np.array(img, dtype=np.uint8)

# --- CLAHE (local contrast) applied globally first, same as before ---
clip_limit = 2.5
tile_grid_size = 8
clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid_size, tile_grid_size))
arr = clahe.apply(arr)
arr = arr.astype(np.float32)

# --- NEW: extra brightness/gamma boost applied ONLY to the subject, via mask ---
subject_gamma = 0.6   # lower = brighter. try 0.4-0.8. This affects subject only.
subject_boost = np.power(arr / 255.0, subject_gamma) * 255.0

# blend: where mask=1 (subject), use boosted version. where mask=0 (background), use original.
arr = arr * (1 - subject_mask) + subject_boost * subject_mask

# levels stretch (global)
black_point = np.percentile(arr, 2)
white_point = np.percentile(arr, 98)
arr = (arr - black_point) / (white_point - black_point) * 255
arr = np.clip(arr, 0, 255)

# gamma adjustment (global, light touch now)
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

dithered_image.save("images/dithered_IMG_4224_floyd_steinberg.jpg")