import re
from pathlib import Path

def inspect_images():
    data_path = Path("src/data/caraguaData.ts")
    text = data_path.read_text(encoding="utf-8")
    urls = re.findall(r'https://images\.unsplash\.com/[^\s"\'`]+', text)
    print(f"Found {len(urls)} unsplash URLs in caraguaData.ts")
    for u in urls[:10]:
        print(" -", u)

    # Check INITIAL_FEED_POSTS
    match = re.search(r'INITIAL_FEED_POSTS:\s*FeedPost\[\]\s*=\s*\[(.*?)\];', text, re.DOTALL)
    if match:
        print("\nFound INITIAL_FEED_POSTS block!")
        # Let's count posts
        post_ids = re.findall(r'id:\s*["\']([^"\']+)["\']', match.group(1))
        print("Post IDs in INITIAL_FEED_POSTS:", len(post_ids), post_ids[:5])
        # Find dishes and images
        dishes = re.findall(r'dishName:\s*["\']([^"\']+)["\']', match.group(1))
        images = re.findall(r'postImage:\s*["\']([^"\']+)["\']', match.group(1))
        for d, img in zip(dishes[:5], images[:5]):
            print(f" - {d}: {img}")

if __name__ == "__main__":
    inspect_images()
