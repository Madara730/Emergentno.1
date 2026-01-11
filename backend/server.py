from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
import uuid
from datetime import datetime, timezone
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Supabase configuration (hardcoded as per requirements)
SUPABASE_URL = "https://chusvhzyqvgxbxudmnsl.supabase.co"
SUPABASE_KEY = "sb_publishable_K3WeV8ieU_V3yxo1YQtQqg_NiDiXeVN"

# Create the main app
app = FastAPI(title="Classroom Interface API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class FileObject(BaseModel):
    name: str
    type: str
    data: str  # Base64 encoded
    lastModified: Optional[int] = None


class CourseBase(BaseModel):
    title: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
    content_description: Optional[str] = ""
    files: Optional[List[dict]] = []
    progress: Optional[int] = 0
    tag: Optional[str] = "AIS+"


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    content_description: Optional[str] = None
    files: Optional[List[dict]] = None
    progress: Optional[int] = None
    tag: Optional[str] = None


class Course(CourseBase):
    model_config = ConfigDict(extra="ignore")
    id: str


class RLSErrorResponse(BaseModel):
    error: str
    code: str
    message: str
    sql_fix: str


# Supabase API helper
async def supabase_request(method: str, endpoint: str, data: dict = None):
    """Make requests to Supabase REST API"""
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    
    async with httpx.AsyncClient() as client:
        if method == "GET":
            response = await client.get(url, headers=headers)
        elif method == "POST":
            response = await client.post(url, headers=headers, json=data)
        elif method == "PATCH":
            response = await client.patch(url, headers=headers, json=data)
        elif method == "DELETE":
            response = await client.delete(url, headers=headers)
        
        return response


RLS_FIX_SQL = """
-- Run this SQL in Supabase SQL Editor to enable public access:

-- First, create the courses table if it doesn't exist:
CREATE TABLE IF NOT EXISTS public.courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  content_description TEXT DEFAULT '',
  files JSONB DEFAULT '[]',
  progress INTEGER DEFAULT 0,
  tag TEXT DEFAULT 'AIS+'
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public read access" ON public.courses;
DROP POLICY IF EXISTS "Public insert access" ON public.courses;
DROP POLICY IF EXISTS "Public update access" ON public.courses;
DROP POLICY IF EXISTS "Public delete access" ON public.courses;

-- Allow anyone to read courses
CREATE POLICY "Public read access" ON public.courses
  FOR SELECT USING (true);

-- Allow anyone to insert courses (for demo purposes)
CREATE POLICY "Public insert access" ON public.courses
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update courses (for demo purposes)
CREATE POLICY "Public update access" ON public.courses
  FOR UPDATE USING (true);

-- Allow anyone to delete courses (for demo purposes)
CREATE POLICY "Public delete access" ON public.courses
  FOR DELETE USING (true);
"""


# Routes
@api_router.get("/")
async def root():
    return {"message": "Classroom Interface API"}


@api_router.get("/courses", response_model=List[Course])
async def get_courses():
    """Get all courses from Supabase"""
    try:
        response = await supabase_request("GET", "courses?select=*")
        
        if response.status_code == 200:
            courses = response.json()
            return courses
        elif response.status_code == 404:
            return []
        else:
            error_data = response.json()
            # Check for RLS error (code 42501)
            if error_data.get("code") == "42501":
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "RLS Policy Error",
                        "code": "42501",
                        "message": "Row Level Security policy violation. The database requires SQL policies to be configured.",
                        "sql_fix": RLS_FIX_SQL
                    }
                )
            raise HTTPException(status_code=response.status_code, detail=error_data)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


@api_router.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get a single course by ID"""
    try:
        response = await supabase_request("GET", f"courses?id=eq.{course_id}&select=*")
        
        if response.status_code == 200:
            courses = response.json()
            if courses:
                return courses[0]
            raise HTTPException(status_code=404, detail="Course not found")
        else:
            error_data = response.json()
            if error_data.get("code") == "42501":
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "RLS Policy Error",
                        "code": "42501",
                        "message": "Row Level Security policy violation.",
                        "sql_fix": RLS_FIX_SQL
                    }
                )
            raise HTTPException(status_code=response.status_code, detail=error_data)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


@api_router.post("/courses", response_model=Course)
async def create_course(course: CourseCreate):
    """Create a new course"""
    try:
        course_data = course.model_dump()
        course_data["id"] = str(uuid.uuid4())
        
        # Use random placeholder if no image provided
        if not course_data.get("image_url"):
            course_data["image_url"] = f"https://picsum.photos/seed/{course_data['id'][:8]}/800/450"
        
        response = await supabase_request("POST", "courses", course_data)
        
        if response.status_code in [200, 201]:
            created_courses = response.json()
            if created_courses:
                return created_courses[0]
            return course_data
        else:
            error_data = response.json()
            if error_data.get("code") == "42501":
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "RLS Policy Error",
                        "code": "42501",
                        "message": "Row Level Security policy violation. Cannot create course.",
                        "sql_fix": RLS_FIX_SQL
                    }
                )
            raise HTTPException(status_code=response.status_code, detail=error_data)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


@api_router.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, course: CourseUpdate):
    """Update a course"""
    try:
        # Filter out None values
        update_data = {k: v for k, v in course.model_dump().items() if v is not None}
        
        response = await supabase_request("PATCH", f"courses?id=eq.{course_id}", update_data)
        
        if response.status_code == 200:
            updated_courses = response.json()
            if updated_courses:
                return updated_courses[0]
            raise HTTPException(status_code=404, detail="Course not found")
        else:
            error_data = response.json()
            if error_data.get("code") == "42501":
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "RLS Policy Error",
                        "code": "42501",
                        "message": "Row Level Security policy violation. Cannot update course.",
                        "sql_fix": RLS_FIX_SQL
                    }
                )
            raise HTTPException(status_code=response.status_code, detail=error_data)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


@api_router.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Delete a course"""
    try:
        response = await supabase_request("DELETE", f"courses?id=eq.{course_id}")
        
        if response.status_code in [200, 204]:
            return {"message": "Course deleted successfully"}
        else:
            error_data = response.json()
            if error_data.get("code") == "42501":
                raise HTTPException(
                    status_code=403,
                    detail={
                        "error": "RLS Policy Error",
                        "code": "42501",
                        "message": "Row Level Security policy violation. Cannot delete course.",
                        "sql_fix": RLS_FIX_SQL
                    }
                )
            raise HTTPException(status_code=response.status_code, detail=error_data)
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Connection error: {str(e)}")


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
