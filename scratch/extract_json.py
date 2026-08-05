import re
import json

def extract_to_json(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()
        
    pattern = r'INSERT INTO `([^`]+)`[^\(]*(\(.*?\));'
    # Wait, VALUES could be multiple. Let's capture everything after VALUES
    pattern2 = r'INSERT INTO `([^`]+)`.*?(?:VALUES\s*)(.+?);'
    inserts = re.findall(pattern2, sql, re.IGNORECASE | re.DOTALL)
    
    data = {}
    for table_name, values in inserts:
        data[table_name] = values.strip()
        
    with open("scratch/db_data.json", "w", encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    extract_to_json("teestudio.sql")
