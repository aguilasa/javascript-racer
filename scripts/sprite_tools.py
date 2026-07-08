import os

from PIL import Image

# Configuration
IMAGE_PATH = '/home/ingmar/WebstormProjects/javascript-racer/resources/25458.png'

# Available rectangle constants (x1, y1, x2, y2)
# Row 1 (y=11 to 58)
RECT_R1_C1 = (8, 11, 88, 58)
RECT_R1_C2 = (96, 11, 176, 58)
RECT_R1_C3 = (184, 11, 264, 58)
RECT_R1_C4 = (272, 11, 352, 58)
RECT_R1_C5 = (360, 11, 440, 58)
RECT_R1_C6 = (448, 11, 528, 58)

# Row 2 (y=71 to 112)
RECT_R2_C1 = (8, 71, 88, 112)
RECT_R2_C2 = (96, 71, 176, 112)
RECT_R2_C3 = (184, 71, 264, 112)
RECT_R2_C4 = (272, 71, 352, 112)
RECT_R2_C5 = (360, 71, 440, 112)

# Row 3 (y=123 to 170)
RECT_R3_C1 = (8, 123, 88, 170)
RECT_R3_C2 = (96, 123, 176, 170)
RECT_R3_C3 = (184, 123, 264, 170)
RECT_R3_C4 = (272, 123, 352, 170)
RECT_R3_C5 = (360, 123, 440, 170)
RECT_R3_C6 = (448, 123, 528, 170)

# Row 4 (y=183 to 224)
RECT_R4_C1 = (8, 183, 88, 224)
RECT_R4_C2 = (96, 183, 176, 224)
RECT_R4_C3 = (184, 183, 264, 224)
RECT_R4_C4 = (272, 183, 352, 224)
RECT_R4_C5 = (360, 183, 440, 224)

# Row arrays for easy access
ROW1 = [RECT_R1_C1, RECT_R1_C2, RECT_R1_C3, RECT_R1_C4, RECT_R1_C5, RECT_R1_C6]
ROW2 = [RECT_R2_C1, RECT_R2_C2, RECT_R2_C3, RECT_R2_C4, RECT_R2_C5]
ROW3 = [RECT_R3_C1, RECT_R3_C2, RECT_R3_C3, RECT_R3_C4, RECT_R3_C5, RECT_R3_C6]
ROW4 = [RECT_R4_C1, RECT_R4_C2, RECT_R4_C3, RECT_R4_C4, RECT_R4_C5]


def compare_rectangles(rect1, rect2, output_path):
    """
    Compare two rectangles pixel by pixel and save visualization.

    Args:
        rect1: Tuple (x1, y1, x2, y2) for first rectangle
        rect2: Tuple (x1, y1, x2, y2) for second rectangle
        output_path: Path to save the result image
    """
    # Load the image
    img = Image.open(IMAGE_PATH)

    # Crop the two regions
    part1 = img.crop(rect1)
    part2 = img.crop(rect2)

    # Get pixel data
    pixels1 = list(part1.getdata())
    pixels2 = list(part2.getdata())

    # Calculate dimensions
    width = rect1[2] - rect1[0]
    height = rect1[3] - rect1[1]
    total_pixels = len(pixels1)

    # Compare pixel by pixel
    differences = []
    same_count = 0
    diff_count = 0

    for i, (p1, p2) in enumerate(zip(pixels1, pixels2)):
        if p1 == p2:
            same_count += 1
        else:
            diff_count += 1
            x = i % width
            y = i // width
            differences.append((x, y, p1, p2))

    # Print results
    print("Comparison Results:")
    print(f"Part 1: Rectangle from {rect1[:2]} to {rect1[2:]} - {width}×{height} pixels")
    print(f"Part 2: Rectangle from {rect2[:2]} to {rect2[2:]} - {width}×{height} pixels")
    print(f"Total pixels compared: {total_pixels:,}")
    print("Results:")
    print(f"Identical pixels: {same_count:,} ({same_count/total_pixels*100:.2f}%)")
    print(f"Different pixels: {diff_count:,} ({diff_count/total_pixels*100:.2f}%)")

    # Create visualization image
    result_img = part1.copy()
    result_pixels = list(result_img.getdata())

    # Convert to RGB if needed
    if result_img.mode != 'RGB':
        result_img = result_img.convert('RGB')
        result_pixels = list(result_img.getdata())

    # Highlight different pixels in green
    for x, y, p1, p2 in differences:
        pixel_index = y * width + x
        result_pixels[pixel_index] = (0, 255, 0)  # Green

    # Create new image with highlighted differences
    final_img = Image.new('RGB', (width, height))
    final_img.putdata(result_pixels)

    # Save the result
    final_img.save(output_path)
    print(f"\nVisualization saved to: {output_path}")


def extract_rectangle(rect, output_path):
    """
    Extract the original image from a rectangle region.

    Args:
        rect: Tuple (x1, y1, x2, y2) for the rectangle
        output_path: Path to save the extracted image
    """
    # Load the image
    img = Image.open(IMAGE_PATH)

    # Crop the region
    cropped = img.crop(rect)

    # Save the result
    cropped.save(output_path)
    print(f"Extracted rectangle {rect} to: {output_path}")


def extract_row(row, output_prefix):
    """
    Extract all rectangles from a row.

    Args:
        row: List of rectangle tuples
        output_prefix: Prefix for output image files
    """
    print(f"\nExtracting {len(row)} rectangles from row...")
    print("=" * 60)

    for i, rect in enumerate(row):
        output_path = f"{output_prefix}_rect{i+1}.png"
        extract_rectangle(rect, output_path)


def compare_rows(row1, row2, output_prefix):
    """
    Compare all rectangles between two rows.

    Args:
        row1: List of rectangle tuples for first row
        row2: List of rectangle tuples for second row
        output_prefix: Prefix for output image files
    """
    max_rects = min(len(row1), len(row2))

    print(f"\nComparing {max_rects} rectangles between rows...")
    print("=" * 60)

    for i in range(max_rects):
        output_path = f"{output_prefix}_rect{i+1}.png"
        print(f"\n--- Rectangle {i+1} ---")
        compare_rectangles(row1[i], row2[i], output_path)


def remove_chroma_key(input_path, output_path, key_color=None, tolerance=0):
    """
    Replace a flat chroma-key background color with real alpha transparency.

    Args:
        input_path: Path to the source image (flat background, no existing alpha)
        output_path: Path to save the RGBA result
        key_color: (r, g, b) to key out. If None, sampled from the image's top-left pixel
        tolerance: Max per-channel distance from key_color still treated as background
    """
    img = Image.open(input_path).convert('RGBA')

    if key_color is None:
        key_color = img.getpixel((0, 0))[:3]

    new_pixels = [
        (r, g, b, 0)
        if abs(r - key_color[0]) <= tolerance and abs(g - key_color[1]) <= tolerance and abs(b - key_color[2]) <= tolerance
        else (r, g, b, a)
        for r, g, b, a in img.getdata()
    ]
    img.putdata(new_pixels)
    img.save(output_path)
    print(f"Chroma key {key_color} (tolerance={tolerance}) removed: {input_path} -> {output_path}")


def remove_chroma_key_batch(input_paths, output_dir, key_color=None, tolerance=0):
    """
    Run remove_chroma_key over a list of files, writing outputs to output_dir
    under their original filenames.
    """
    os.makedirs(output_dir, exist_ok=True)

    print(f"\nRemoving chroma key from {len(input_paths)} file(s)...")
    print("=" * 60)

    for input_path in input_paths:
        output_path = os.path.join(output_dir, os.path.basename(input_path))
        remove_chroma_key(input_path, output_path, key_color, tolerance)


def remove_chroma_key_soft(input_path, output_path, key_color=None):
    """
    Chroma-key removal for images where an upscaler (hqx, xBRZ, ...) blended the flat
    background into the edges instead of leaving a hard cutoff.

    Uses a green-screen-style "channel excess" keyer instead of plain RGB distance:
    coverage is driven by how much the key channel (the channel key_color is most
    dominant in) exceeds the other two channels, relative to that same excess in
    key_color itself. This is what lets a neutral/grey foreground color (e.g. the
    car's (160,160,160) trim) sit right next to a green-blended halo pixel and still
    be told apart — a plain "distance to key_color" threshold can't do that, because
    the halo ring is often *farther* from key_color (in Euclidean terms) than a
    legitimate grey pixel is, even though the halo is the one that should fade out.

    Semi-transparent edge pixels are also "un-blended" (spill decontamination),
    assuming pixel = coverage*fg + (1-coverage)*key_color, so the leftover key-color
    tint is removed instead of just faded.

    Args:
        input_path: Path to the source image (upscaled, background still a flat color)
        output_path: Path to save the RGBA result
        key_color: (r, g, b) to key out. If None, sampled from the image's top-left pixel
    """
    img = Image.open(input_path).convert('RGBA')

    if key_color is None:
        key_color = img.getpixel((0, 0))[:3]

    channel = max(range(3), key=lambda i: key_color[i])
    others = [i for i in range(3) if i != channel]
    key_excess = key_color[channel] - max(key_color[o] for o in others)
    if key_excess <= 0:
        raise ValueError(f"key_color {key_color} has no single dominant channel to key on")

    new_pixels = []
    for pixel in img.getdata():
        r, g, b, a = pixel
        c = (r, g, b)
        excess = c[channel] - max(c[o] for o in others)
        coverage = 1.0 - max(0.0, min(1.0, excess / key_excess))

        if coverage <= 0:
            new_pixels.append((*key_color, 0))
            continue
        if coverage >= 1:
            new_pixels.append(pixel)
            continue

        new_pixels.append((
            *(max(0, min(255, round(key_color[i] + (c[i] - key_color[i]) / coverage))) for i in range(3)),
            max(0, min(255, round(coverage * a))),
        ))

    img.putdata(new_pixels)
    img.save(output_path)
    print(f"Soft chroma key {key_color} removed (channel={channel}): {input_path} -> {output_path}")


# Example usage
if __name__ == "__main__":
    # Compare two specific rectangles
#     compare_rectangles(
#         RECT_R1_C6,
#         RECT_R3_C6,
#         '/home/ingmar/WebstormProjects/javascript-racer/resources/comparison_result.png'
#     )

    # Or compare two entire rows
    # compare_rows(
    #     ROW1,
    #     ROW3,
    #     '/home/ingmar/WebstormProjects/javascript-racer/resources/row_comparison'
    # )

    # extract_row(ROW1, 'row1_extracted')

    # remove_chroma_key_batch(
    #     [f'/home/ingmar/WebstormProjects/javascript-racer/resources/row1_extracted_rect{i}.png' for i in range(1, 6)],
    #     '/home/ingmar/WebstormProjects/javascript-racer/resources/transparent'
    # )

    # Requires scripts/.venv/bin/python3 (see upscalers.EsrganUpscaler docstring)
    from esrgan_arch import DEFAULT_MODEL, KNOWN_MODELS
    from upscalers import EsrganUpscaler

    models_dir = '/home/ingmar/WebstormProjects/javascript-racer/scripts/models'
    row1_files = [f'/home/ingmar/WebstormProjects/javascript-racer/resources/row1_extracted_rect{i}.png' for i in range(1, 6)]
    output_dir = '/home/ingmar/WebstormProjects/javascript-racer/resources/transparent'

    EsrganUpscaler(f'{models_dir}/4x_SGI.pth', KNOWN_MODELS[DEFAULT_MODEL]).process_batch(row1_files, output_dir)
    EsrganUpscaler(f'{models_dir}/2x_Gen5_Alpha.pth', KNOWN_MODELS['gen5_alpha']).process_batch(row1_files, output_dir)
