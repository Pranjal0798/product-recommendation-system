import csv
import random
from datetime import datetime, timedelta

# Product catalog with different categories
PRODUCTS = {
    "Electronics": [
        {"name": "Wireless Headphones", "brand": "TechSound", "price_range": (50, 150)},
        {"name": "Bluetooth Speaker", "brand": "AudioPro", "price_range": (30, 100)},
        {"name": "Smart Watch", "brand": "TechTime", "price_range": (150, 400)},
        {"name": "Laptop Stand", "brand": "DeskPro", "price_range": (25, 60)},
        {"name": "Wireless Mouse", "brand": "ClickTech", "price_range": (15, 50)},
        {"name": "USB-C Hub", "brand": "ConnectPlus", "price_range": (20, 80)},
        {"name": "Portable Charger", "brand": "PowerBank", "price_range": (25, 70)},
        {"name": "Webcam HD", "brand": "VisionCam", "price_range": (40, 120)},
        {"name": "Mechanical Keyboard", "brand": "KeyMaster", "price_range": (60, 180)},
        {"name": "Noise Cancelling Earbuds", "brand": "SoundWave", "price_range": (80, 200)},
    ],
    "Home Appliances": [
        {"name": "Coffee Maker", "brand": "BrewMaster", "price_range": (40, 120)},
        {"name": "Blender", "brand": "BlendPro", "price_range": (30, 90)},
        {"name": "Air Fryer", "brand": "CrispyCook", "price_range": (60, 150)},
        {"name": "Vacuum Cleaner", "brand": "CleanHome", "price_range": (80, 250)},
        {"name": "Toaster Oven", "brand": "QuickBake", "price_range": (50, 130)},
        {"name": "Electric Kettle", "brand": "BoilFast", "price_range": (20, 60)},
        {"name": "Food Processor", "brand": "ChopMaster", "price_range": (70, 180)},
        {"name": "Rice Cooker", "brand": "PerfectRice", "price_range": (35, 100)},
        {"name": "Microwave Oven", "brand": "QuickHeat", "price_range": (80, 200)},
        {"name": "Stand Mixer", "brand": "BakePro", "price_range": (150, 400)},
    ],
    "Sports & Fitness": [
        {"name": "Yoga Mat", "brand": "FitLife", "price_range": (20, 50)},
        {"name": "Running Shoes", "brand": "SportFit", "price_range": (60, 150)},
        {"name": "Dumbbells Set", "brand": "IronFit", "price_range": (40, 120)},
        {"name": "Resistance Bands", "brand": "FlexFit", "price_range": (15, 40)},
        {"name": "Jump Rope", "brand": "CardioMax", "price_range": (10, 30)},
        {"name": "Foam Roller", "brand": "RecoverPro", "price_range": (20, 50)},
        {"name": "Gym Bag", "brand": "CarryFit", "price_range": (25, 70)},
        {"name": "Water Bottle", "brand": "HydratePlus", "price_range": (15, 40)},
        {"name": "Tennis Racket", "brand": "CourtMaster", "price_range": (50, 200)},
        {"name": "Bicycle Helmet", "brand": "SafeRide", "price_range": (30, 100)},
    ],
    "Kitchen & Dining": [
        {"name": "Stainless Steel Pan", "brand": "CookPro", "price_range": (30, 100)},
        {"name": "Knife Set", "brand": "SharpEdge", "price_range": (40, 150)},
        {"name": "Cutting Board", "brand": "ChopWell", "price_range": (15, 50)},
        {"name": "Mixing Bowls Set", "brand": "MixMaster", "price_range": (20, 60)},
        {"name": "Glass Storage Containers", "brand": "FreshKeep", "price_range": (25, 70)},
        {"name": "Utensil Set", "brand": "ServeRight", "price_range": (20, 60)},
        {"name": "Dinner Plates Set", "brand": "DineWell", "price_range": (40, 120)},
        {"name": "Wine Glasses", "brand": "CrystalClear", "price_range": (30, 90)},
        {"name": "Spice Rack", "brand": "FlavorOrganize", "price_range": (25, 70)},
        {"name": "Coffee Grinder", "brand": "BeanCrush", "price_range": (35, 100)},
    ],
    "Personal Care": [
        {"name": "Electric Toothbrush", "brand": "SmileBright", "price_range": (30, 120)},
        {"name": "Hair Dryer", "brand": "QuickDry", "price_range": (25, 80)},
        {"name": "Massage Gun", "brand": "RelaxPro", "price_range": (80, 200)},
        {"name": "Facial Steamer", "brand": "GlowSkin", "price_range": (30, 90)},
        {"name": "Electric Shaver", "brand": "SmoothShave", "price_range": (40, 150)},
        {"name": "Body Scale", "brand": "WeighRight", "price_range": (20, 60)},
        {"name": "Nail Care Kit", "brand": "ManicurePro", "price_range": (15, 45)},
        {"name": "Aromatherapy Diffuser", "brand": "CalmScent", "price_range": (25, 70)},
        {"name": "LED Mirror", "brand": "ReflectWell", "price_range": (35, 100)},
        {"name": "Heating Pad", "brand": "WarmComfort", "price_range": (20, 60)},
    ],
    "Home & Garden": [
        {"name": "Plant Pot Set", "brand": "GreenThumb", "price_range": (20, 60)},
        {"name": "Garden Tools Set", "brand": "DigPro", "price_range": (30, 90)},
        {"name": "LED String Lights", "brand": "GlowHome", "price_range": (15, 50)},
        {"name": "Throw Pillows", "brand": "CozyLiving", "price_range": (20, 60)},
        {"name": "Storage Baskets", "brand": "OrganizeIt", "price_range": (25, 70)},
        {"name": "Wall Clock", "brand": "TimePiece", "price_range": (20, 80)},
        {"name": "Picture Frames Set", "brand": "MemoryKeep", "price_range": (25, 70)},
        {"name": "Candle Set", "brand": "WarmGlow", "price_range": (20, 60)},
        {"name": "Area Rug", "brand": "ComfortFloor", "price_range": (50, 200)},
        {"name": "Curtains", "brand": "WindowDress", "price_range": (30, 100)},
    ],
    "Office Supplies": [
        {"name": "Desk Organizer", "brand": "NeatDesk", "price_range": (15, 50)},
        {"name": "Ergonomic Chair Cushion", "brand": "SitComfort", "price_range": (25, 70)},
        {"name": "Notebook Set", "brand": "WriteWell", "price_range": (10, 30)},
        {"name": "Pen Holder", "brand": "DeskTidy", "price_range": (10, 30)},
        {"name": "Desk Lamp", "brand": "BrightWork", "price_range": (25, 80)},
        {"name": "File Folders", "brand": "OrganizePro", "price_range": (15, 40)},
        {"name": "Whiteboard", "brand": "WriteErase", "price_range": (20, 70)},
        {"name": "Paper Shredder", "brand": "SecureShred", "price_range": (40, 120)},
        {"name": "Stapler Set", "brand": "BindTight", "price_range": (15, 40)},
        {"name": "Monitor Stand", "brand": "ViewRise", "price_range": (30, 90)},
    ],
    "Books & Media": [
        {"name": "Fiction Novel", "brand": "ReadMore", "price_range": (10, 25)},
        {"name": "Cookbook", "brand": "TasteGuide", "price_range": (15, 35)},
        {"name": "Self-Help Book", "brand": "GrowWise", "price_range": (12, 30)},
        {"name": "Biography", "brand": "LifeStory", "price_range": (15, 35)},
        {"name": "Art Book", "brand": "CreativeView", "price_range": (25, 60)},
        {"name": "Travel Guide", "brand": "ExploreWorld", "price_range": (15, 40)},
        {"name": "Children's Book", "brand": "KidRead", "price_range": (8, 20)},
        {"name": "Photography Book", "brand": "CaptureMoments", "price_range": (30, 80)},
        {"name": "Science Book", "brand": "KnowMore", "price_range": (20, 50)},
        {"name": "History Book", "brand": "PastLessons", "price_range": (18, 45)},
    ],
}

def generate_purchase_data(num_customers=100, purchases_per_customer_range=(3, 15)):
    """
    Generate synthetic purchase data
    
    Args:
        num_customers: Number of unique customers
        purchases_per_customer_range: Tuple of (min, max) purchases per customer
    """
    purchases = []
    product_id_counter = 1
    product_id_map = {}  # To ensure consistent product IDs
    
    # Create product ID mapping
    for category, products in PRODUCTS.items():
        for product in products:
            key = f"{category}_{product['name']}"
            if key not in product_id_map:
                product_id_map[key] = f"P{product_id_counter:04d}"
                product_id_counter += 1
    
    # Generate purchases for each customer
    for customer_num in range(1, num_customers + 1):
        customer_id = f"C{customer_num:04d}"
        
        # Random number of purchases for this customer
        num_purchases = random.randint(*purchases_per_customer_range)
        
        # Select random products for this customer
        selected_products = []
        for _ in range(num_purchases):
            category = random.choice(list(PRODUCTS.keys()))
            product = random.choice(PRODUCTS[category])
            
            # Create purchase record
            key = f"{category}_{product['name']}"
            product_id = product_id_map[key]
            price = round(random.uniform(*product['price_range']), 2)
            rating = round(random.uniform(3.5, 5.0), 1)
            
            purchase = {
                'customer_id': customer_id,
                'customer_name': f"Customer {customer_num}",
                'product_id': product_id,
                'product_name': product['name'],
                'category': category,
                'price': price,
                'brand': product['brand'],
                'rating': rating,
            }
            
            purchases.append(purchase)
    
    return purchases

def save_to_csv(purchases, filename='purchase_data.csv'):
    """Save purchase data to CSV file"""
    fieldnames = ['customer_id', 'customer_name', 'product_id', 'product_name', 
                  'category', 'price', 'brand', 'rating']
    
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(purchases)
    
    print(f"✓ Generated {len(purchases)} purchases")
    print(f"✓ Saved to {filename}")
    
    # Print statistics
    customers = set(p['customer_id'] for p in purchases)
    products = set(p['product_id'] for p in purchases)
    categories = set(p['category'] for p in purchases)
    
    print(f"\nDataset Statistics:")
    print(f"  - Total Customers: {len(customers)}")
    print(f"  - Unique Products: {len(products)}")
    print(f"  - Categories: {len(categories)}")
    print(f"  - Total Purchases: {len(purchases)}")
    print(f"  - Avg Purchases per Customer: {len(purchases)/len(customers):.1f}")

if __name__ == "__main__":
    # Generate dataset with 100 customers, each making 3-15 purchases
    # This will create approximately 900-1500 purchase records
    purchases = generate_purchase_data(
        num_customers=100, 
        purchases_per_customer_range=(3, 15)
    )
    
    # Save to CSV
    save_to_csv(purchases, 'purchase_data.csv')
    
    # Show first few records as preview
    print("\nSample Records:")
    for i, purchase in enumerate(purchases[:5], 1):
        print(f"{i}. {purchase['customer_name']} bought {purchase['product_name']} "
              f"({purchase['category']}) for ${purchase['price']}")