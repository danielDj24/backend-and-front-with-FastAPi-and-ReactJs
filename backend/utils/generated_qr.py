import qrcode
from PIL import Image, ImageDraw, ImageFont
import os
def generate_qr_code(product_id: int, product_name: str):
    url = f"https://www.framesgo.com/e-commerce/products/detail/{product_id}"
    qr = qrcode.make(url)

    qr_image = qr.convert("RGB")

    try:
        font = ImageFont.truetype("utils/fonts/ARIAL.TTF", 100)
    except Exception as e:
        print(f"Error cargando la fuente: {e}")
        font = ImageFont.load_default()

    # Crear imagen temporal para medir el texto
    temp_img = Image.new("RGB", (1, 1))
    draw = ImageDraw.Draw(temp_img)
    text_bbox = draw.textbbox((0, 0), product_name, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    new_width = max(qr_image.width, text_width + 20)
    new_height = qr_image.height + text_height + 20

    # Crear nueva imagen con suficiente espacio
    new_image = Image.new("RGB", (new_width, new_height), "white")

    qr_x = (new_width - qr_image.width) // 2
    new_image.paste(qr_image, (qr_x, 0))

    draw = ImageDraw.Draw(new_image)
    text_x = (new_width - text_width) // 2
    text_y = qr_image.height + 10
    draw.text((text_x, text_y), product_name, fill="black", font=font)

    path = f"media/products/qrcode/{product_id}.png"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    new_image.save(path)

    return path
