import os
from typing import Optional, List
from datetime import datetime 

from fastapi_pagination import Page, paginate
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from services.dbconnection import GetDB
from sqlalchemy.orm import session
from services.userscrud import GetUserID
from utils.functions_jwt import decode_token
from routes.auth import oauth2_scheme
from sqlalchemy import func

"""ORM"""
from models.products import Product, Discount, Shape
from schemas.products import ProductsCreateData, ProductsDataResponse, ProductsDataDeleteResponse
from models.brands import Brand
from sqlalchemy.orm import joinedload
from models.cart import CartItem,Cart

"""Buscador"""


product_routes = APIRouter()

@product_routes.get ("/products/search/fields")
def get_search_fields(db : session=Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    
    shapes = db.query(Shape.id, Shape.name_shape).all()
    brands = db.query(Brand.id, Brand.name).all()
    frame_materials = db.query(Product.frame_material.distinct()).all()
    colors = db.query(Product.color.distinct()).all()
    genders = db.query(Product.gender.distinct()).all()
    min_price = db.query(func.min(Product.price_product)).scalar()
    max_price = db.query(func.max(Product.price_product)).scalar()


    return {
        "shapes" : [{"id": shape.id,"name": shape.name_shape} for shape in shapes],
        "brands" : [{"id" : brand.id, "name" : brand.name} for brand in brands],
        "frame_materials": [fm[0] for fm in frame_materials],
        "colors": [color[0] for color in colors],
        "genders": [gender[0] for gender in genders],
        "max_price" : max_price,
        "min_price" : min_price,
    }

@product_routes.get("/products/search", response_model=Page[ProductsDataResponse])
def search_products(shape_id: Optional[int] = None, brand_id: Optional[int] = None, gender: Optional[str] = None, min_price: Optional[int] = None,
    max_price: Optional[int] = None, frame_material: Optional[str] = None, color: Optional[str] = None, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to search products")
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),   
        joinedload(Product.shape),
    )
    
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    if shape_id is not None:
        query = query.filter(Product.shape_id == shape_id)
    
    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)
    
    if frame_material is not None:
        query = query.filter(Product.frame_material.ilike(f"%{frame_material}%"))
    
    if color is not None:
        query = query.filter(Product.color.ilike(f"%{color}%"))
    
    if gender is not None:
        query = query.filter(Product.gender.ilike(f"%{gender}%"))
    
    if min_price is not None:
        query = query.filter(Product.price_product >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price_product <= max_price)
    
    products = query.all()
    
    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    
    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
    # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    return paginate(products)

"""rutas de los productos"""
#todos los productos
@product_routes.get("/products", response_model=Page[ProductsDataResponse])
def get_all_products(db: session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    )
    products = query.all()
    
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    
    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
        # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    return paginate(products)

#productos por precio (de menor a mayor)
@product_routes.get("/products/price", response_model=Page[ProductsDataResponse])
def get_products_by_price(db : session = Depends(GetDB), token : str=Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
        
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).order_by(Product.price_product.asc())
    
    products = query.all()
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    for product in products :
        if product.discount :
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
        # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    return paginate(products)

#productos por nombre
@product_routes.get("/products/name/{product_name}", response_model=List[ProductsDataResponse])
def products_by_name(product_name: str, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).filter(Product.name_product == product_name)
    
    products = query.all()
    
    if not products:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            if discount_percentage > 0:
                discounted_price = product.price_product - (product.price_product * discount_percentage / 100)
                product.discounted_price = round(discounted_price, 2)
            else:
                product.discounted_price = product.price_product
        else:
            product.discounted_price = product.price_product
            
    return products

#productos por id 
@product_routes.get("/products/existing/{product_id}", response_model = ProductsDataResponse)
def products_by_id(product_id : int, db: session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).filter(Product.id == product_id)      
    
    product = query.first()
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    if product.discount:
        discount_percentage = product.discount.discount_percentage
        if discount_percentage > 0:
            discounted_price = product.price_product - (product.price_product * discount_percentage / 100)
            product.discounted_price = round(discounted_price, 2)
        else:
            product.discounted_price = product.price_product
    else:
        product.discounted_price = product.price_product
    # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    return product

#productos por su forma
@product_routes.get("/products/shape/{shape_id}", response_model=Page[ProductsDataResponse])
def get_products_by_shape(shape_id: int, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).filter(Product.shape_id == shape_id)
    
    products = query.all()
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
        # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    if not products:
        raise HTTPException(status_code=404, detail="No products found for the specified shape")
    
    return paginate(products)

#poductos por descuento
@product_routes.get("/products/discount/{discount_id}", response_model=Page[ProductsDataResponse])
def get_products_by_discount(discount_id: int, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).filter(Product.discount_id == discount_id)
    
    products = query.all()
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
        # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    if not products:
        raise HTTPException(status_code=404, detail="No products found for the specified discount")
    return paginate(products)

#productos por marca
@product_routes.get("/products/brand/{brand_id}", response_model=Page[ProductsDataResponse])
def get_products_by_brand(brand_id: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    
    # Consulta para obtener los productos de la marca especificada
    query = db.query(Product).options(
        joinedload(Product.brand),
        joinedload(Product.discount),
        joinedload(Product.shape)
    ).filter(Product.brand_id == brand_id)
    
    products = query.all()
    
    # Obtener la cantidad reservada por el usuario específico para cada producto
    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()

    # Convertir a diccionario para acceso rápido
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    # Procesar cada producto
    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product
        
        # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    if not products:
        raise HTTPException(status_code=404, detail="No products found for the specified brand")
    
    return paginate(products)


#productos por publico de destino
@product_routes.get("/products/gender/{gender}", response_model=Page[ProductsDataResponse])
def get_products_by_gender( gender : str , db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role not in ["admin", "client"]:
        raise HTTPException(status_code=403, detail="Not authorized to access products")
    if gender:
        products = db.query(Product).filter(Product.gender == gender).all()
    else:
        products = db.query(Product).all()

    reserved_quantities = db.query(CartItem.product_id, func.sum(CartItem.quantity).label("reserved_quantity")) \
        .join(Cart) \
        .filter(Cart.user_id == user.id) \
        .group_by(CartItem.product_id) \
        .all()
        
    reserved_quantity_dict = {item.product_id: item.reserved_quantity for item in reserved_quantities}

    for product in products:
        if product.discount:
            discount_percentage = product.discount.discount_percentage
            product.discounted_price = product.price_product * (1 - discount_percentage / 100)
        else:
            product.discounted_price = product.price_product

    # Asignar la cantidad reservada específicamente por este usuario
        product.reserved_quantity = reserved_quantity_dict.get(product.id, 0)

    return paginate(products)
    
@product_routes.post("/create/product", response_model=ProductsDataResponse)
def create_product(product_data : ProductsCreateData, db : session = Depends(GetDB), token : str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create product")
    
    brand = db.query(Brand).filter(Brand.id == product_data.brand_id).first()
    if not brand:
        raise HTTPException(status_code=400, detail="Brand ID not found")

    if product_data.discount_id:
        discount = db.query(Discount).filter(Discount.id == product_data.discount_id).first()
        if not discount:
            raise HTTPException(status_code=400, detail="Discount ID not found")
    
    if product_data.shape_id:
        shape = db.query(Shape).filter(Shape.id == product_data.shape_id).first()
        if not shape:
            raise HTTPException(status_code=400, detail="shape ID not found")
    
    total_quantity = (product_data.quantity_col or 0) + (product_data.quantity_usa or 0)
    
    product = Product(
        brand_id = product_data.brand_id,
        discount_id = product_data.discount_id,
        shape_id = product_data.shape_id,
        name_product = product_data.name_product,
        frame_material = product_data.frame_material,
        color = product_data.color,
        size = product_data.size,
        size_caliber = product_data.size_caliber,
        size_vertical = product_data.size_vertical,
        size_arm = product_data.size_arm,
        gender = product_data.gender,
        quantity = total_quantity,
        price_product = product_data.price_product,
        created_at = datetime.utcnow()
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@product_routes.post("/create/products/{product_id}/picture_center", response_model = ProductsDataResponse)
def upload_center_picture(product_id : int, file: UploadFile = File(...), db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    uploads_dir = "media/products/pictures/center"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    product.center_picture = file_path
    db.commit()
    db.refresh(product)
    
    return product      

@product_routes.post("/create/products/{product_id}/side_picture", response_model = ProductsDataResponse)
def upload_center_picture(product_id : int, file: UploadFile = File(...), db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to create brad")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    uploads_dir = "media/products/pictures/side"
    os.makedirs(uploads_dir, exist_ok=True)
    file_path = os.path.join(uploads_dir, file.filename)
    with open(file_path, "wb") as file_object:
        file_object.write(file.file.read())

    product.side_picture = file_path
    db.commit()
    db.refresh(product)
    
    return product      

@product_routes.delete("/products/delete/{product_id}", response_model=ProductsDataDeleteResponse)
def delete_product(product_id: int, db: session = Depends(GetDB), token: str = Depends(oauth2_scheme)):
    decoded_token = decode_token(token)
    user = GetUserID(db, decoded_token["id"])
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete logo")
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="product not found")
    
    if product.center_picture:
        if os.path.exists(product.center_picture):
            os.remove(product.center_picture)
        else:
            raise HTTPException(status_code=404, detail="product file not found")
        
    if product.side_picture:
        if os.path.exists(product.side_picture):
            os.remove(product.side_picture)
        else:
            raise HTTPException(status_code=404, detail="side_picture file not found")
        
    db.delete(product)
    db.commit()
    
    return product