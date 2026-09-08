from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# All other imports below
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Header, Query, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Annotated, Any
from datetime import datetime, timezone, timedelta
import os
import logging
import uuid
import bcrypt
import jwt
import requests

# =============== SETUP ================
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
ADMIN_USERNAME = os.environ['ADMIN_USERNAME']
ADMIN_PASSWORD = os.environ['ADMIN_PASSWORD']

# Emergent Object Storage
STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "hondawijayaabadi"
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    if resp.status_code == 404:
        # Retry with fresh key
        key = init_storage(force=True)
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data, timeout=120
        )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    if resp.status_code == 404:
        key = init_storage(force=True)
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key}, timeout=60
        )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# =============== HELPERS ================
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username = payload.get("sub")
        admin = await db.admin.find_one({"username": username})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_doc(doc):
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for k, v in doc.items():
            if k == "_id":
                result["id"] = str(v)
            elif isinstance(v, ObjectId):
                result[k] = str(v)
            elif isinstance(v, datetime):
                result[k] = v.isoformat()
            elif isinstance(v, dict):
                result[k] = serialize_doc(v)
            elif isinstance(v, list):
                result[k] = [serialize_doc(x) if isinstance(x, dict) else x for x in v]
            else:
                result[k] = v
        return result
    return doc

# =============== MODELS ================
class LoginRequest(BaseModel):
    username: str
    password: str

class ChangeCredentialsRequest(BaseModel):
    current_password: str
    new_username: Optional[str] = None
    new_password: Optional[str] = None

class MotorCreate(BaseModel):
    name: str
    category: str
    price: str
    image: str
    specs: List[str] = []
    description: str = ""

class MotorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[str] = None
    image: Optional[str] = None
    specs: Optional[List[str]] = None
    description: Optional[str] = None

class PromoCreate(BaseModel):
    title: str
    description: str
    terms: str = ""

class PromoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    terms: Optional[str] = None

class TestimonialCreate(BaseModel):
    name: str
    motor: str
    rating: int = 5
    comment: str
    date: str = ""

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    motor: Optional[str] = None
    rating: Optional[int] = None
    comment: Optional[str] = None
    date: Optional[str] = None

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    email: Optional[str] = None
    workingHours: Optional[str] = None
    logo: Optional[str] = None
    heroImage: Optional[str] = None
    heroTitle: Optional[str] = None
    heroTitleHighlight: Optional[str] = None
    heroSubtitle: Optional[str] = None
    footerText: Optional[str] = None

class InterestCreate(BaseModel):
    name: str
    phone: str
    motor_id: Optional[str] = None
    motor_name: str

class ManifestoCreate(BaseModel):
    number: str
    title: str
    description: str

class ManifestoUpdate(BaseModel):
    number: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None

# =============== SEED ================
async def seed_admin():
    existing = await db.admin.find_one({})
    if not existing:
        await db.admin.insert_one({
            "username": ADMIN_USERNAME,
            "password_hash": hash_password(ADMIN_PASSWORD),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logging.info(f"Admin seeded: {ADMIN_USERNAME}")

async def seed_default_data():
    # Seed settings
    settings = await db.settings.find_one({})
    if not settings:
        await db.settings.insert_one({
            "name": "Honda Wijaya Abadi Motor",
            "tagline": "Partner Terpercaya Berkendara Anda",
            "phone": "6282343488319",
            "address": "Jl. Raya Utama No. 123, Jakarta",
            "email": "info@hondawijayaabadi.com",
            "workingHours": "Senin - Sabtu: 08.00 - 17.00 WIB",
            "logo": "",
            "heroImage": "https://images.unsplash.com/photo-1588627541420-fce3f661b779?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHw0fHxzcG9ydCUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzg1MjAzNDk2fDA&ixlib=rb-4.1.0&q=85",
            "heroTitle": "Berkendara Dengan",
            "heroTitleHighlight": "Kebanggaan",
            "heroSubtitle": "Partner Terpercaya Berkendara Anda. Dapatkan motor Honda impian Anda dengan harga terbaik dan proses yang mudah.",
            "footerText": "Dealer resmi Honda terpercaya yang siap melayani kebutuhan kendaraan Anda dengan profesional dan amanah.",
            "updated_at": datetime.now(timezone.utc).isoformat(),
        })

    # Seed motorcycles
    if await db.motors.count_documents({}) == 0:
        motors = [
            {"name": "Honda Beat", "category": "Matic", "price": "Rp 18.000.000",
             "image": "https://images.unsplash.com/photo-1542683088-abb3da334598?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwyfHxIb25kYSUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzg1MjAzNDg5fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["110cc", "eSP", "Smart Key"],
             "description": "Motor matic paling irit dan gesit untuk penggunaan sehari-hari"},
            {"name": "Honda Vario 160", "category": "Matic", "price": "Rp 25.000.000",
             "image": "https://images.unsplash.com/photo-1773940792913-94baf5fa0130?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwc2hvd3Jvb218ZW58MHx8fHwxNzg1MjAzNDg5fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["160cc", "LED", "Smart Key"],
             "description": "Matic premium dengan performa terbaik di kelasnya"},
            {"name": "Honda PCX 160", "category": "Matic Premium", "price": "Rp 32.000.000",
             "image": "https://images.unsplash.com/photo-1771402382481-de35db6c4159?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwzfHxtb3RvcmN5Y2xlJTIwc2hvd3Jvb218ZW58MHx8fHwxNzg1MjAzNDg5fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["160cc", "ABS", "Idling Stop"],
             "description": "Skutik premium dengan kenyamanan dan gaya berkelas"},
            {"name": "Honda ADV 160", "category": "Adventure", "price": "Rp 36.000.000",
             "image": "https://images.unsplash.com/photo-1780282828306-93fe1d66a099?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1Mjh8MHwxfHNlYXJjaHwyfHxtb3RvcmN5Y2xlJTIwc2hvd3Jvb218ZW58MHx8fHwxNzg1MjAzNDg5fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["160cc", "ABS", "Adventure Style"],
             "description": "Motor adventure stylish untuk petualangan Anda"},
            {"name": "Honda CBR150R", "category": "Sport", "price": "Rp 38.000.000",
             "image": "https://images.unsplash.com/photo-1609630875171-b1321377ee65?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxzcG9ydCUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzg1MjAzNDk2fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["150cc", "Racing DNA", "ABS"],
             "description": "Motor sport performa tinggi dengan desain agresif"},
            {"name": "Honda CB150X", "category": "Adventure", "price": "Rp 33.000.000",
             "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxzcG9ydCUyMG1vdG9yY3ljbGV8ZW58MHx8fHwxNzg1MjAzNDk2fDA&ixlib=rb-4.1.0&q=85",
             "specs": ["150cc", "Adventure", "LED"],
             "description": "Motor petualang dengan performa tangguh"},
        ]
        now = datetime.now(timezone.utc).isoformat()
        for m in motors:
            m["created_at"] = now
            m["updated_at"] = now
        await db.motors.insert_many(motors)

    # Seed promos
    if await db.promos.count_documents({}) == 0:
        promos = [
            {"title": "Kredit DP 0%", "description": "Dapatkan motor impian dengan DP 0% untuk tenor tertentu", "terms": "S&K Berlaku"},
            {"title": "Cashback 2 Juta", "description": "Cashback hingga Rp 2.000.000 untuk pembelian cash", "terms": "Promo Terbatas"},
            {"title": "Cicilan Mulai 500rb", "description": "Angsuran ringan mulai dari Rp 500.000/bulan", "terms": "Bunga Kompetitif"},
        ]
        now = datetime.now(timezone.utc).isoformat()
        for p in promos:
            p["created_at"] = now
        await db.promos.insert_many(promos)

    # Seed testimonials
    if await db.testimonials.count_documents({}) == 0:
        testimonials = [
            {"name": "Budi Santoso", "motor": "Honda Vario 160", "rating": 5,
             "comment": "Pelayanan sangat memuaskan! Proses cepat dan staff ramah. Motor sudah sampai dengan kondisi sempurna.",
             "date": "2 minggu lalu"},
            {"name": "Siti Nurhaliza", "motor": "Honda Beat", "rating": 5,
             "comment": "Dealer terpercaya! Harga bersaing dan admin responsif. Recommended banget!",
             "date": "1 bulan lalu"},
            {"name": "Ahmad Wijaya", "motor": "Honda PCX 160", "rating": 5,
             "comment": "Beli PCX di sini worth it! Dapat harga terbaik dan bonus menarik. Terima kasih!",
             "date": "3 minggu lalu"},
            {"name": "Dewi Lestari", "motor": "Honda ADV 160", "rating": 5,
             "comment": "Proses kredit mudah dan cepat. Sales profesional dan membantu. Puas banget!",
             "date": "1 minggu lalu"},
        ]
        now = datetime.now(timezone.utc).isoformat()
        for t in testimonials:
            t["created_at"] = now
        await db.testimonials.insert_many(testimonials)

    # Seed manifesto
    if await db.manifesto.count_documents({}) == 0:
        manifesto = [
            {"number": "01", "title": "Kepercayaan", "description": "Membangun kepercayaan melalui layanan terbaik dan transparansi penuh dalam setiap transaksi."},
            {"number": "02", "title": "Kualitas", "description": "Hanya menyediakan produk Honda original dengan garansi resmi dan kualitas terjamin."},
            {"number": "03", "title": "Inovasi", "description": "Terus berinovasi dalam memberikan pengalaman pembelian yang mudah dan modern."},
            {"number": "04", "title": "Kepuasan", "description": "Kepuasan pelanggan adalah prioritas utama kami dalam setiap layanan yang diberikan."},
        ]
        now = datetime.now(timezone.utc).isoformat()
        for m in manifesto:
            m["created_at"] = now
        await db.manifesto.insert_many(manifesto)


# =============== PUBLIC ROUTES ================
@api_router.get("/")
async def root():
    return {"message": "Honda Wijaya Abadi Motor API"}

@api_router.get("/settings")
async def get_settings():
    settings = await db.settings.find_one({})
    return serialize_doc(settings) if settings else {}

@api_router.get("/motors")
async def get_motors():
    motors = await db.motors.find({}).sort("created_at", -1).to_list(1000)
    result = [serialize_doc(m) for m in motors]

    # Compute popularity based on interest count per motor
    pipeline = [
        {"$group": {"_id": "$motor_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    interest_counts = await db.interests.aggregate(pipeline).to_list(100)
    # Determine top-3 motor names as "terlaris"
    top_names = [ic["_id"] for ic in interest_counts[:3] if ic.get("count", 0) > 0]
    count_map = {ic["_id"]: ic["count"] for ic in interest_counts}

    for m in result:
        m["interest_count"] = count_map.get(m["name"], 0)
        m["is_bestseller"] = m["name"] in top_names
    return result

@api_router.get("/motors/{motor_id}")
async def get_motor(motor_id: str):
    try:
        motor = await db.motors.find_one({"_id": ObjectId(motor_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not motor:
        raise HTTPException(status_code=404, detail="Motor not found")
    return serialize_doc(motor)

@api_router.get("/promos")
async def get_promos():
    promos = await db.promos.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(p) for p in promos]

@api_router.get("/testimonials")
async def get_testimonials():
    testimonials = await db.testimonials.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(t) for t in testimonials]

@api_router.get("/manifesto")
async def get_manifesto():
    manifesto = await db.manifesto.find({}).sort("number", 1).to_list(100)
    return [serialize_doc(m) for m in manifesto]

@api_router.post("/interests")
async def create_interest(data: InterestCreate):
    doc = {
        "name": data.name,
        "phone": data.phone,
        "motor_id": data.motor_id,
        "motor_name": data.motor_name,
        "status": "new",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db.interests.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Build WhatsApp URL for the dealer notification
    settings = await db.settings.find_one({}) or {}
    dealer_phone = (settings.get("phone") or "6282343488319").replace("+", "").replace(" ", "")
    now_str = datetime.now(timezone.utc).strftime("%d %b %Y %H:%M")
    wa_message = (
        f"🔔 *MINAT KONSUMEN BARU*\n\n"
        f"📋 *Detail Konsumen:*\n"
        f"👤 Nama: {data.name}\n"
        f"📱 No. HP: {data.phone}\n"
        f"🏍️ Motor: {data.motor_name}\n"
        f"🕐 Waktu: {now_str} WIB\n\n"
        f"Mohon segera ditindaklanjuti. Terima kasih!"
    )
    import urllib.parse as up
    wa_url = f"https://wa.me/{dealer_phone}?text={up.quote(wa_message)}"

    response = serialize_doc(doc)
    response["whatsapp_url"] = wa_url
    return response


# =============== ADMIN AUTH ================
@api_router.post("/admin/login")
async def admin_login(data: LoginRequest):
    admin = await db.admin.find_one({"username": data.username})
    if not admin or not verify_password(data.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Username atau password salah")
    token = create_token(admin["username"])
    return {"token": token, "username": admin["username"]}

@api_router.get("/admin/me")
async def admin_me(admin=Depends(get_current_admin)):
    return {"username": admin["username"]}

@api_router.put("/admin/credentials")
async def change_credentials(data: ChangeCredentialsRequest, admin=Depends(get_current_admin)):
    if not verify_password(data.current_password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Password saat ini salah")
    update = {}
    if data.new_username:
        update["username"] = data.new_username
    if data.new_password:
        update["password_hash"] = hash_password(data.new_password)
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    await db.admin.update_one({"_id": admin["_id"]}, {"$set": update})
    new_username = update.get("username", admin["username"])
    token = create_token(new_username)
    return {"message": "Kredensial berhasil diubah", "token": token, "username": new_username}


# =============== ADMIN: MOTORS ================
@api_router.post("/admin/motors")
async def create_motor(data: MotorCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    now = datetime.now(timezone.utc).isoformat()
    doc["created_at"] = now
    doc["updated_at"] = now
    result = await db.motors.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@api_router.put("/admin/motors/{motor_id}")
async def update_motor(motor_id: str, data: MotorUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.motors.update_one({"_id": ObjectId(motor_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Motor not found")
    motor = await db.motors.find_one({"_id": ObjectId(motor_id)})
    return serialize_doc(motor)

@api_router.delete("/admin/motors/{motor_id}")
async def delete_motor(motor_id: str, admin=Depends(get_current_admin)):
    result = await db.motors.delete_one({"_id": ObjectId(motor_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Motor not found")
    return {"message": "Motor dihapus"}


# =============== ADMIN: PROMOS ================
@api_router.post("/admin/promos")
async def create_promo(data: PromoCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.promos.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@api_router.put("/admin/promos/{promo_id}")
async def update_promo(promo_id: str, data: PromoUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    result = await db.promos.update_one({"_id": ObjectId(promo_id)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Promo not found")
    promo = await db.promos.find_one({"_id": ObjectId(promo_id)})
    return serialize_doc(promo)

@api_router.delete("/admin/promos/{promo_id}")
async def delete_promo(promo_id: str, admin=Depends(get_current_admin)):
    result = await db.promos.delete_one({"_id": ObjectId(promo_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promo not found")
    return {"message": "Promo dihapus"}


# =============== ADMIN: TESTIMONIALS ================
@api_router.post("/admin/testimonials")
async def create_testimonial(data: TestimonialCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.testimonials.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@api_router.put("/admin/testimonials/{tid}")
async def update_testimonial(tid: str, data: TestimonialUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    result = await db.testimonials.update_one({"_id": ObjectId(tid)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    t = await db.testimonials.find_one({"_id": ObjectId(tid)})
    return serialize_doc(t)

@api_router.delete("/admin/testimonials/{tid}")
async def delete_testimonial(tid: str, admin=Depends(get_current_admin)):
    result = await db.testimonials.delete_one({"_id": ObjectId(tid)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Testimoni dihapus"}


# =============== ADMIN: MANIFESTO ================
@api_router.post("/admin/manifesto")
async def create_manifesto(data: ManifestoCreate, admin=Depends(get_current_admin)):
    doc = data.model_dump()
    doc["created_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.manifesto.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)

@api_router.put("/admin/manifesto/{mid}")
async def update_manifesto(mid: str, data: ManifestoUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    result = await db.manifesto.update_one({"_id": ObjectId(mid)}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    m = await db.manifesto.find_one({"_id": ObjectId(mid)})
    return serialize_doc(m)

@api_router.delete("/admin/manifesto/{mid}")
async def delete_manifesto(mid: str, admin=Depends(get_current_admin)):
    result = await db.manifesto.delete_one({"_id": ObjectId(mid)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Item dihapus"}


# =============== ADMIN: SETTINGS ================
@api_router.put("/admin/settings")
async def update_settings(data: SettingsUpdate, admin=Depends(get_current_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    update["updated_at"] = datetime.now(timezone.utc).isoformat()
    existing = await db.settings.find_one({})
    if existing:
        await db.settings.update_one({"_id": existing["_id"]}, {"$set": update})
    else:
        await db.settings.insert_one(update)
    settings = await db.settings.find_one({})
    return serialize_doc(settings)


# =============== ADMIN: INTERESTS ================
@api_router.get("/admin/interests")
async def get_interests(admin=Depends(get_current_admin)):
    interests = await db.interests.find({}).sort("created_at", -1).to_list(1000)
    return [serialize_doc(i) for i in interests]

@api_router.delete("/admin/interests/{iid}")
async def delete_interest(iid: str, admin=Depends(get_current_admin)):
    result = await db.interests.delete_one({"_id": ObjectId(iid)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Data minat dihapus"}

class InterestStatusUpdate(BaseModel):
    status: str

@api_router.put("/admin/interests/{iid}/status")
async def update_interest_status(iid: str, data: InterestStatusUpdate, admin=Depends(get_current_admin)):
    if data.status not in ["new", "contacted", "completed"]:
        raise HTTPException(status_code=400, detail="Status tidak valid")
    result = await db.interests.update_one({"_id": ObjectId(iid)}, {"$set": {"status": data.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Status diperbarui", "status": data.status}


# =============== ADMIN: FILE UPLOAD ================
@api_router.post("/admin/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
    allowed = ["jpg", "jpeg", "png", "webp", "gif", "svg"]
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Format file tidak didukung")

    mime_types = {
        "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
        "gif": "image/gif", "webp": "image/webp", "svg": "image/svg+xml"
    }
    content_type = mime_types.get(ext, file.content_type or "application/octet-stream")

    file_id = uuid.uuid4().hex
    path = f"{APP_NAME}/uploads/{file_id}.{ext}"
    data = await file.read()

    try:
        result = put_object(path, data, content_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

    doc = {
        "file_id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.files.insert_one(doc)

    return {"url": f"/api/files/{file_id}.{ext}", "filename": file.filename}


@api_router.get("/files/{filename}")
async def download_file(filename: str):
    file_id = filename.split(".")[0]
    record = await db.files.find_one({"file_id": file_id, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(record["storage_path"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fetch failed: {str(e)}")
    return Response(content=data, media_type=record.get("content_type", content_type))


# =============== ADMIN: DASHBOARD STATS ================
@api_router.get("/admin/stats")
async def get_stats(admin=Depends(get_current_admin)):
    return {
        "motors": await db.motors.count_documents({}),
        "promos": await db.promos.count_documents({}),
        "testimonials": await db.testimonials.count_documents({}),
        "interests": await db.interests.count_documents({}),
        "new_interests": await db.interests.count_documents({"status": "new"}),
    }


@api_router.get("/admin/analytics")
async def get_analytics(admin=Depends(get_current_admin)):
    # Last 30 days interest counts
    now = datetime.now(timezone.utc)
    days = []
    for i in range(29, -1, -1):
        d = now - timedelta(days=i)
        days.append({
            "date": d.strftime("%Y-%m-%d"),
            "label": d.strftime("%d %b"),
            "count": 0,
        })
    day_index = {d["date"]: idx for idx, d in enumerate(days)}

    interests = await db.interests.find({}, {"created_at": 1, "motor_name": 1, "status": 1}).to_list(10000)
    for it in interests:
        ca = it.get("created_at")
        if not ca:
            continue
        try:
            dt = datetime.fromisoformat(ca.replace("Z", "+00:00")) if isinstance(ca, str) else ca
            key = dt.strftime("%Y-%m-%d")
            if key in day_index:
                days[day_index[key]]["count"] += 1
        except Exception:
            continue

    # Top motors by popularity
    pipeline = [
        {"$group": {"_id": "$motor_name", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_raw = await db.interests.aggregate(pipeline).to_list(10)
    top_motors = [{"name": t["_id"], "count": t["count"]} for t in top_raw if t.get("_id")]

    # Status distribution
    status_pipe = [{"$group": {"_id": "$status", "count": {"$sum": 1}}}]
    status_raw = await db.interests.aggregate(status_pipe).to_list(10)
    status_dist = [{"status": s["_id"] or "new", "count": s["count"]} for s in status_raw]

    total = len(interests)
    today_count = days[-1]["count"] if days else 0
    week_count = sum(d["count"] for d in days[-7:])
    month_count = sum(d["count"] for d in days)

    return {
        "interests_by_day": days,
        "top_motors": top_motors,
        "status_distribution": status_dist,
        "totals": {
            "all_time": total,
            "today": today_count,
            "last_7_days": week_count,
            "last_30_days": month_count,
        }
    }


# =============== APP SETUP ================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed_admin()
    await seed_default_data()
    logger.info("Startup complete")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
