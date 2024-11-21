import csv
from collections import defaultdict

def find_duplicate_isbns(file_path):
    isbn_count = defaultdict(list)  # Dictionary to store line numbers for each ISBN

    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)  # Use DictReader to handle headers
            for line_number, row in enumerate(reader, start=2):  # Start at 2 for line number (account for header)
                isbn = row.get("isbn13")
                if isbn:  # Ensure ISBN is not empty
                    isbn_count[isbn].append(line_number)

        # Find duplicates and log their line numbers
        duplicates_found = False
        print("Duplicate ISBNs found at line numbers:")
        for isbn, lines in isbn_count.items():
            if len(lines) > 1:
                duplicates_found = True
                print(f"ISBN {isbn}: Lines {', '.join(map(str, lines))}")

        if not duplicates_found:
            print("No duplicate ISBNs found.")

    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

# Replace 'books.csv' with the path to your CSV file
find_duplicate_isbns('../books.csv')