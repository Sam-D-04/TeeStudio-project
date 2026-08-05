import re
import sys

def parse_sql(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Find all INSERT INTO statements
    pattern = r'INSERT INTO `([^`]+)`.*?(?:VALUES\s*)(.+?);'
    inserts = re.findall(pattern, sql, re.IGNORECASE | re.DOTALL)
    
    with open("scratch/inserts_summary.txt", "w", encoding='utf-8') as out:
        for table_name, values in inserts:
            out.write(f"Table: {table_name}\n")
            out.write(f"Values (first 100 chars): {values.strip()[:100]}...\n")
            out.write("-" * 40 + "\n")

if __name__ == "__main__":
    parse_sql("teestudio.sql")
