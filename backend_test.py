#!/usr/bin/env python3

import requests
import sys
import json
import uuid
from datetime import datetime

class ClassroomAPITester:
    def __init__(self, base_url="https://classroom-interface.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_course_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("API Root", success, details)
            return success
        except Exception as e:
            self.log_test("API Root", False, str(e))
            return False

    def test_get_courses_empty(self):
        """Test getting courses (initially empty)"""
        try:
            response = requests.get(f"{self.api_url}/courses", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                courses = response.json()
                details += f", Courses count: {len(courses)}"
            else:
                details += f", Error: {response.text}"
            self.log_test("Get Courses (Empty)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Courses (Empty)", False, str(e))
            return False

    def test_create_course(self):
        """Test creating a new course"""
        try:
            course_data = {
                "title": "Test Course - API Testing",
                "description": "This is a test course created by automated testing",
                "image_url": "https://picsum.photos/800/450",
                "content_description": "Test content description",
                "files": [],
                "progress": 0,
                "tag": "TEST"
            }
            
            response = requests.post(
                f"{self.api_url}/courses", 
                json=course_data,
                timeout=10
            )
            
            success = response.status_code in [200, 201]
            details = f"Status: {response.status_code}"
            
            if success:
                created_course = response.json()
                self.created_course_id = created_course.get("id")
                details += f", Course ID: {self.created_course_id}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Create Course", success, details)
            return success
        except Exception as e:
            self.log_test("Create Course", False, str(e))
            return False

    def test_get_courses_with_data(self):
        """Test getting courses after creating one"""
        try:
            response = requests.get(f"{self.api_url}/courses", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                courses = response.json()
                details += f", Courses count: {len(courses)}"
                if len(courses) > 0:
                    details += f", First course title: {courses[0].get('title', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Courses (With Data)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Courses (With Data)", False, str(e))
            return False

    def test_get_single_course(self):
        """Test getting a single course by ID"""
        if not self.created_course_id:
            self.log_test("Get Single Course", False, "No course ID available")
            return False
            
        try:
            response = requests.get(
                f"{self.api_url}/courses/{self.created_course_id}", 
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                course = response.json()
                details += f", Course title: {course.get('title', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Get Single Course", success, details)
            return success
        except Exception as e:
            self.log_test("Get Single Course", False, str(e))
            return False

    def test_update_course(self):
        """Test updating a course"""
        if not self.created_course_id:
            self.log_test("Update Course", False, "No course ID available")
            return False
            
        try:
            update_data = {
                "title": "Updated Test Course - API Testing",
                "content_description": "Updated content description with more details",
                "progress": 25
            }
            
            response = requests.put(
                f"{self.api_url}/courses/{self.created_course_id}",
                json=update_data,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                updated_course = response.json()
                details += f", Updated title: {updated_course.get('title', 'N/A')}"
                details += f", Progress: {updated_course.get('progress', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Update Course", success, details)
            return success
        except Exception as e:
            self.log_test("Update Course", False, str(e))
            return False

    def test_update_course_with_files(self):
        """Test updating course with file attachments"""
        if not self.created_course_id:
            self.log_test("Update Course with Files", False, "No course ID available")
            return False
            
        try:
            # Simulate base64 file data
            fake_file_data = {
                "name": "test-document.pdf",
                "type": "application/pdf",
                "size": 1024,
                "data": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDQKL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjE3NAolJUVPRgo=",
                "lastModified": 1640995200000
            }
            
            update_data = {
                "files": [fake_file_data]
            }
            
            response = requests.put(
                f"{self.api_url}/courses/{self.created_course_id}",
                json=update_data,
                timeout=10
            )
            
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                updated_course = response.json()
                files = updated_course.get('files', [])
                details += f", Files count: {len(files)}"
                if files:
                    details += f", First file: {files[0].get('name', 'N/A')}"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Update Course with Files", success, details)
            return success
        except Exception as e:
            self.log_test("Update Course with Files", False, str(e))
            return False

    def test_delete_course(self):
        """Test deleting a course"""
        if not self.created_course_id:
            self.log_test("Delete Course", False, "No course ID available")
            return False
            
        try:
            response = requests.delete(
                f"{self.api_url}/courses/{self.created_course_id}",
                timeout=10
            )
            
            success = response.status_code in [200, 204]
            details = f"Status: {response.status_code}"
            
            if success:
                details += ", Course deleted successfully"
            else:
                details += f", Error: {response.text}"
                
            self.log_test("Delete Course", success, details)
            return success
        except Exception as e:
            self.log_test("Delete Course", False, str(e))
            return False

    def test_get_nonexistent_course(self):
        """Test getting a non-existent course"""
        try:
            fake_id = str(uuid.uuid4())
            response = requests.get(f"{self.api_url}/courses/{fake_id}", timeout=10)
            
            success = response.status_code == 404
            details = f"Status: {response.status_code}"
            
            if success:
                details += ", Correctly returned 404 for non-existent course"
            else:
                details += f", Expected 404, got {response.status_code}"
                
            self.log_test("Get Non-existent Course", success, details)
            return success
        except Exception as e:
            self.log_test("Get Non-existent Course", False, str(e))
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print(f"🚀 Starting Classroom Interface API Tests")
        print(f"📍 Testing API at: {self.api_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_api_root,
            self.test_get_courses_empty,
            self.test_create_course,
            self.test_get_courses_with_data,
            self.test_get_single_course,
            self.test_update_course,
            self.test_update_course_with_files,
            self.test_delete_course,
            self.test_get_nonexistent_course
        ]
        
        for test in tests:
            test()
            print()
        
        # Summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = ClassroomAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())