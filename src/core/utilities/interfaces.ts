//Required interface types for http RESPONSES
interface IRatings {
    average: number;
    count: number;
    rating_1: number;
    rating_2: number;
    rating_3: number;
    rating_4: number;
    rating_5: number;
}
interface IUrlIcon {
    large: string;
    small: string;
}
interface IBook {
    isbn13: number;
    authors: string;
    publication: number;
    original_title: string;
    title: string;
    ratings: IRatings;
    icons: IUrlIcon;
}

const mapBookToIBook = (book: any): IBook => ({
    isbn13: book.isbn13,
    authors: book.authors,
    publication: book.publication_year,
    original_title: book.original_title,
    title: book.title,
    ratings: {
        average: book.rating_avg,
        count: book.rating_count,
        rating_1: book.rating_1_star,
        rating_2: book.rating_2_star,
        rating_3: book.rating_3_star,
        rating_4: book.rating_4_star,
        rating_5: book.rating_5_star,
    },
    icons: {
        large: book.image_url,
        small: book.image_small_url,
    },
});

export { IRatings, IUrlIcon, IBook, mapBookToIBook };
