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
    def __init__(self, base_url="http://localhost:8001"):
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
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
            return comments
        return []

    # NEW ITERATION 3 FEATURES - NESTED COMMENTS & DELETION

    def test_comments_create_nested(self, post_id, parent_comment_id):
        """Test create nested comment (reply)"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "post_id": post_id,
            "content": f"Test reply {timestamp} - This is a nested comment.",
            "parent_id": parent_comment_id
        }
        
        success, response = self.run_test(
            "Comments - Create Nested Comment (Reply)",
            "POST",
            "comments",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            return response.get('data', {}).get('comment_id')
        return None

    def test_comments_create_invalid_parent(self, post_id, invalid_parent_id):
        """Test create comment with invalid parent_id (should fail)"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "post_id": post_id,
            "content": f"Test invalid reply {timestamp}",
            "parent_id": invalid_parent_id
        }
        
        success, response = self.run_test(
            "Comments - Create Comment with Invalid Parent",
            "POST",
            "comments",
            404,
            data=test_data
        )
        return success

    def test_comments_create_wrong_post_parent(self, post_id, other_post_comment_id):
        """Test create comment with parent from different post (should fail)"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "post_id": post_id,
            "content": f"Test wrong post reply {timestamp}",
            "parent_id": other_post_comment_id
        }
        
        success, response = self.run_test(
            "Comments - Create Comment with Parent from Different Post",
            "POST",
            "comments",
            400,
            data=test_data
        )
        return success

    def test_comments_delete_author(self, comment_id):
        """Test delete comment by author"""
        success, response = self.run_test(
            f"Comments - Delete Comment {comment_id} (Author)",
            "DELETE",
            f"comments/{comment_id}",
            200
        )
        return success and response.get('success')

    def test_comments_delete_unauthorized(self, comment_id):
        """Test delete comment by non-author (should fail with 403)"""
        # Create a new user to test unauthorized access
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "username": f"unauth_comment_{timestamp}",
            "email": f"unauth_comment_{timestamp}@cdp.com",
            "password": "testpass123"
        }
        
        # Save current token
        original_token = self.token
        
        # Register new user
        success, response = self.run_test(
            "Auth - Register User for Comment Delete Test",
            "POST",
            "auth/register",
            201,
            data=register_data
        )
        
        if success and response.get('success'):
            # Use new user's token
            self.token = response['data']['token']
            
            # Try to delete comment (should fail)
            success, response = self.run_test(
                f"Comments - Delete Comment {comment_id} (Unauthorized)",
                "DELETE",
                f"comments/{comment_id}",
                403
            )
            
            # Restore original token
            self.token = original_token
            return success
        
        # Restore original token if registration failed
        self.token = original_token
        return False

    def test_comments_cascade_delete(self, post_id):
        """Test cascade deletion of comments and replies"""
        # Create parent comment
        parent_id = self.test_comments_create(post_id)
        if not parent_id:
            return False
        
        # Create nested replies
        reply1_id = self.test_comments_create_nested(post_id, parent_id)
        reply2_id = self.test_comments_create_nested(post_id, parent_id)
        
        if not reply1_id or not reply2_id:
            return False
        
        # Create nested reply to reply1 (3rd level)
        nested_reply_id = self.test_comments_create_nested(post_id, reply1_id)
        if not nested_reply_id:
            return False
        
        # Get comments before deletion
        comments_before = self.test_comments_get_by_post(post_id)
        comment_count_before = len(comments_before)
        
        # Delete parent comment (should cascade delete all replies)
        delete_success = self.test_comments_delete_author(parent_id)
        if not delete_success:
            return False
        
        # Get comments after deletion
        comments_after = self.test_comments_get_by_post(post_id)
        comment_count_after = len(comments_after)
        
        # Should have deleted 4 comments (parent + 2 replies + 1 nested reply)
        expected_deleted = 4
        actual_deleted = comment_count_before - comment_count_after
        
        if actual_deleted == expected_deleted:
            print(f"   Cascade delete successful: {actual_deleted} comments deleted")
            return True
        else:
            print(f"   Cascade delete failed: expected {expected_deleted}, actual {actual_deleted}")
            return False

    # POST SORTING TESTS

    def test_posts_sort_newest(self, group_id=None):
        """Test get posts sorted by newest (default)"""
        endpoint = "posts?sort=newest"
        if group_id:
            endpoint += f"&group_id={group_id}"
        
        success, response = self.run_test(
            "Posts - Sort by Newest",
            "GET",
            endpoint,
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts sorted by newest")
            # Verify sorting (newest first)
            if len(posts) > 1:
                for i in range(len(posts) - 1):
                    current_date = posts[i].get('created_at', '')
                    next_date = posts[i + 1].get('created_at', '')
                    if current_date < next_date:
                        print(f"   ❌ Sort order incorrect: {current_date} < {next_date}")
                        return False
                print("   ✅ Sort order verified (newest first)")
            return True
        return False

    def test_posts_sort_oldest(self, group_id=None):
        """Test get posts sorted by oldest"""
        endpoint = "posts?sort=oldest"
        if group_id:
            endpoint += f"&group_id={group_id}"
        
        success, response = self.run_test(
            "Posts - Sort by Oldest",
            "GET",
            endpoint,
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts sorted by oldest")
            # Verify sorting (oldest first)
            if len(posts) > 1:
                for i in range(len(posts) - 1):
                    current_date = posts[i].get('created_at', '')
                    next_date = posts[i + 1].get('created_at', '')
                    if current_date > next_date:
                        print(f"   ❌ Sort order incorrect: {current_date} > {next_date}")
                        return False
                print("   ✅ Sort order verified (oldest first)")
            return True
        return False

    def test_posts_sort_votes(self, group_id=None):
        """Test get posts sorted by vote total"""
        endpoint = "posts?sort=votes"
        if group_id:
            endpoint += f"&group_id={group_id}"
        
        success, response = self.run_test(
            "Posts - Sort by Top Voted",
            "GET",
            endpoint,
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts sorted by votes")
            # Verify sorting (highest votes first)
            if len(posts) > 1:
                for i in range(len(posts) - 1):
                    current_votes = int(posts[i].get('vote_total', 0))
                    next_votes = int(posts[i + 1].get('vote_total', 0))
                    if current_votes < next_votes:
                        print(f"   ❌ Sort order incorrect: {current_votes} < {next_votes}")
                        return False
                print("   ✅ Sort order verified (highest votes first)")
            return True
        return False

    def test_posts_sort_comments(self, group_id=None):
        """Test get posts sorted by comment count"""
        endpoint = "posts?sort=comments"
        if group_id:
            endpoint += f"&group_id={group_id}"
        
        success, response = self.run_test(
            "Posts - Sort by Most Discussed",
            "GET",
            endpoint,
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts sorted by comments")
            # Verify sorting (most comments first)
            if len(posts) > 1:
                for i in range(len(posts) - 1):
                    current_comments = int(posts[i].get('comment_count', 0))
                    next_comments = int(posts[i + 1].get('comment_count', 0))
                    if current_comments < next_comments:
                        print(f"   ❌ Sort order incorrect: {current_comments} < {next_comments}")
                        return False
                print("   ✅ Sort order verified (most comments first)")
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

    # NEW FEATURE TESTS

    def test_posts_create_with_tags(self, group_id):
        """Test create post with tags"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "group_id": group_id,
            "title": f"Tagged Post {timestamp}",
            "content": "This is a test post with tags.",
            "tags": ["testing", "api", "cdp"]
        }
        
        success, response = self.run_test(
            "Posts - Create Post with Tags",
            "POST",
            "posts",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            post_data = response.get('data', {})
            if 'tags' in post_data:
                print(f"   Created post with tags: {post_data.get('tags')}")
            return post_data.get('post_id')
        return None

    def test_posts_update(self, post_id):
        """Test update post (author only)"""
        test_data = {
            "title": "Updated Test Post",
            "content": "This post has been updated via API test.",
            "tags": ["updated", "test"]
        }
        
        success, response = self.run_test(
            f"Posts - Update Post {post_id}",
            "PUT",
            f"posts/{post_id}",
            200,
            data=test_data
        )
        return success and response.get('success')

    def test_posts_update_unauthorized(self, post_id):
        """Test update post by non-author (should fail with 403)"""
        # First, create a new user to test unauthorized access
        timestamp = datetime.now().strftime('%H%M%S')
        register_data = {
            "username": f"unauthorized_{timestamp}",
            "email": f"unauth_{timestamp}@cdp.com",
            "password": "testpass123"
        }
        
        # Save current token
        original_token = self.token
        
        # Register new user
        success, response = self.run_test(
            "Auth - Register Unauthorized User",
            "POST",
            "auth/register",
            201,
            data=register_data
        )
        
        if success and response.get('success'):
            # Use new user's token
            self.token = response['data']['token']
            
            # Try to update post (should fail)
            test_data = {
                "title": "Unauthorized Update",
                "content": "This should fail.",
                "tags": ["unauthorized"]
            }
            
            success, response = self.run_test(
                f"Posts - Update Post {post_id} (Unauthorized)",
                "PUT",
                f"posts/{post_id}",
                403,
                data=test_data
            )
            
            # Restore original token
            self.token = original_token
            return success
        
        # Restore original token if registration failed
        self.token = original_token
        return False

    def test_posts_delete(self, post_id):
        """Test delete post (author only)"""
        success, response = self.run_test(
            f"Posts - Delete Post {post_id}",
            "DELETE",
            f"posts/{post_id}",
            200
        )
        return success and response.get('success')

    def test_posts_search_keyword(self):
        """Test search posts by keyword"""
        success, response = self.run_test(
            "Posts - Search by Keyword",
            "GET",
            "posts/search?q=test",
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts matching 'test'")
            return True
        return False

    def test_posts_search_tag(self):
        """Test search posts by tag"""
        success, response = self.run_test(
            "Posts - Search by Tag",
            "GET",
            "posts/search?tag=testing",
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts with tag 'testing'")
            return True
        return False

    def test_posts_search_both(self):
        """Test search posts by both keyword and tag"""
        success, response = self.run_test(
            "Posts - Search by Keyword and Tag",
            "GET",
            "posts/search?q=test&tag=api",
            200
        )
        
        if success and response.get('success'):
            posts = response.get('data', [])
            print(f"   Found {len(posts)} posts matching both criteria")
            return True
        return False

    def test_profile_get(self, user_id):
        """Test get user profile"""
        success, response = self.run_test(
            f"Profile - Get User Profile {user_id}",
            "GET",
            f"profile/{user_id}",
            200
        )
        
        if success and response.get('success'):
            profile = response.get('data', {})
            stats = profile.get('stats', {})
            print(f"   Profile stats - Posts: {stats.get('total_posts', 0)}, Comments: {stats.get('total_comments', 0)}, Groups: {stats.get('total_groups', 0)}, Karma: {stats.get('karma', 0)}")
            return True
        return False

    def test_profile_update(self):
        """Test update own profile"""
        test_data = {
            "bio": "Updated bio from API test",
            "avatar_color": "#FF6B6B"
        }
        
        success, response = self.run_test(
            "Profile - Update Own Profile",
            "PUT",
            "profile",
            200,
            data=test_data
        )
        return success and response.get('success')

    def test_groups_private_access(self):
        """Test private group access control"""
        # Create a private group
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "name": f"Private Test Group {timestamp}",
            "description": "A private test group",
            "is_private": True
        }
        
        success, response = self.run_test(
            "Groups - Create Private Group",
            "POST",
            "groups",
            201,
            data=test_data
        )
        
        if success and response.get('success'):
            private_group_id = response.get('data', {}).get('group_id')
            
            # Test group details include membership info
            success, response = self.run_test(
                f"Groups - Get Private Group {private_group_id} Details",
                "GET",
                f"groups/{private_group_id}",
                200
            )
            
            if success and response.get('success'):
                group_data = response.get('data', {})
                is_member = group_data.get('is_member', False)
                user_role = group_data.get('user_role')
                print(f"   Private group - Member: {is_member}, Role: {user_role}")
                return private_group_id
        
        return None

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

        # NEW FEATURE TESTS
        print("\n🆕 Testing New Features...")
        
        # Test posts with tags
        print("\n🏷️ Testing Posts with Tags...")
        tagged_post_id = self.test_posts_create_with_tags(test_group_id)
        
        # Test post edit/delete (author only)
        print("\n✏️ Testing Post Edit/Delete...")
        if tagged_post_id:
            self.test_posts_update(tagged_post_id)
            self.test_posts_update_unauthorized(tagged_post_id)
            # Don't delete yet, we need it for search tests
        
        # Test search functionality
        print("\n🔍 Testing Search...")
        self.test_posts_search_keyword()
        self.test_posts_search_tag()
        self.test_posts_search_both()

        # ITERATION 3 NEW FEATURES
        print("\n🆕 Testing Iteration 3 Features...")
        
        # Test post sorting
        print("\n📊 Testing Post Sorting...")
        self.test_posts_sort_newest(test_group_id)
        self.test_posts_sort_oldest(test_group_id)
        self.test_posts_sort_votes(test_group_id)
        self.test_posts_sort_comments(test_group_id)
        
        # Test nested comments and deletion
        print("\n💬 Testing Nested Comments & Deletion...")
        if new_post_id:
            # Test comment deletion authorization
            comment_id = self.test_comments_create(new_post_id)
            if comment_id:
                self.test_comments_delete_unauthorized(comment_id)
                # Don't delete yet, we need it for nested tests
                
                # Test nested comment creation
                reply_id = self.test_comments_create_nested(new_post_id, comment_id)
                if reply_id:
                    # Test invalid parent scenarios
                    self.test_comments_create_invalid_parent(new_post_id, 99999)
                    
                    # Test cascade deletion
                    self.test_comments_cascade_delete(new_post_id)
                
                # Clean up - delete the original comment
                self.test_comments_delete_author(comment_id)
        
        # Now delete the tagged post
        if tagged_post_id:
            self.test_posts_delete(tagged_post_id)
        
        # Test profile functionality
        print("\n👤 Testing Profiles...")
        if self.user_id:
            self.test_profile_get(self.user_id)
            self.test_profile_update()
        
        # Test private group access control
        print("\n🔒 Testing Private Group Access...")
        private_group_id = self.test_groups_private_access()

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