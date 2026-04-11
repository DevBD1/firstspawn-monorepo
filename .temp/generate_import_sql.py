import sqlite3
import os
import re

db_path = '.temp/minecraft_servers.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
c = conn.cursor()

query = """
SELECT slug, display_name, description, ip, port, region, website_url, discord_url 
FROM servers_v2 
LIMIT 1500
"""

c.execute(query)
rows = c.fetchall()

sql_file = '.temp/import_1500.sql'

def slugify(text):
    text = (text or "").lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write("-- Auto-generated import script\n")
    f.write("BEGIN;\n\n")
    for row in rows:
        slug_raw, display_name, description, ip, port, region, website_url, discord_url = row
        
        slug = slug_raw if slug_raw else slugify(display_name)
        if not slug:
            slug = slugify(ip) if ip else f"unknown-{hash(display_name)}"
        
        # limit slug length and escape
        slug = slug[:64].replace("'", "''")
        
        name = (display_name or slug).replace("'", "''")[:64]
        desc = (description or "No description").replace("'", "''")
        host = (ip or "127.0.0.1").replace("'", "''")
        
        
        region_str = f"'{region.replace(chr(39), chr(39)+chr(39))}'" if region else "NULL"
        website_url_str = f"'{website_url.replace(chr(39), chr(39)+chr(39))}'" if website_url else "NULL"
        discord_url_str = f"'{discord_url.replace(chr(39), chr(39)+chr(39))}'" if discord_url else "NULL"

        f.write(f"INSERT INTO servers (id, slug, name, description, host, port, game, status, online_mode, region, website_url, discord_url) VALUES (gen_random_uuid(), '{slug}', '{name}', '{desc}', '{host}', {port or 25565}, 'mc_java', 'active', true, {region_str}, {website_url_str}, {discord_url_str}) ON CONFLICT (slug) DO NOTHING;\n")
        
    f.write("\nCOMMIT;\n")

print(f"Successfully generated {sql_file} with {len(rows)} records.")
conn.close()
