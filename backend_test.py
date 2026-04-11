#!/usr/bin/env python3
"""
Backend API Testing for Community Discussion Platform (CDP)
Tests all API endpoints for auth, groups, posts, comments, and votes
"""

import requests
import sys
import json
from datetime import datetime

class CDPAPITester:
    def __init__(self, base_url="https://a3fe8a7f-b9d2-4218-94b3-33c0a65d953f.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log_test(name, False, f"Expected {expected_status}, got {response.status_code}: {response.text}")
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Request failed: {str(e)}")
            return False, {}

    def test_auth_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@cdp.com",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "Auth - Register User",
            "POST",
            "auth/register",
            201,
            data=test_data
        )
        
        if success and response.get('success') and response.get('data', {}).get('token'):
            self.token = response['data']['token']
            self.user_id = response['data']['user_id']
            return True
        return False

    def test_auth_login(self):
        """Test user login with demo credentials"""
        test_data = {
            "email": "demo@cdp.com",
            "password": "demo123"
        }
        
        success, response = self.run_test(
            "Auth - Login Demo User",
            "POST",
            "auth/login",
            200,
            data=test_data
        )
        
        if success and response.get('success') and response.get('data', {}).get('token'):
            self.token = response['data']['token']
            self.user_id = response['data']['user_id']
            return True
        return False

    def test_auth_me(self):
        """Test get current user"""
        success, response = self.run_test(
            "Auth - Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success and response.get('success')

    def test_groups_get_all(self):
        """Test get all groups"""
        success, response = self.run_test(
            "Groups - Get All Groups",
            "GET",
            "groups",
            200
        )
        
        if success and response.get('success'):
            groups = response.get('data', [])
            print(f"   Found {len(groups)} groups")
            return groups
        return []

    def test_groups_get_by_id(self, group_id):
        """Test get group by ID"""
        success, response = self.run_test(
            f"Groups - Get Group {group_id}",
            "GET",
            f"groups/{group_id}",
            200
        )
        return success and response.get('success')

    def test_groups_create(self):
        """Test create new group"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "name": f"Test Group {timestamp}",
            "description": "A test group for API testing",
            "is_private": False
        }
        
        success, response = self.run_test(
            "Groups - Create Group",
            "POST",
            "groups",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            return response.get('data', {}).get('group_id')
        return None

    def test_groups_join(self, group_id):
        """Test join group"""
        success, response = self.run_test(
            f"Groups - Join Group {group_id}",
            "POST",
            f"groups/{group_id}/join",
            200
        )
        return success and response.get('success')

    def test_groups_leave(self, group_id):
        """Test leave group"""
        success, response = self.run_test(
            f"Groups - Leave Group {group_id}",
            "POST",
            f"groups/{group_id}/leave",
            200
        )
        return success and response.get('success')

    def test_posts_get_all(self):
        """Test get all posts"""
        success, response = self.run_test(
            "Posts - Get All Posts",
            "GET",
            "posts",
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts")
            return posts
        return []

    def test_posts_get_by_group(self, group_id):
        """Test get posts filtered by group"""
        success, response = self.run_test(
            f"Posts - Get Posts by Group {group_id}",
            "GET",
            f"posts?group_id={group_id}",
            200
        )
        return success and response.get('success')

    def test_posts_create(self, group_id):
        """Test create new post"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "group_id": group_id,
            "title": f"Test Post {timestamp}",
            "content": "This is a test post created by the API testing script."
        }
        
        success, response = self.run_test(
            "Posts - Create Post",
            "POST",
            "posts",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            return response.get('data', {}).get('post_id')
        return None

    def test_posts_get_by_id(self, post_id):
        """Test get post by ID"""
        success, response = self.run_test(
            f"Posts - Get Post {post_id}",
            "GET",
            f"posts/{post_id}",
            200
        )
        return success and response.get('success')

    def test_comments_create(self, post_id):
        """Test create comment"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "post_id": post_id,
            "content": f"Test comment {timestamp} - This is a test comment."
        }
        
        success, response = self.run_test(
            "Comments - Create Comment",
            "POST",
            "comments",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            return response.get('data', {}).get('comment_id')
        return None

    def test_comments_get_by_post(self, post_id):
        """Test get comments for a post"""
        success, response = self.run_test(
            f"Comments - Get Comments for Post {post_id}",
            "GET",
            f"comments/{post_id}",
            200
        )
        
        if success and response.get('success'):
            comments = response.get('data', [])
            print(f"   Found {len(comments)} comments")
            return True
        return False

    def test_votes_upvote(self, post_id):
        """Test upvote a post"""
        test_data = {
            "post_id": post_id,
            "vote_type": "UPVOTE"
        }
        
        success, response = self.run_test(
            f"Votes - Upvote Post {post_id}",
            "POST",
            "votes",
            201,
            data=test_data
        )
        return success and response.get('success')

    def test_votes_downvote(self, post_id):
        """Test downvote a post"""
        test_data = {
            "post_id": post_id,
            "vote_type": "DOWNVOTE"
        }
        
        success, response = self.run_test(
            f"Votes - Downvote Post {post_id}",
            "POST",
            "votes",
            201,
            data=test_data
        )
        return success and response.get('success')

    def test_votes_get_count(self, post_id):
        """Test get vote count for a post"""
        success, response = self.run_test(
            f"Votes - Get Vote Count for Post {post_id}",
            "GET",
            f"votes/{post_id}",
            200
        )
        
        if success and response.get('success'):
            vote_data = response.get('data', {})
            print(f"   Votes - Up: {vote_data.get('upvotes', 0)}, Down: {vote_data.get('downvotes', 0)}, Total: {vote_data.get('total', 0)}")
            return True
        return False

    def run_all_tests(self):
        """Run comprehensive API tests"""
        print("🚀 Starting CDP API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test authentication first
        print("\n📝 Testing Authentication...")
        if not self.test_auth_login():
            print("❌ Login failed, trying registration...")
            if not self.test_auth_register():
                print("❌ Both login and registration failed. Stopping tests.")
                return False
        
        if not self.test_auth_me():
            print("❌ Get current user failed. Stopping tests.")
            return False

        # Test groups
        print("\n👥 Testing Groups...")
        groups = self.test_groups_get_all()
        
        # Test with existing group if available
        test_group_id = None
        if groups:
            test_group_id = groups[0].get('group_id')
            self.test_groups_get_by_id(test_group_id)
        
        # Create new group
        new_group_id = self.test_groups_create()
        if new_group_id:
            test_group_id = new_group_id
            self.test_groups_join(test_group_id)
            self.test_groups_leave(test_group_id)
            # Rejoin for post testing
            self.test_groups_join(test_group_id)

        if not test_group_id:
            print("❌ No group available for testing posts. Stopping.")
            return False

        # Test posts
        print("\n📄 Testing Posts...")
        posts = self.test_posts_get_all()
        self.test_posts_get_by_group(test_group_id)
        
        # Create new post
        new_post_id = self.test_posts_create(test_group_id)
        if not new_post_id:
            # Try with existing post if available
            if posts:
                new_post_id = posts[0].get('post_id')
        
        if new_post_id:
            self.test_posts_get_by_id(new_post_id)
            
            # Test comments
            print("\n💬 Testing Comments...")
            self.test_comments_create(new_post_id)
            self.test_comments_get_by_post(new_post_id)
            
            # Test votes
            print("\n👍 Testing Votes...")
            self.test_votes_upvote(new_post_id)
            self.test_votes_get_count(new_post_id)
            self.test_votes_downvote(new_post_id)
            self.test_votes_get_count(new_post_id)

        return True

    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("❌ Some tests failed. Check the details above.")
            failed_tests = [r for r in self.test_results if not r['success']]
            print(f"\nFailed tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    """Main test execution"""
    tester = CDPAPITester()
    
    try:
        success = tester.run_all_tests()
        all_passed = tester.print_summary()
        
        return 0 if all_passed else 1
        
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())