import re

def count_all_tables(file_path):
    with open(file_path, 'r', encoding='utf8') as f:
        content = f.read()

    tables = re.findall(r'CREATE TABLE (?:IF NOT EXISTS )?`([^`]+)`', content)
    inserts = re.findall(r'INSERT INTO `([^`]+)`.*?(?:VALUES\s*|VALUES\n)(.*?);', content, re.DOTALL | re.IGNORECASE)
    
    insert_counts = {}
    for table, values_str in inserts:
        count = values_str.count('\n(') + values_str.count('\n (')
        if count == 0:
             count = values_str.count('),(') + 1
        insert_counts[table] = count
        
    for table in tables:
        count = insert_counts.get(table, 0)
        print(f"Table `{table}`: {count} rows")

if __name__ == '__main__':
    count_all_tables('d:/NguyenThanhHieu/MonHoc_HK_8/LuanVanTotNghiep/code/TeeStudio-project/teestudio.sql')
