#!/usr/bin/env python3
"""
Test script for Menus and Recipes API endpoints
Run this after authentication to test all CRUD operations
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

# You'll need to get a valid token first by logging in
# TOKEN = "your_access_token_here"
TOKEN = None

headers = {
    "Content-Type": "application/json",
}

if TOKEN:
    headers["Authorization"] = f"Bearer {TOKEN}"


def test_menu_categories():
    """Test Menu Category endpoints"""
    print("\n=== Testing Menu Categories ===")
    
    # List categories
    response = requests.get(f"{BASE_URL}/menus/categories/", headers=headers)
    print(f"GET /menus/categories/ - Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Categories: {json.dumps(response.json(), indent=2)}")
    
    # Create category
    new_category = {"name": "Test Category"}
    response = requests.post(f"{BASE_URL}/menus/categories/", 
                            headers=headers, 
                            json=new_category)
    print(f"POST /menus/categories/ - Status: {response.status_code}")
    if response.status_code == 201:
        category_id = response.json()['id']
        print(f"Created category with ID: {category_id}")
        return category_id
    else:
        print(f"Error: {response.json()}")
    
    return None


def test_menu_items(category_id=None):
    """Test Menu Item endpoints"""
    print("\n=== Testing Menu Items ===")
    
    # List items
    response = requests.get(f"{BASE_URL}/menus/items/", headers=headers)
    print(f"GET /menus/items/ - Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Found {len(response.json())} menu items")
    
    # Create item (if category_id provided)
    if category_id:
        new_item = {
            "sku": "TEST-001",
            "name": "Test Menu Item",
            "menu_category": category_id,
            "price": "99.99",
            "is_available_cafe": True
        }
        response = requests.post(f"{BASE_URL}/menus/items/", 
                                headers=headers, 
                                json=new_item)
        print(f"POST /menus/items/ - Status: {response.status_code}")
        if response.status_code == 201:
            item_id = response.json()['id']
            print(f"Created menu item with ID: {item_id}")
            return item_id
        else:
            print(f"Error: {response.json()}")
    
    return None


def test_recipes(menu_item_id=None, inventory_item_id=1):
    """Test Recipe endpoints"""
    print("\n=== Testing Recipes ===")
    
    # List recipes
    response = requests.get(f"{BASE_URL}/menus/recipes/", headers=headers)
    print(f"GET /menus/recipes/ - Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Found {len(response.json())} recipes")
    
    # Create recipe (if menu_item_id provided)
    if menu_item_id:
        new_recipe = {
            "menu_item": menu_item_id,
            "inventory_item": inventory_item_id,
            "quantity_required": 0.5
        }
        response = requests.post(f"{BASE_URL}/menus/recipes/", 
                                headers=headers, 
                                json=new_recipe)
        print(f"POST /menus/recipes/ - Status: {response.status_code}")
        if response.status_code == 201:
            recipe_id = response.json()['id']
            print(f"Created recipe with ID: {recipe_id}")
        else:
            print(f"Error: {response.json()}")
    
    # Test bulk create
    if menu_item_id:
        bulk_data = {
            "recipes": [
                {
                    "menu_item": menu_item_id,
                    "inventory_item": inventory_item_id,
                    "quantity_required": 0.3
                }
            ]
        }
        response = requests.post(f"{BASE_URL}/menus/recipes/bulk_create/", 
                                headers=headers, 
                                json=bulk_data)
        print(f"POST /menus/recipes/bulk_create/ - Status: {response.status_code}")


def main():
    """Run all tests"""
    print("=" * 50)
    print("Menus and Recipes API Test Script")
    print("=" * 50)
    
    if not TOKEN:
        print("\n⚠️  WARNING: No authentication token provided!")
        print("Please set the TOKEN variable in this script after logging in.")
        print("\nTo get a token:")
        print("1. POST to /api/auth/login/ with username and password")
        print("2. Copy the access token from the response")
        print("3. Set TOKEN variable in this script")
        print("\n")
    
    # Run tests
    category_id = test_menu_categories()
    menu_item_id = test_menu_items(category_id)
    test_recipes(menu_item_id)
    
    print("\n" + "=" * 50)
    print("Tests completed!")
    print("=" * 50)


if __name__ == "__main__":
    main()
