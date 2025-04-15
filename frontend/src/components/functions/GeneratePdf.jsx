import jsPDF from "jspdf";

const generatePdf = async (products) => {
    const doc = new jsPDF();
    const baseUrl = "https://www.framesgo.com/"; // Reemplaza con el dominio correcto
    const pageHeight = doc.internal.pageSize.height; // Altura de la página
    let yOffset = 10; // Posición inicial

    for (const [index, product] of products.entries()) {
        // Agregar el nombre del producto centrado
        doc.setFontSize(16);
        const productTitle = `Producto ${index + 1}: ${product.name_product}`;
        const productTitleWidth = doc.getTextWidth(productTitle);
        const productTitleX = (doc.internal.pageSize.width - productTitleWidth) / 2;
        doc.text(productTitle, productTitleX, yOffset);
        yOffset += 15; // Espacio reducido entre el nombre y la tabla

        // Detalles del producto
        doc.setFontSize(12);
        const details = [
            `Marca: ${product.brand?.name || 'N/A'}`,
            `Color: ${product.color}`,
            `Tamaño: ${product.size}`,
            `Precio: $${formatPrice(product.discounted_price || product.price_product)}`,
        ];

        const detailX = 10; // Posición X para los detalles
        const detailWidth = 100; // Ancho del detalle
        const detailHeight = 10; // Altura de cada detalle
        const borderHeight = detailHeight * details.length + 5; // Altura total del borde
        
        // Construir URLs de las imágenes
        const centerImageUrl = `${baseUrl}${product.center_picture}`;
        const sideImageUrl = `${baseUrl}${product.side_picture}`;

        // Borde alrededor de los detalles
        doc.setLineWidth(0.5);
        doc.rect(detailX - 5, yOffset - 10, detailWidth + 30 + 70, borderHeight); // Aumentar ancho para imágenes

        // Añadir cada detalle
        for (const [i, detail] of details.entries()) {
            doc.text(detail, detailX, yOffset + (i * detailHeight));
        }

        // Espacio para imágenes
        const imageMargin =20; // Margen entre imágenes
        const imageY = yOffset - 5; // Colocar imágenes más arriba que los detalles

        // Convertir imágenes a base64 y agregarlas al PDF
        const centerImage = await loadImageAsBase64(centerImageUrl);
        const sideImage = await loadImageAsBase64(sideImageUrl);

        // Ancho y alto de las imágenes
        const imageWidth = 35; // Ancho de la imagen
        const imageHeight = 35; // Altura de la imagen

        // Colocar imágenes dentro del borde de detalles
        const imageXOffset = detailX + detailWidth + imageMargin - 30; // Mover imágenes hacia la izquierda

        // Dibuja el borde alrededor de la imagen central
        if (centerImage) {
            doc.setLineWidth(0.5);
            doc.addImage(centerImage, "JPEG", imageXOffset, imageY, imageWidth, imageHeight); // Imagen central
        }

        // Dibuja el borde alrededor de la imagen lateral
        const sideImageX = imageXOffset + imageWidth + imageMargin; // Posición X para la imagen lateral
        if (sideImage) {
            doc.setLineWidth(0.5);
            doc.addImage(sideImage, "JPEG", sideImageX, imageY, imageWidth, imageHeight); // Imagen lateral
        }

        yOffset += Math.max(borderHeight, imageHeight) + imageMargin; // Ajusta el yOffset para el siguiente producto

        // Si la página está llena, crea una nueva página
        if (yOffset > pageHeight - 30) {
            doc.addPage();
            yOffset = 10; // Reiniciar posición en la nueva página
            // Repetir el título en la nueva página
            yOffset += 20;
        }
    }

    doc.save("productos.pdf");
};

// Función para convertir imagen URL a base64
const loadImageAsBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const dataURL = canvas.toDataURL("image/jpeg");
            resolve(dataURL);
        };
        img.onerror = () => {
            console.error(`Error loading image from ${url}`);
            reject(`Error loading image from ${url}`);
        };
    });
};

// Función para formatear precios
const formatPrice = (price) => {
    return price.toLocaleString('es-CO', { maximumFractionDigits: 2 });
};

export default generatePdf;
