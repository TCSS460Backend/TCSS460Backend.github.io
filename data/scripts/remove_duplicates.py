import csv

def remove_duplicates(file_path):
    """
    Removes duplicate ISBNs from a CSV file in place. Only the first occurrence
    of an ISBN is retained. The CSV is updated directly.
    
    Args:
    - file_path (str): The path to the CSV file to process.
    """
    unique_isbns = set()
    temp_lines = []

    # Read and filter duplicates
    with open(file_path, 'r', newline='', encoding='utf-8') as file:
        reader = csv.reader(file)
        header = next(reader)  # Store header separately
        temp_lines.append(header)  # Add header to the final list

        for line in reader:
            isbn = line[1].strip()  # isbn13 is the second column
            if isbn not in unique_isbns:
                unique_isbns.add(isbn)
                temp_lines.append(line)

    # Write back to the same file
    with open(file_path, 'w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerows(temp_lines)

# Call the function with the path to your CSV
remove_duplicates('../books.csv')